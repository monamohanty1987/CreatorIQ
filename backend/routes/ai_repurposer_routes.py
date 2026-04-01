"""
AI Content Repurposer Routes
Uses OpenAI GPT-4 Turbo to intelligently repurpose content for multiple platforms
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from datetime import datetime
from services.openai_service import generate_repurposed_content
from config import settings
import json

router = APIRouter(prefix="/api/ai-repurposer", tags=["ai-repurposer"])

# Request/Response Models
class RepurposerRequest(BaseModel):
    content: str  # Original content
    platforms: list[str]  # ['linkedin', 'instagram', 'youtube', 'tiktok']
    tone: str = "professional"  # 'professional', 'casual', 'fun', 'serious', 'inspirational'
    audience: Optional[str] = "general"  # Target audience description

class RepurposedResult(BaseModel):
    success: bool
    data: dict  # Contains repurposed content for each platform
    ai_generated: bool = True
    model: str = "GPT-4 Turbo"
    provider: str = "OpenAI"
    timestamp: str
    metadata: dict

@router.post("/generate")
async def generate_repurposed_content_endpoint(request: RepurposerRequest):
    """
    Generate repurposed content for multiple platforms using OpenAI GPT-4 Turbo

    Args:
        content: The original content to repurpose
        platforms: List of platforms ['linkedin', 'instagram', 'youtube', 'tiktok']
        tone: Tone/style of content
        audience: Target audience description

    Returns:
        Dictionary with optimized versions for each platform

    EU AI Act Compliance:
        - Article 50: Content marked as AI-generated
        - GPAI: Using OpenAI GPT-4 Turbo (GPAI provider compliance)
        - Transparency: Model and provider disclosed
    """

    try:
        # Validate input
        if not request.content or not request.content.strip():
            raise HTTPException(
                status_code=400,
                detail="Content cannot be empty"
            )

        if not request.platforms or len(request.platforms) == 0:
            raise HTTPException(
                status_code=400,
                detail="Select at least one platform"
            )

        # Validate platform names
        valid_platforms = ['linkedin', 'instagram', 'youtube', 'tiktok']
        invalid_platforms = [p for p in request.platforms if p not in valid_platforms]
        if invalid_platforms:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid platforms: {', '.join(invalid_platforms)}"
            )

        # Generate repurposed content using OpenAI
        result = await generate_repurposed_content(
            content=request.content,
            platforms=request.platforms,
            tone=request.tone,
            audience=request.audience
        )

        # Verify OpenAI API key exists
        if not settings.OPENAI_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="OpenAI API key not configured"
            )

        return {
            "success": True,
            "data": result,
            "ai_generated": True,  # EU AI Act Article 50 compliance
            "model": "GPT-4 Turbo",
            "provider": "OpenAI",
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": {
                "original_length": len(request.content),
                "platforms": request.platforms,
                "tone": request.tone,
                "audience": request.audience
            }
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error in content repurposing: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating content: {str(e)}"
        )

@router.post("/regenerate")
async def regenerate_specific_platform(
    content: str,
    platform: str,
    tone: str = "professional",
    audience: Optional[str] = "general"
):
    """
    Regenerate content for a specific platform only
    """
    try:
        valid_platforms = ['linkedin', 'instagram', 'youtube', 'tiktok']
        if platform not in valid_platforms:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid platform: {platform}"
            )

        result = await generate_repurposed_content(
            content=content,
            platforms=[platform],
            tone=tone,
            audience=audience
        )

        from datetime import datetime

        return {
            "success": True,
            "data": result,
            "ai_generated": True,
            "model": "GPT-4 Turbo",
            "timestamp": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-variations")
async def generate_content_variations(request: RepurposerRequest):
    """
    Generate 3 different variations of repurposed content for all platforms

    Variation 1: Short & punchy version
    Variation 2: Long version with detailed hacks/tips (Instagram friendly)
    Variation 3: Professional/engaging version

    Each variation is optimized for: LinkedIn, Instagram, YouTube, TikTok
    """
    try:
        # Validate input
        if not request.content or not request.content.strip():
            raise HTTPException(
                status_code=400,
                detail="Content cannot be empty"
            )

        if not request.platforms or len(request.platforms) == 0:
            raise HTTPException(
                status_code=400,
                detail="Select at least one platform"
            )

        # Validate platform names
        valid_platforms = ['linkedin', 'instagram', 'youtube', 'tiktok']
        invalid_platforms = [p for p in request.platforms if p not in valid_platforms]
        if invalid_platforms:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid platforms: {', '.join(invalid_platforms)}"
            )

        # Generate 3 variations
        variations = []
        variation_styles = [
            ("short", "Create a SHORT and PUNCHY version that's quick to read. Maximum 2-3 sentences. Perfect for people in a hurry."),
            ("long", "Create a LONG and COMPREHENSIVE version that LIST OUT ALL the hacks/tips/main points with numbers or bullets. Include detailed explanations for EACH one. Must be 800+ characters. This is for a carousel post or detailed caption where you break down every single hack/tip/point mentioned. Be thorough and detailed."),
            ("professional", "Create a PROFESSIONAL and ENGAGING version that's compelling and persuasive. Good balance between detail and brevity. Perfect for LinkedIn.")
        ]

        from services.openai_service import generate_repurposed_content as generate_content

        for style_name, style_instruction in variation_styles:
            # Modify the request with style instruction
            modified_content = f"{request.content}\n\n[VARIATION INSTRUCTION: {style_instruction}]"

            result = await generate_content(
                content=modified_content,
                platforms=request.platforms,
                tone=request.tone,
                audience=request.audience
            )

            variations.append({
                "style": style_name,
                "content": result
            })

        return {
            "success": True,
            "variations": variations,
            "ai_generated": True,
            "model": "GPT-4 Turbo",
            "provider": "OpenAI",
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": {
                "original_length": len(request.content),
                "platforms": request.platforms,
                "tone": request.tone,
                "audience": request.audience,
                "variation_count": 3
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating variations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating variations: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Check if OpenAI API is configured and accessible"""
    try:
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            return {
                "status": "error",
                "message": "OpenAI API key not configured",
                "configured": False
            }

        return {
            "status": "ok",
            "message": "AI Repurposer service is ready",
            "configured": True,
            "model": "GPT-4 Turbo"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "configured": False
        }
