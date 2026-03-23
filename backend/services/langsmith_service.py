"""
LangSmith Monitoring Service
Tracks all AI calls, RAG retrievals, and n8n workflow executions
EU instance: https://eu.smith.langchain.com
"""

import os
import json
import logging
from datetime import datetime
from typing import Any, Dict, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Cost constants (USD per 1M tokens) ───────────────────────────────────────
CLAUDE_COSTS = {
    "claude-3-5-sonnet-20241022": {"input": 3.00,  "output": 15.00},
    "claude-3-opus-20240229":     {"input": 15.00, "output": 75.00},
    "claude-3-haiku-20240307":    {"input": 0.25,  "output": 1.25},
}

# ── Local results directory ───────────────────────────────────────────────────
RESULTS_DIR = Path(__file__).parent.parent.parent / "langsmith" / "monitoring_results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)


def _configure_langsmith() -> bool:
    """
    Set LangSmith environment variables at runtime.
    Supports both LANGCHAIN_ENDPOINT and LANGSMITH_ENDPOINT env var names.
    Returns True if tracing is enabled.
    """
    from config import settings

    # Resolve endpoint — prefer LANGSMITH_ENDPOINT (user's .env key), fall back to LANGCHAIN_ENDPOINT
    endpoint = (
        settings.LANGSMITH_ENDPOINT
        or settings.LANGCHAIN_ENDPOINT
        or "https://eu.api.smith.langchain.com"
    )
    # The langsmith SDK reads LANGCHAIN_ENDPOINT
    os.environ["LANGCHAIN_ENDPOINT"]    = endpoint
    os.environ["LANGSMITH_ENDPOINT"]    = endpoint  # set both for safety
    os.environ["LANGCHAIN_TRACING_V2"]  = settings.LANGCHAIN_TRACING_V2
    os.environ["LANGCHAIN_PROJECT"]     = settings.LANGCHAIN_PROJECT or "CreatorIQ"

    api_key = settings.LANGCHAIN_API_KEY
    if api_key and api_key not in ("", "your_langsmith_api_key_here"):
        os.environ["LANGCHAIN_API_KEY"] = api_key
        enabled = settings.LANGCHAIN_TRACING_V2.lower() == "true"
        if enabled:
            logger.info(f"✅ LangSmith tracing ENABLED → {endpoint}")
        return enabled

    logger.warning("⚠️  LANGCHAIN_API_KEY not set — LangSmith tracing disabled (local logging only)")
    return False


# Configure at import time
TRACING_ENABLED = _configure_langsmith()


def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    """Calculate USD cost for a Claude API call."""
    prices = CLAUDE_COSTS.get(model, {"input": 3.00, "output": 15.00})
    cost = (input_tokens * prices["input"] + output_tokens * prices["output"]) / 1_000_000
    return round(cost, 6)


def save_trace_locally(trace: Dict[str, Any]) -> str:
    """
    Save a trace record to a JSON file in monitoring_results/.
    Returns the file path.
    """
    timestamp  = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")
    trace_type = trace.get("type", "unknown")
    filename   = RESULTS_DIR / f"{trace_type}_{timestamp}.json"

    trace["saved_at"] = datetime.utcnow().isoformat()
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(trace, f, indent=2, default=str)

    logger.info(f"📁 Trace saved locally → {filename.name}")
    return str(filename)


def get_tracer():
    """
    Return a LangSmith Client if tracing is enabled, else None.
    Used for manual run creation where @traceable doesn't apply.
    """
    if not TRACING_ENABLED:
        return None
    try:
        from langsmith import Client
        return Client()
    except Exception as e:
        logger.warning(f"LangSmith client init failed: {e}")
        return None


# ── Traceable wrappers ────────────────────────────────────────────────────────

def traceable(name: str = None, run_type: str = "chain", tags: list = None):
    """
    Decorator factory that wraps a function with LangSmith tracing.
    Falls back gracefully when tracing is disabled or the SDK is unavailable.
    """
    def decorator(func):
        if not TRACING_ENABLED:
            return func   # no-op passthrough
        try:
            from langsmith import traceable as ls_traceable
            return ls_traceable(
                name=name or func.__name__,
                run_type=run_type,
                tags=tags or [],
            )(func)
        except ImportError:
            logger.warning("langsmith not installed — tracing disabled")
            return func
    return decorator


# ── Monitoring helpers used inside services ───────────────────────────────────

class LangSmithMonitor:
    """
    Helper class used by ClaudeService, RAGService, and N8nClient
    to log structured traces both to LangSmith and locally.
    """

    @staticmethod
    def log_claude_call(
        operation: str,
        model: str,
        input_tokens: int,
        output_tokens: int,
        latency_ms: float,
        inputs: Dict,
        outputs: Dict,
        metadata: Optional[Dict] = None,
        error: Optional[str] = None,
    ) -> Dict:
        cost = calculate_cost(model, input_tokens, output_tokens)
        trace = {
            "type":          "claude_call",
            "operation":     operation,
            "model":         model,
            "input_tokens":  input_tokens,
            "output_tokens": output_tokens,
            "total_tokens":  input_tokens + output_tokens,
            "cost_usd":      cost,
            "latency_ms":    round(latency_ms, 2),
            "inputs":        inputs,
            "outputs":       outputs,
            "metadata":      metadata or {},
            "error":         error,
            "timestamp":     datetime.utcnow().isoformat(),
            "status":        "error" if error else "success",
        }
        save_trace_locally(trace)

        logger.info(
            f"🤖 Claude [{operation}] | {input_tokens}+{output_tokens} tokens "
            f"| ${cost:.6f} | {latency_ms:.0f}ms | {'❌' if error else '✅'}"
        )
        return trace

    @staticmethod
    def log_rag_retrieval(
        query: str,
        n_results: int,
        documents_found: int,
        latency_ms: float,
        metadata: Optional[Dict] = None,
    ) -> Dict:
        trace = {
            "type":            "rag_retrieval",
            "query_preview":   query[:200],
            "n_results":       n_results,
            "documents_found": documents_found,
            "latency_ms":      round(latency_ms, 2),
            "metadata":        metadata or {},
            "timestamp":       datetime.utcnow().isoformat(),
            "status":          "success",
        }
        save_trace_locally(trace)

        logger.info(
            f"🔍 RAG retrieval | query={query[:60]}… | "
            f"found={documents_found}/{n_results} | {latency_ms:.0f}ms"
        )
        return trace

    @staticmethod
    def log_n8n_call(
        workflow: str,
        webhook_path: str,
        latency_ms: float,
        inputs: Dict,
        outputs: Optional[Dict] = None,
        error: Optional[str] = None,
    ) -> Dict:
        trace = {
            "type":         "n8n_call",
            "workflow":     workflow,
            "webhook_path": webhook_path,
            "latency_ms":   round(latency_ms, 2),
            "inputs":       inputs,
            "outputs":      outputs,
            "error":        error,
            "timestamp":    datetime.utcnow().isoformat(),
            "status":       "error" if error else "success",
        }
        save_trace_locally(trace)

        logger.info(
            f"⚡ n8n [{workflow}] → /webhook/{webhook_path} "
            f"| {latency_ms:.0f}ms | {'❌ ' + error if error else '✅'}"
        )
        return trace


# Singleton
monitor = LangSmithMonitor()
