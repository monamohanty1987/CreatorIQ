"""
OpenAI Service (formerly Claude Service)
Integrates with OpenAI GPT models for AI-powered analysis
All calls are traced via LangSmith for monitoring, cost tracking and debugging
"""

import time
import json
import logging
from typing import Optional

from openai import OpenAI, RateLimitError, AuthenticationError, APIError
from config import settings
from services.langsmith_service import monitor, traceable

logger = logging.getLogger(__name__)


class ClaudeService:
    """Service for OpenAI API calls — all operations traced with LangSmith"""

    def __init__(self):
        if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY == "your_openai_api_key_here":
            logger.warning("⚠️  OPENAI_API_KEY not set. OpenAI features will fail.")
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model_default = "gpt-4o"  # Default model for complex tasks
        self.model_mini = "gpt-4o-mini"  # Lightweight model for simple tasks

    def detect_contract_complexity(self, contract_text: str) -> str:
        """
        Detect contract complexity using heuristics.
        Returns 'simple' or 'complex' to determine which model to use.

        Simple contracts: Use gpt-4o-mini (cheaper)
        Complex contracts: Use gpt-4o (better quality)
        """
        # Heuristic 1: Page count (rough estimate: 50 chars per line, 40 lines per page)
        est_pages = len(contract_text) / 2000

        # Heuristic 2: Keyword complexity
        complex_keywords = [
            "indemnification", "arbitration", "force majeure", "intellectual property",
            "confidentiality clause", "non-compete", "breach of contract",
            "liability", "warranties", "representations", "covenant"
        ]
        keyword_count = sum(1 for kw in complex_keywords if kw.lower() in contract_text.lower())

        # Heuristic 3: Clause count (look for numbered sections)
        clause_count = contract_text.count("Section") + contract_text.count("Clause") + contract_text.count("Article")

        # Decision logic
        complexity_score = (est_pages * 0.4) + (keyword_count * 1.5) + (clause_count * 0.3)

        if complexity_score > 10:
            logger.info(f"🔴 Contract detected as COMPLEX (score: {complexity_score:.1f})")
            return "complex"
        else:
            logger.info(f"🟢 Contract detected as SIMPLE (score: {complexity_score:.1f})")
            return "simple"

    # ── Contract Analysis ─────────────────────────────────────────────────────

    @traceable(name="analyze_contract_with_rag", run_type="llm", tags=["deal_navigator", "rag", "openai", "education"])
    def analyze_contract_with_rag(
        self,
        contract_text: str,
        creator_name: str,
        brand_name: str,
        retrieved_documents: Optional[list] = None,
        contract_type: str = "brand-sponsorship",
        n8n_context: Optional[dict] = None,
    ) -> dict:
        """
        Deal Navigator: Educational contract explanation for creators.
        Uses OpenAI GPT to explain contract terms in simple language with RAG + n8n context.
        Traced to LangSmith with token counts and cost.

        NOT legal advice - always consult a qualified lawyer before signing.

        Flow:
          n8n O3 → extracts clauses & flags risky keywords → passes context here
          GPT-4o → uses n8n context + RAG docs → produces educational explanation
        """
        # Detect complexity to choose model
        complexity = self.detect_contract_complexity(contract_text)
        model = self.model_mini if complexity == "simple" else self.model_default

        # Build RAG context string
        rag_context = ""
        if retrieved_documents:
            rag_context = "\n\nRELEVANT KNOWLEDGE BASE:\n"
            for doc in retrieved_documents:
                rag_context += f"\n---\n{doc}\n"

        # Build n8n pre-analysis context (if n8n responded with data)
        n8n_section = ""
        if n8n_context and isinstance(n8n_context, dict):
            clauses = n8n_context.get("clauses_found", [])
            risk_keywords = n8n_context.get("risk_keywords", [])
            summary = n8n_context.get("contract_summary", "")
            if clauses or risk_keywords or summary:
                n8n_section = "\n\nPRE-ANALYSIS FROM CONTRACT PARSER:\n"
                if summary:
                    n8n_section += f"Contract Summary: {summary}\n"
                if clauses:
                    n8n_section += f"Key Clauses Identified: {', '.join(clauses)}\n"
                if risk_keywords:
                    n8n_section += f"Terms Needing Attention: {', '.join(risk_keywords)}\n"

        # Educational system prompt for Deal Navigator
        system_prompt = """You are an educational assistant helping content creators understand contracts in plain, simple language.

IMPORTANT: You are providing educational information ONLY — NOT legal advice.

Your role:
- Explain what contract terms mean in simple words any creator can understand
- Highlight what creators typically ask about for this type of agreement
- Suggest open-ended questions the creator could bring to a lawyer
- Never give legal conclusions, verdicts, or sign/don't-sign recommendations

Tone guidelines:
- Say "This clause means..." instead of "This clause is bad/good"
- Say "Creators often ask about..." instead of "You should be worried about..."
- Say "You might want to ask a lawyer whether..." instead of "You need a lawyer to fix this"
- Be encouraging and empowering, not alarming
- Keep language simple — no legal jargon unless you immediately explain it

Always end your response with:
⚖️ DISCLAIMER: This is educational information only. Always consult a qualified legal professional before signing any contract."""

        prompt = f"""Contract Type: {contract_type}
Creator Name: {creator_name}
Brand Name: {brand_name}
{n8n_section}
CONTRACT TEXT:
{contract_text}
{rag_context}

Please provide an educational breakdown with these 4 sections:

1. 📋 PLAIN LANGUAGE SUMMARY
   What are the main things this contract is saying, in simple words?

2. ❓ WHAT CREATORS OFTEN ASK ABOUT
   What are the 3-4 most common questions creators have about {contract_type} agreements like this one?

3. 💬 QUESTIONS TO BRING TO YOUR LAWYER
   What are 2-3 open-ended questions {creator_name} could bring to a lawyer about this specific contract?

4. 🔍 KEY TERMS EXPLAINED
   Define in plain language any important terms found in this contract (e.g. exclusivity, IP rights, payment terms, termination, non-compete, arbitration).

Format clearly with the section headers shown above."""

        start = time.time()
        error_msg = None
        analysis = {}

        try:
            message = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.7,
            )

            latency_ms = (time.time() - start) * 1000
            response_text = message.choices[0].message.content if message.choices else ""
            input_tokens = message.usage.prompt_tokens
            output_tokens = message.usage.completion_tokens

            logger.info(f"✅ Deal Navigator explanation completed for {brand_name} (model: {model})")

            try:
                analysis = json.loads(response_text)
            except Exception:
                analysis = {"explanation": response_text}

            # Log to LangSmith + local file
            monitor.log_claude_call(
                operation="deal_navigator_explanation",
                model=model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                inputs={
                    "creator_name": creator_name,
                    "brand_name": brand_name,
                    "contract_type": contract_type,
                    "contract_preview": contract_text[:300],
                    "rag_docs_count": len(retrieved_documents) if retrieved_documents else 0,
                    "n8n_context_used": bool(n8n_context and n8n_context != {}),
                },
                outputs={"educational_explanation_provided": True},
                metadata={
                    "model": model,
                    "rag_used": bool(retrieved_documents),
                    "contract_type": contract_type,
                    "complexity": complexity,
                    "n8n_clauses_found": len(n8n_context.get("clauses_found", [])) if n8n_context else 0,
                },
            )

            return analysis

        except (RateLimitError, AuthenticationError, APIError) as e:
            error_msg = str(e)
            latency_ms = (time.time() - start) * 1000
            monitor.log_claude_call(
                operation="analyze_contract_with_rag",
                model=model,
                input_tokens=0,
                output_tokens=0,
                latency_ms=latency_ms,
                inputs={"creator_name": creator_name, "brand_name": brand_name},
                outputs={},
                error=error_msg,
            )
            logger.error(f"❌ OpenAI API error: {error_msg}")
            raise
        except Exception as e:
            error_msg = str(e)
            latency_ms = (time.time() - start) * 1000
            monitor.log_claude_call(
                operation="analyze_contract_with_rag",
                model=model,
                input_tokens=0,
                output_tokens=0,
                latency_ms=latency_ms,
                inputs={"creator_name": creator_name, "brand_name": brand_name},
                outputs={},
                error=error_msg,
            )
            logger.error(f"❌ OpenAI error: {error_msg}")
            raise

    # ── Insights Generation ───────────────────────────────────────────────────

    @traceable(name="generate_insights", run_type="llm", tags=["insights", "openai"])
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
            message = self.client.chat.completions.create(
                model=self.model_mini,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7,
            )

            latency_ms = (time.time() - start) * 1000
            insights = message.choices[0].message.content if message.choices else ""
            input_tokens = message.usage.prompt_tokens
            output_tokens = message.usage.completion_tokens

            monitor.log_claude_call(
                operation="generate_insights",
                model=self.model_mini,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                inputs={"data_type": data_type},
                outputs={"insights_preview": insights[:200]},
                metadata={"model": self.model_mini},
            )

            logger.info(f"✅ Generated insights for {data_type}")
            return insights

        except Exception as e:
            error_msg = str(e)
            latency_ms = (time.time() - start) * 1000
            monitor.log_claude_call(
                operation="generate_insights",
                model=self.model_mini,
                input_tokens=0,
                output_tokens=0,
                latency_ms=latency_ms,
                inputs={"data_type": data_type},
                outputs={},
                error=error_msg,
            )
            logger.error(f"❌ OpenAI insights generation failed: {error_msg}")
            raise

    # ── Deal Rate Analysis (direct OpenAI fallback) ───────────────────────────

    @traceable(name="analyze_deal_rate", run_type="llm", tags=["deal", "openai"])
    def analyze_deal_rate(
        self,
        niche: str,
        platform: str,
        followers: int,
        offered_rate: float,
        format: str = "post",
    ) -> dict:
        """
        Direct OpenAI analysis for deal rate benchmarking.
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
            message = self.client.chat.completions.create(
                model=self.model_default,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.7,
            )

            latency_ms = (time.time() - start) * 1000
            response_text = message.choices[0].message.content if message.choices else ""
            input_tokens = message.usage.prompt_tokens
            output_tokens = message.usage.completion_tokens

            try:
                result = json.loads(response_text)
            except Exception:
                result = {"analysis": response_text}

            monitor.log_claude_call(
                operation="analyze_deal_rate",
                model=self.model_default,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                inputs={
                    "niche": niche, "platform": platform,
                    "followers": followers, "offered_rate": offered_rate, "format": format,
                },
                outputs={"verdict": result.get("verdict", "UNKNOWN")},
                metadata={"model": self.model_default, "source": "direct_openai"},
            )

            logger.info(f"✅ OpenAI deal rate analysis done")
            return result

        except Exception as e:
            error_msg = str(e)
            latency_ms = (time.time() - start) * 1000
            monitor.log_claude_call(
                operation="analyze_deal_rate",
                model=self.model_default,
                input_tokens=0,
                output_tokens=0,
                latency_ms=latency_ms,
                inputs={"niche": niche, "platform": platform},
                outputs={},
                error=error_msg,
            )
            logger.error(f"❌ OpenAI deal rate analysis failed: {error_msg}")
            raise

    # ── Campaign Content Generation ───────────────────────────────────────────

    @traceable(name="generate_campaign_content", run_type="llm", tags=["campaign", "openai"])
    def generate_campaign_content(
        self,
        product_name: str,
        creator_name: str,
        creator_niche: str,
        launch_date: str,
    ) -> dict:
        """
        Generate campaign content ideas using OpenAI.
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
            message = self.client.chat.completions.create(
                model=self.model_default,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.7,
            )

            latency_ms = (time.time() - start) * 1000
            response_text = message.choices[0].message.content if message.choices else ""
            input_tokens = message.usage.prompt_tokens
            output_tokens = message.usage.completion_tokens

            try:
                result = json.loads(response_text)
            except Exception:
                result = {"content": response_text}

            monitor.log_claude_call(
                operation="generate_campaign_content",
                model=self.model_default,
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
                metadata={"model": self.model_default},
            )

            return result

        except Exception as e:
            error_msg = str(e)
            latency_ms = (time.time() - start) * 1000
            monitor.log_claude_call(
                operation="generate_campaign_content",
                model=self.model_default,
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
