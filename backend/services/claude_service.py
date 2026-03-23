"""
Claude API Service
Integrates with Anthropic Claude for AI-powered analysis
All calls are traced via LangSmith for monitoring, cost tracking and debugging
"""

import time
import json
import logging
from typing import Optional

from anthropic import Anthropic
from config import settings
from services.langsmith_service import monitor, traceable

logger = logging.getLogger(__name__)


class ClaudeService:
    """Service for Claude API calls — all operations traced with LangSmith"""

    def __init__(self):
        if not settings.ANTHROPIC_API_KEY or settings.ANTHROPIC_API_KEY == "your_anthropic_api_key_here":
            logger.warning("⚠️  ANTHROPIC_API_KEY not set. Claude features will fail.")
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model  = settings.CLAUDE_MODEL

    # ── Contract Analysis ─────────────────────────────────────────────────────

    @traceable(name="analyze_contract_with_rag", run_type="llm", tags=["contract", "rag", "claude"])
    def analyze_contract_with_rag(
        self,
        contract_text: str,
        creator_name: str,
        brand_name: str,
        retrieved_documents: Optional[list] = None,
    ) -> dict:
        """
        Use Claude to analyze a contract with RAG context.
        Traced to LangSmith with token counts and cost.
        """
        # Build RAG context string
        rag_context = ""
        if retrieved_documents:
            rag_context = "\n\nRELEVANT KNOWLEDGE BASE:\n"
            for doc in retrieved_documents:
                rag_context += f"\n---\n{doc}\n"

        prompt = f"""You are an expert contract lawyer specializing in creator economy deals.

Analyze this contract for {creator_name} with {brand_name}.

CONTRACT TEXT:
{contract_text}
{rag_context}

Provide a detailed analysis including:
1. Overall risk assessment (LOW/MEDIUM/HIGH/CRITICAL)
2. Identified red flags (specific clause issues)
3. FTC compliance check
4. Specific recommendations
5. Suggested edits or counter-proposals

Format your response as valid JSON."""

        start = time.time()
        error_msg = None
        analysis = {}

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}],
            )

            latency_ms = (time.time() - start) * 1000
            response_text = message.content[0].text
            input_tokens  = message.usage.input_tokens
            output_tokens = message.usage.output_tokens

            logger.info(f"✅ Claude contract analysis done for {brand_name}")

            try:
                analysis = json.loads(response_text)
            except Exception:
                analysis = {"analysis": response_text}

            # Log to LangSmith + local file
            monitor.log_claude_call(
                operation="analyze_contract_with_rag",
                model=self.model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                inputs={
                    "creator_name": creator_name,
                    "brand_name":   brand_name,
                    "contract_preview": contract_text[:300],
                    "rag_docs_count": len(retrieved_documents) if retrieved_documents else 0,
                },
                outputs={"risk_level": analysis.get("risk_level", "UNKNOWN"),
                         "red_flags_count": len(analysis.get("red_flags", []))},
                metadata={"model": self.model, "rag_used": bool(retrieved_documents)},
            )

            return analysis

        except Exception as e:
            error_msg = str(e)
            latency_ms = (time.time() - start) * 1000
            monitor.log_claude_call(
                operation="analyze_contract_with_rag",
                model=self.model,
                input_tokens=0,
                output_tokens=0,
                latency_ms=latency_ms,
                inputs={"creator_name": creator_name, "brand_name": brand_name},
                outputs={},
                error=error_msg,
            )
            logger.error(f"❌ Claude API error: {error_msg}")
            raise

    # ── Insights Generation ───────────────────────────────────────────────────

    @traceable(name="generate_insights", run_type="llm", tags=["insights", "claude"])
    def generate_insights(self, data_type: str, data: dict) -> str:
        """
        Generate AI insights from analysis data.
        Traced to LangSmith with token counts and cost.
        """
        prompt = f"""Based on this {data_type} data, provide 2-3 key insights for a creator:

Data: {str(data)}

Be concise, actionable, and specific. Assume the creator has no legal background."""

        start = time.time()
        error_msg = None

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}],
            )

            latency_ms    = (time.time() - start) * 1000
            insights      = message.content[0].text
            input_tokens  = message.usage.input_tokens
            output_tokens = message.usage.output_tokens

            monitor.log_claude_call(
                operation="generate_insights",
                model=self.model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                inputs={"data_type": data_type},
                outputs={"insights_preview": insights[:200]},
                metadata={"model": self.model},
            )

            logger.info(f"✅ Generated insights for {data_type}")
            return insights

        except Exception as e:
            error_msg = str(e)
            latency_ms = (time.time() - start) * 1000
            monitor.log_claude_call(
                operation="generate_insights",
                model=self.model,
                input_tokens=0,
                output_tokens=0,
                latency_ms=latency_ms,
                inputs={"data_type": data_type},
                outputs={},
                error=error_msg,
            )
            logger.error(f"❌ Claude insights generation failed: {error_msg}")
            raise

    # ── Deal Rate Analysis (direct Claude fallback) ───────────────────────────

    @traceable(name="analyze_deal_rate", run_type="llm", tags=["deal", "claude"])
    def analyze_deal_rate(
        self,
        niche: str,
        platform: str,
        followers: int,
        offered_rate: float,
        format: str = "post",
    ) -> dict:
        """
        Direct Claude analysis for deal rate benchmarking.
        Used as fallback when n8n is unavailable.
        """
        prompt = f"""You are an expert in creator economy brand deals.

A creator in the {niche} niche on {platform} with {followers:,} followers
has been offered ${offered_rate:,.2f} for a {format}.

Provide a market rate analysis:
1. Is the offered rate BELOW_MARKET, AT_MARKET, or ABOVE_MARKET?
2. What is the market rate range?
3. What counter-offer should they make?
4. List 3 talking points for negotiation.

Return valid JSON only."""

        start = time.time()
        error_msg = None

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=800,
                messages=[{"role": "user", "content": prompt}],
            )

            latency_ms    = (time.time() - start) * 1000
            response_text = message.content[0].text
            input_tokens  = message.usage.input_tokens
            output_tokens = message.usage.output_tokens

            try:
                result = json.loads(response_text)
            except Exception:
                result = {"analysis": response_text}

            monitor.log_claude_call(
                operation="analyze_deal_rate",
                model=self.model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                inputs={
                    "niche": niche, "platform": platform,
                    "followers": followers, "offered_rate": offered_rate, "format": format,
                },
                outputs={"verdict": result.get("verdict", "UNKNOWN")},
                metadata={"model": self.model, "source": "direct_claude"},
            )

            logger.info(f"✅ Claude deal rate analysis done")
            return result

        except Exception as e:
            error_msg = str(e)
            latency_ms = (time.time() - start) * 1000
            monitor.log_claude_call(
                operation="analyze_deal_rate",
                model=self.model,
                input_tokens=0,
                output_tokens=0,
                latency_ms=latency_ms,
                inputs={"niche": niche, "platform": platform},
                outputs={},
                error=error_msg,
            )
            logger.error(f"❌ Claude deal rate analysis failed: {error_msg}")
            raise

    # ── Campaign Content Generation ───────────────────────────────────────────

    @traceable(name="generate_campaign_content", run_type="llm", tags=["campaign", "claude"])
    def generate_campaign_content(
        self,
        product_name: str,
        creator_name: str,
        creator_niche: str,
        launch_date: str,
    ) -> dict:
        """
        Generate campaign content ideas using Claude.
        Traced to LangSmith.
        """
        prompt = f"""You are a content strategist for creator brands.

Creator: {creator_name} | Niche: {creator_niche}
Product: {product_name} | Launch Date: {launch_date}

Generate a 5-email launch sequence strategy with:
1. Subject lines for each email
2. Key message per email
3. CTA for each email
4. Optimal send timing

Return valid JSON."""

        start = time.time()
        error_msg = None

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt}],
            )

            latency_ms    = (time.time() - start) * 1000
            response_text = message.content[0].text
            input_tokens  = message.usage.input_tokens
            output_tokens = message.usage.output_tokens

            try:
                result = json.loads(response_text)
            except Exception:
                result = {"content": response_text}

            monitor.log_claude_call(
                operation="generate_campaign_content",
                model=self.model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                inputs={
                    "product_name": product_name,
                    "creator_name": creator_name,
                    "creator_niche": creator_niche,
                    "launch_date": launch_date,
                },
                outputs={"emails_generated": len(result.get("emails", []))},
                metadata={"model": self.model},
            )

            return result

        except Exception as e:
            error_msg = str(e)
            latency_ms = (time.time() - start) * 1000
            monitor.log_claude_call(
                operation="generate_campaign_content",
                model=self.model,
                input_tokens=0,
                output_tokens=0,
                latency_ms=latency_ms,
                inputs={"product_name": product_name},
                outputs={},
                error=error_msg,
            )
            logger.error(f"❌ Campaign content generation failed: {error_msg}")
            raise


# Singleton instance
claude_service = ClaudeService()
