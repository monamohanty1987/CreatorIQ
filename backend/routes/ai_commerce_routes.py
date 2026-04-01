"""
AI-Powered Commerce Scripts Routes
Generates customized product promotion scripts for creators
All OpenAI calls are traced via LangSmith for monitoring and cost tracking
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from config import settings
from openai import OpenAI, APIError, RateLimitError, AuthenticationError
import logging
from datetime import datetime as dt
import time
from services.langsmith_service import monitor, traceable, TRACING_ENABLED

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ai-commerce", tags=["ai-commerce"])

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Request/Response Models
class CommerceScriptRequest(BaseModel):
    product_name: str
    benefits: list[str]  # List of 2-3 benefits
    discount_code: str
    content_type: str  # Tutorial, Review, How-To, Q&A, Vlog
    tone: str  # Authentic, Educational, Humorous, Professional

class CommerceScriptResponse(BaseModel):
    success: bool
    intro: str
    midpoint: str
    outro: str
    full_script: str
    content_type: str
    tone: str
    timestamp: str

@traceable(name="generate_commerce_script", run_type="llm", tags=["commerce-script", "openai", "gpt-4o-mini"])
@router.post("/generate-script")
async def generate_commerce_script(request: CommerceScriptRequest):
    """
    Generate AI-powered commerce script for creators

    Args:
        product_name: Name of the product
        benefits: 2-3 key benefits of the product
        discount_code: Discount code to offer
        content_type: Tutorial, Review, How-To, Q&A, or Vlog
        tone: Authentic, Educational, Humorous, or Professional

    Returns:
        Intro, Midpoint, Outro sections + full script
    """

    try:
        # Validate input
        if not request.product_name or not request.product_name.strip():
            raise HTTPException(status_code=400, detail="Product name is required")

        if len(request.benefits) < 2:
            raise HTTPException(status_code=400, detail="At least 2 benefits are required")

        if not request.discount_code or not request.discount_code.strip():
            raise HTTPException(status_code=400, detail="Discount code is required")

        valid_content_types = ['Tutorial', 'Review', 'How-To', 'Q&A', 'Vlog']
        if request.content_type not in valid_content_types:
            raise HTTPException(
                status_code=400,
                detail=f"Content type must be one of: {', '.join(valid_content_types)}"
            )

        valid_tones = ['Authentic', 'Educational', 'Humorous', 'Professional']
        if request.tone not in valid_tones:
            raise HTTPException(
                status_code=400,
                detail=f"Tone must be one of: {', '.join(valid_tones)}"
            )

        # Build the prompt
        benefits_text = ", ".join(request.benefits)

        system_prompt = """You are an expert copywriter specializing in creating authentic, engaging product placements for content creators.
Your goal is to help creators naturally integrate products into their content while maintaining their unique voice.
Always output exactly 3 labeled sections: INTRO, MIDPOINT, OUTRO.
Keep language conversational and genuine - never salesy or pushy."""

        user_prompt = f"""Generate a product promotion script for a creator with these details:

Product: {request.product_name}
Key Benefits: {benefits_text}
Discount Code: {request.discount_code}
Content Type: {request.content_type}
Tone: {request.tone}

Requirements:
- INTRO: 2-3 sentences that hook the audience and naturally introduce the topic. Mention the product lightly.
- MIDPOINT: Natural product integration. Highlight 1-2 benefits, share why you use it, and mention the discount code naturally.
- OUTRO: Clear call-to-action with the discount code and a closing line that encourages engagement.

Generate the script now with these exact section labels:
INTRO:
[content]

MIDPOINT:
[content]

OUTRO:
[content]"""

        logger.info(f"Generating commerce script for {request.product_name} ({request.content_type}, {request.tone})")

        start_time = time.time()
        error_msg = None
        response = None

        try:
            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )

            latency_ms = (time.time() - start_time) * 1000
            script_text = response.choices[0].message.content
            input_tokens = response.usage.prompt_tokens
            output_tokens = response.usage.completion_tokens

            # Log to LangSmith
            monitor.log_claude_call(
                operation="generate_commerce_script",
                model="gpt-4o-mini",
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms,
                inputs={
                    "product_name": request.product_name,
                    "benefits_count": len(request.benefits),
                    "content_type": request.content_type,
                    "tone": request.tone,
                },
                outputs={"sections_generated": 3},  # INTRO, MIDPOINT, OUTRO
                metadata={"model": "gpt-4o-mini", "content_type": request.content_type, "tone": request.tone},
            )

        except Exception as e:
            error_msg = str(e)
            latency_ms = (time.time() - start_time) * 1000
            monitor.log_claude_call(
                operation="generate_commerce_script",
                model="gpt-4o-mini",
                input_tokens=0,
                output_tokens=0,
                latency_ms=latency_ms,
                inputs={"product_name": request.product_name},
                outputs={},
                error=error_msg,
            )
            raise

        # Parse the response into sections
        intro = extract_section(script_text, "INTRO")
        midpoint = extract_section(script_text, "MIDPOINT")
        outro = extract_section(script_text, "OUTRO")

        if not intro or not midpoint or not outro:
            logger.error(f"Failed to parse script sections. Response: {script_text}")
            raise ValueError("Failed to parse generated script")

        # Combine into full script
        full_script = f"""INTRO:
{intro}

MIDPOINT:
{midpoint}

OUTRO:
{outro}"""

        logger.info(f"✅ Successfully generated commerce script for {request.product_name}")

        return {
            "success": True,
            "intro": intro,
            "midpoint": midpoint,
            "outro": outro,
            "full_script": full_script,
            "content_type": request.content_type,
            "tone": request.tone,
            "timestamp": dt.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except RateLimitError:
        logger.error("OpenAI rate limit exceeded")
        raise HTTPException(status_code=429, detail="API rate limit exceeded. Please try again later.")
    except AuthenticationError:
        logger.error("OpenAI authentication failed")
        raise HTTPException(status_code=401, detail="API authentication failed")
    except APIError as e:
        logger.error(f"OpenAI API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"API error: {str(e)}")
    except Exception as e:
        logger.error(f"Error generating commerce script: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating script: {str(e)}")

def extract_section(text: str, section_name: str) -> str:
    """Extract a section from the generated script"""
    try:
        # Find the section header
        start_marker = f"{section_name}:"
        start_idx = text.find(start_marker)

        if start_idx == -1:
            return ""

        start_idx += len(start_marker)

        # Find the next section or end of text
        next_sections = ["INTRO:", "MIDPOINT:", "OUTRO:"]
        next_idx = len(text)

        for next_section in next_sections:
            if next_section != start_marker:
                idx = text.find(next_section, start_idx)
                if idx != -1:
                    next_idx = min(next_idx, idx)

        # Extract and clean the content
        content = text[start_idx:next_idx].strip()
        return content

    except Exception as e:
        logger.error(f"Error extracting section {section_name}: {str(e)}")
        return ""

@router.get("/health")
async def health_check():
    """Check if AI Commerce service is available"""
    try:
        if not settings.OPENAI_API_KEY:
            return {
                "status": "error",
                "message": "OpenAI API key not configured",
                "ready": False
            }

        return {
            "status": "ok",
            "message": "AI Commerce Scripts service is ready",
            "ready": True
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "ready": False
        }
