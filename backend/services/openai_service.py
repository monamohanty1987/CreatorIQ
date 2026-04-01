"""
OpenAI Service for Content Repurposing
Handles all interactions with OpenAI GPT-4 Turbo API
All calls are traced via LangSmith for monitoring and cost tracking
"""

import os
import json
import time
from typing import Dict, List
from prompts.ai_repurposer_prompts import get_repurposer_prompt
import asyncio
from config import settings
from openai import OpenAI, APIError, RateLimitError, AuthenticationError
from services.langsmith_service import monitor

# Initialize OpenAI client with API key from config (loads from .env)
client = OpenAI(api_key=settings.OPENAI_API_KEY)

async def generate_repurposed_content(
    content: str,
    platforms: List[str],
    tone: str,
    audience: str
) -> Dict[str, str]:
    """
    Generate platform-specific repurposed content using OpenAI GPT-4 Turbo

    Args:
        content: Original content to repurpose
        platforms: List of target platforms ['linkedin', 'instagram', 'youtube', 'tiktok']
        tone: Tone/style of content
        audience: Target audience description

    Returns:
        Dictionary with repurposed content for each platform

    Example:
        {
            "linkedin": "Professional post content...",
            "instagram": "Engaging caption...",
            "youtube": "Detailed description...",
            "tiktok": "Short viral hook..."
        }
    """

    try:
        # Validate API key
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable not set")

        # Build the intelligent prompt
        prompt = get_repurposer_prompt(
            original_content=content,
            platforms=platforms,
            tone=tone,
            audience=audience
        )

        print(f"📝 Generating content for platforms: {', '.join(platforms)}")
        print(f"🎯 Tone: {tone}, Audience: {audience}")

        start_time = time.time()

        # Call OpenAI API with GPT-4 Turbo
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert content strategist and copywriter specializing in multi-platform content optimization. You understand the unique culture, format requirements, and audience preferences of each social media platform. Create content that is authentic, engaging, and platform-specific while maintaining the core message and tone of the original content."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,  # Balanced between creativity and consistency
            max_tokens=2500,
            top_p=0.9
        )

        latency_ms = (time.time() - start_time) * 1000
        response_text = response.choices[0].message.content

        print(f"✅ Received response from OpenAI (tokens used: {response.usage.total_tokens})")

        # Log to LangSmith
        monitor.log_claude_call(
            operation="generate_repurposed_content",
            model="gpt-4-turbo",
            input_tokens=response.usage.prompt_tokens,
            output_tokens=response.usage.completion_tokens,
            latency_ms=latency_ms,
            inputs={
                "platforms": platforms,
                "tone": tone,
                "audience": audience,
                "content_length": len(content),
            },
            outputs={"platforms_generated": len(platforms)},
            metadata={"model": "gpt-4-turbo", "tone": tone},
        )

        # Parse the JSON response
        repurposed_content = parse_openai_response(response_text, platforms)

        return repurposed_content

    except RateLimitError as e:
        print("⚠️ OpenAI Rate limit exceeded")
        monitor.log_claude_call(
            operation="generate_repurposed_content",
            model="gpt-4-turbo",
            input_tokens=0,
            output_tokens=0,
            latency_ms=(time.time() - start_time) * 1000,
            inputs={"platforms": platforms},
            outputs={},
            error=f"Rate limit exceeded: {str(e)}",
        )
        raise ValueError("OpenAI rate limit exceeded. Please try again in a few moments.")

    except AuthenticationError as e:
        print("❌ OpenAI Authentication failed")
        monitor.log_claude_call(
            operation="generate_repurposed_content",
            model="gpt-4-turbo",
            input_tokens=0,
            output_tokens=0,
            latency_ms=(time.time() - start_time) * 1000,
            inputs={"platforms": platforms},
            outputs={},
            error=f"Authentication failed: {str(e)}",
        )
        raise ValueError("OpenAI API key is invalid or expired")

    except APIError as e:
        print(f"❌ OpenAI API Error: {str(e)}")
        monitor.log_claude_call(
            operation="generate_repurposed_content",
            model="gpt-4-turbo",
            input_tokens=0,
            output_tokens=0,
            latency_ms=(time.time() - start_time) * 1000,
            inputs={"platforms": platforms},
            outputs={},
            error=f"API error: {str(e)}",
        )
        raise ValueError(f"OpenAI API error: {str(e)}")

    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse OpenAI response: {str(e)}")
        raise ValueError("Failed to parse OpenAI response. Please try again.")

    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        raise ValueError(f"Error generating content: {str(e)}")


def parse_openai_response(response_text: str, platforms: List[str]) -> Dict[str, str]:
    """
    Parse the JSON response from OpenAI and extract content for each platform

    The OpenAI API should return a JSON structure with each platform's content

    Args:
        response_text: Raw response from OpenAI
        platforms: List of platforms requested

    Returns:
        Dictionary with content for each platform
    """

    try:
        # Try to extract JSON from the response
        # Sometimes OpenAI wraps JSON in markdown code blocks
        json_str = response_text.strip()

        # Remove markdown code blocks if present
        if json_str.startswith("```json"):
            json_str = json_str[7:]
        if json_str.startswith("```"):
            json_str = json_str[3:]
        if json_str.endswith("```"):
            json_str = json_str[:-3]

        # Parse JSON
        data = json.loads(json_str.strip())

        # Validate that all requested platforms have content
        result = {}
        for platform in platforms:
            if platform in data and data[platform]:
                result[platform] = data[platform]
            else:
                # Fallback: use a default message if platform content is missing
                result[platform] = f"[Content for {platform} not generated - please try again]"

        return result

    except json.JSONDecodeError:
        # If JSON parsing fails, try to extract content by platform names
        print("⚠️ Attempting to extract content by platform names...")

        result = {}
        response_lower = response_text.lower()

        for platform in platforms:
            # Find content between platform mentions
            start_marker = f"{platform}:"
            if start_marker in response_lower:
                start_idx = response_text.lower().find(start_marker) + len(start_marker)
                # Find next platform or end of text
                next_platform_idx = len(response_text)
                for next_platform in platforms:
                    if next_platform != platform:
                        next_idx = response_text.lower().find(f"{next_platform}:", start_idx)
                        if next_idx != -1:
                            next_platform_idx = min(next_platform_idx, next_idx)

                content = response_text[start_idx:next_platform_idx].strip()
                result[platform] = content[:1000] if content else f"Content for {platform}"
            else:
                result[platform] = f"[No content generated for {platform}]"

        return result if result else {p: "[Content generation failed]" for p in platforms}


def estimate_cost(token_count: int) -> float:
    """
    Estimate the cost of API usage (approximate)

    GPT-4 Turbo pricing (as of 2024):
    - Input: $0.01 per 1K tokens
    - Output: $0.03 per 1K tokens

    Args:
        token_count: Number of tokens used

    Returns:
        Estimated cost in USD
    """
    input_cost = (token_count * 0.01) / 1000
    output_cost = (token_count * 0.03) / 1000
    total_cost = input_cost + output_cost
    return total_cost
