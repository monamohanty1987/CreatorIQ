"""
Ask Me Anything Chat Route
Floating AI assistant powered by OpenAI
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import logging
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["chat"])

SYSTEM_PROMPT = """You are CreatorIQ Assistant, an expert AI for digital content creators.
You help creators with:
- Brand deal negotiation and pricing (always in EUR)
- Contract review and red flags
- Content strategy and repurposing
- Campaign planning and ROI
- Creator economy trends and benchmarks

Key facts about CreatorIQ platform:
- Deal Navigator: analyses brand deals and gives a Deal Score
- Contract Analyzer: reviews contracts for red flags
- Content Repurposer AI: turns one piece of content into 7 formats (Instagram, TikTok, LinkedIn, etc.)
- Campaign Generator: plans product launch campaigns
- AI Commerce Scripts: generates sales scripts

Be concise, practical and friendly. Use bullet points for lists. Keep answers under 150 words unless the user asks for detail. Always give actionable advice."""


class ChatRequest(BaseModel):
    message: str
    history: list = []


@router.post("")
async def chat(request: ChatRequest):
    """Handle chat messages from the floating assistant"""
    try:
        if not settings.OPENAI_API_KEY:
            raise HTTPException(status_code=503, detail="OpenAI API not configured")

        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Add conversation history (last 6 messages to keep context)
        for msg in request.history[-6:]:
            if msg.get("role") in ["user", "assistant"]:
                messages.append({"role": msg["role"], "content": msg["content"]})

        messages.append({"role": "user", "content": request.message})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=300,
            temperature=0.7
        )

        reply = response.choices[0].message.content

        return {"reply": reply}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
