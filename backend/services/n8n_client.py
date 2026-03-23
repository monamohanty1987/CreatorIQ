"""
n8n Webhook Client
Orchestrates calls to n8n workflows via HTTP webhooks
All webhook calls are traced via LangSmith for latency and error monitoring
"""

import time
import httpx
import json
from typing import Dict, Any, Optional
from config import settings
from services.langsmith_service import monitor, traceable
import logging

logger = logging.getLogger(__name__)


class N8nClient:
    """Client for calling n8n webhooks — all calls traced with LangSmith"""

    def __init__(self):
        self.base_url = settings.N8N_BASE_URL
        self.timeout  = settings.N8N_TIMEOUT

    @traceable(name="n8n_call_webhook", run_type="tool", tags=["n8n", "webhook"])
    async def call_webhook(
        self,
        webhook_path: str,
        payload: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Call an n8n webhook and return the response.
        Traced to LangSmith with latency, inputs and outputs.
        """
        url   = f"{self.base_url}/webhook/{webhook_path}"
        start = time.time()

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()

                # n8n sometimes returns 200 with an empty body (workflow has no Respond node output)
                if not response.content or not response.text.strip():
                    logger.warning(f"⚠️  n8n {webhook_path} returned empty body — using fallback")
                    return None

                result     = response.json()
                latency_ms = (time.time() - start) * 1000

                monitor.log_n8n_call(
                    workflow=webhook_path,
                    webhook_path=webhook_path,
                    latency_ms=latency_ms,
                    inputs=payload,
                    outputs=result,
                )
                return result

        except json.JSONDecodeError as e:
            latency_ms = (time.time() - start) * 1000
            monitor.log_n8n_call(
                workflow=webhook_path, webhook_path=webhook_path,
                latency_ms=latency_ms, inputs=payload,
                error=f"JSONDecodeError: {str(e)}",
            )
            logger.warning(f"⚠️  JSON decode error from n8n {webhook_path}: {str(e)} — returning None for fallback")
            return None

        except httpx.RequestError as e:
            latency_ms = (time.time() - start) * 1000
            monitor.log_n8n_call(
                workflow=webhook_path, webhook_path=webhook_path,
                latency_ms=latency_ms, inputs=payload,
                error=f"RequestError: {str(e)}",
            )
            logger.warning(f"⚠️  n8n unreachable ({webhook_path}): {str(e)} — using fallback")
            return None
        except Exception as e:
            latency_ms = (time.time() - start) * 1000
            monitor.log_n8n_call(
                workflow=webhook_path, webhook_path=webhook_path,
                latency_ms=latency_ms, inputs=payload,
                error=str(e),
            )
            logger.error(f"❌ Unexpected error calling n8n {webhook_path}: {str(e)}")
            raise

    async def analyze_brand_deal(
        self,
        niche: str,
        platform: str,
        followers: int,
        offered_rate_usd: float,
        format: str = "post"
    ) -> Dict[str, Any]:
        """
        Call O4 Brand Deal Rate Checker workflow

        Returns: {
            "input": {...},
            "analysis": {
                "market_rate_usd": 3500,
                "gap_usd": -500,
                "gap_pct": -12.5,
                "verdict": "BELOW_MARKET",
                ...
            }
        }
        """
        payload = {
            "body": {
                "niche": niche,
                "platform": platform,
                "followers": followers,
                "offered_rate_usd": offered_rate_usd,
                "format": format
            }
        }

        logger.info(f"Calling n8n O4 Brand Deal Checker: {json.dumps(payload, indent=2)}")
        result = await self.call_webhook("brand-deal-check", payload)
        logger.info(f"n8n O4 response: {json.dumps(result, indent=2)}")
        return result

    async def analyze_contract(
        self,
        contract_text: str,
        creator_name: str,
        creator_niche: str,
        deal_value: float,
        brand_name: str
    ) -> Dict[str, Any]:
        """
        Call O3 Contract Analysis workflow

        Returns: {
            "analysis": {
                "contract_health": {
                    "score": 65,
                    "verdict": "NEGOTIATE",
                    ...
                },
                "red_flags": [...],
                ...
            }
        }
        """
        payload = {
            "body": {
                "contract_text": contract_text,
                "creator_name": creator_name,
                "creator_niche": creator_niche,
                "deal_value": deal_value,
                "brand_name": brand_name
            }
        }

        logger.info(f"Calling n8n O3 Contract Analysis for {brand_name}")
        result = await self.call_webhook("analyse-contract", payload)
        logger.info(f"n8n O3 response received")
        return result

    async def generate_campaign(
        self,
        product_name: str,
        product_price: float,
        product_type: str,
        creator_name: str,
        creator_niche: str,
        launch_date: str,
        subscriber_count: int
    ) -> Dict[str, Any]:
        """
        Call O1 Product Launch Email Sequence workflow

        Returns: {
            "campaign_id": "LAUNCH-...",
            "emails_queued": 5,
            "first_send": "2026-03-20",
            "last_send": "2026-04-18",
            ...
        }
        """
        payload = {
            "body": {
                "product_name": product_name,
                "product_price": product_price,
                "product_type": product_type,
                "creator_name": creator_name,
                "creator_niche": creator_niche,
                "launch_date": launch_date,
                "subscriber_count": subscriber_count
            }
        }

        logger.info(f"Calling n8n O1 Product Launch Campaign for {product_name}")
        result = await self.call_webhook("product-launch", payload)
        logger.info(f"n8n O1 response received")
        return result


# Singleton instance
n8n_client = N8nClient()
