"""
CreatorIQ — LangSmith Monitor
Standalone script to view local traces and push summaries to LangSmith.

Usage:
  python langsmith/monitor.py                  # Print summary table
  python langsmith/monitor.py --type claude    # Filter by claude_call
  python langsmith/monitor.py --type rag       # Filter by rag_retrieval
  python langsmith/monitor.py --type n8n       # Filter by n8n_call
  python langsmith/monitor.py --last 10        # Show last 10 traces
  python langsmith/monitor.py --cost           # Cost report only
"""

import json
import sys
import argparse
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# ── Config ────────────────────────────────────────────────────────────────────
RESULTS_DIR   = Path(__file__).parent / "monitoring_results"
DASHBOARD_URL = "https://eu.smith.langchain.com/o/96cec319-5050-4517-b772-baa2b740f46e/projects/p/5eb45e3a-b575-4325-988e-86a59577290f"

# ── ANSI colors ───────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BLUE   = "\033[94m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"


def load_traces(trace_type: str = None, last_n: int = None):
    files = sorted(RESULTS_DIR.glob("*.json"), reverse=True)
    traces = []
    for f in files:
        if trace_type and not f.name.startswith(trace_type):
            continue
        try:
            with open(f, encoding="utf-8") as fp:
                traces.append(json.load(fp))
        except Exception:
            pass
        if last_n and len(traces) >= last_n:
            break
    return traces


def print_summary(traces):
    if not traces:
        print(f"{YELLOW}No traces found in {RESULTS_DIR}{RESET}")
        return

    stats = defaultdict(lambda: {
        "calls": 0, "errors": 0,
        "total_tokens": 0, "total_cost": 0.0, "total_latency": 0.0,
    })

    for t in traces:
        key = t.get("operation") or t.get("workflow") or t.get("type", "unknown")
        s   = stats[key]
        s["calls"] += 1
        if t.get("error"):
            s["errors"] += 1
        s["total_tokens"]  += t.get("total_tokens", 0)
        s["total_cost"]    += t.get("cost_usd", 0.0)
        s["total_latency"] += t.get("latency_ms", 0.0)

    print(f"\n{BOLD}{CYAN}{'='*72}{RESET}")
    print(f"{BOLD}{CYAN}  CreatorIQ — LangSmith Local Trace Summary{RESET}")
    print(f"{CYAN}  Dashboard → {DASHBOARD_URL}{RESET}")
    print(f"{CYAN}  Traces dir → {RESULTS_DIR}{RESET}")
    print(f"{BOLD}{CYAN}{'='*72}{RESET}\n")

    # Table header
    print(f"{BOLD}{'Operation':<35} {'Calls':>6} {'Errors':>7} {'Tokens':>8} {'Cost $':>10} {'Avg ms':>8}{RESET}")
    print("-" * 72)

    total_calls = total_tokens = total_errors = 0
    total_cost = total_latency = 0.0

    for op, s in sorted(stats.items(), key=lambda x: x[1]["calls"], reverse=True):
        success = s["calls"] - s["errors"]
        color   = GREEN if s["errors"] == 0 else (RED if s["errors"] == s["calls"] else YELLOW)
        avg_ms  = s["total_latency"] / max(s["calls"], 1)
        print(
            f"{color}{op:<35}{RESET} "
            f"{s['calls']:>6} "
            f"{RED if s['errors'] > 0 else GREEN}{s['errors']:>7}{RESET} "
            f"{s['total_tokens']:>8,} "
            f"${s['total_cost']:>9.6f} "
            f"{avg_ms:>7.0f}ms"
        )
        total_calls   += s["calls"]
        total_errors  += s["errors"]
        total_tokens  += s["total_tokens"]
        total_cost    += s["total_cost"]
        total_latency += s["total_latency"]

    print("-" * 72)
    print(
        f"{BOLD}{'TOTAL':<35} {total_calls:>6} "
        f"{RED if total_errors > 0 else GREEN}{total_errors:>7}{RESET}{BOLD} "
        f"{total_tokens:>8,} "
        f"${total_cost:>9.6f} "
        f"{(total_latency/max(total_calls,1)):>7.0f}ms{RESET}\n"
    )


def print_trace_detail(trace):
    t_type  = trace.get("type", "unknown")
    status  = trace.get("status", "unknown")
    color   = GREEN if status == "success" else RED
    ts      = trace.get("timestamp", "")

    print(f"\n{color}[{status.upper()}]{RESET} {BOLD}{t_type}{RESET}  {ts}")

    if t_type == "claude_call":
        print(f"  Operation : {trace.get('operation')}")
        print(f"  Model     : {trace.get('model')}")
        print(f"  Tokens    : {trace.get('input_tokens', 0):,} in + {trace.get('output_tokens', 0):,} out = {trace.get('total_tokens', 0):,}")
        print(f"  Cost      : ${trace.get('cost_usd', 0):.6f}")
        print(f"  Latency   : {trace.get('latency_ms', 0):.0f}ms")
        if trace.get("error"):
            print(f"  {RED}Error: {trace['error']}{RESET}")

    elif t_type == "rag_retrieval":
        print(f"  Query     : {trace.get('query_preview', '')[:80]}…")
        print(f"  Found     : {trace.get('documents_found')}/{trace.get('n_results')} docs")
        print(f"  Latency   : {trace.get('latency_ms', 0):.0f}ms")

    elif t_type == "n8n_call":
        print(f"  Workflow  : {trace.get('workflow')}")
        print(f"  Path      : /webhook/{trace.get('webhook_path')}")
        print(f"  Latency   : {trace.get('latency_ms', 0):.0f}ms")
        if trace.get("error"):
            print(f"  {RED}Error: {trace['error']}{RESET}")


def cost_report(traces):
    claude_traces = [t for t in traces if t.get("type") == "claude_call"]
    if not claude_traces:
        print(f"{YELLOW}No Claude traces found.{RESET}")
        return

    total_cost  = sum(t.get("cost_usd", 0)       for t in claude_traces)
    total_in    = sum(t.get("input_tokens", 0)    for t in claude_traces)
    total_out   = sum(t.get("output_tokens", 0)   for t in claude_traces)
    total_calls = len(claude_traces)

    by_op = defaultdict(lambda: {"calls": 0, "cost": 0.0, "tokens": 0})
    for t in claude_traces:
        op = t.get("operation", "unknown")
        by_op[op]["calls"] += 1
        by_op[op]["cost"]  += t.get("cost_usd", 0)
        by_op[op]["tokens"] += t.get("total_tokens", 0)

    print(f"\n{BOLD}{CYAN}{'='*50}{RESET}")
    print(f"{BOLD}{CYAN}  CreatorIQ — Claude Cost Report{RESET}")
    print(f"{BOLD}{CYAN}{'='*50}{RESET}\n")
    print(f"  Total calls   : {total_calls:,}")
    print(f"  Input tokens  : {total_in:,}")
    print(f"  Output tokens : {total_out:,}")
    print(f"  {BOLD}Total cost    : ${total_cost:.6f} USD{RESET}\n")

    print(f"{BOLD}{'Operation':<35} {'Calls':>6} {'Tokens':>8} {'Cost':>12}{RESET}")
    print("-" * 65)
    for op, s in sorted(by_op.items(), key=lambda x: x[1]["cost"], reverse=True):
        print(f"{op:<35} {s['calls']:>6} {s['tokens']:>8,} ${s['cost']:>11.6f}")
    print()


def main():
    parser = argparse.ArgumentParser(description="CreatorIQ LangSmith Monitor")
    parser.add_argument("--type",  help="Filter: claude_call | rag_retrieval | n8n_call")
    parser.add_argument("--last",  type=int, default=200, help="Last N traces to load")
    parser.add_argument("--cost",  action="store_true", help="Show cost report only")
    parser.add_argument("--detail",action="store_true", help="Show each trace in detail")
    args = parser.parse_args()

    traces = load_traces(trace_type=args.type, last_n=args.last)

    if args.cost:
        cost_report(traces)
    elif args.detail:
        for t in traces:
            print_trace_detail(t)
    else:
        print_summary(traces)
        print(f"{BLUE}Tip: Run with --cost for cost breakdown, --detail for per-trace view{RESET}")
        print(f"{BLUE}     Run with --type claude_call | rag_retrieval | n8n_call to filter{RESET}\n")


if __name__ == "__main__":
    main()
