"""
AI Content Repurposer Prompts
Carefully engineered prompts for OpenAI GPT-4 Turbo to generate platform-specific content
"""

def get_repurposer_prompt(original_content: str, platforms: list, tone: str, audience: str) -> str:
    """
    Create an intelligent prompt for OpenAI to repurpose content for multiple platforms

    Args:
        original_content: The original content to repurpose
        platforms: List of target platforms ['linkedin', 'instagram', 'youtube', 'tiktok']
        tone: Tone/style ('professional', 'casual', 'fun', 'serious', 'inspirational')
        audience: Target audience description

    Returns:
        Formatted prompt for OpenAI API
    """

    platforms_section = build_platforms_section(platforms)

    tone_description = get_tone_description(tone)

    prompt = f"""You are an expert content strategist specializing in multi-platform content optimization.

ORIGINAL CONTENT TO REPURPOSE:
{original_content}

TARGET AUDIENCE: {audience if audience else 'General audience'}

CONTENT TONE/STYLE: {tone_description}

YOUR TASK:
Repurpose the original content for the following platforms: {', '.join(platforms)}

Each version must:
1. Maintain the core message and key insights from the original content
2. Be optimized for the specific platform's format and audience expectations
3. Match the requested tone and speak to the target audience
4. Follow platform-specific best practices for engagement and reach
5. Include platform-appropriate calls-to-action

{platforms_section}

IMPORTANT RULES:
- Do NOT use markdown formatting in the content itself (no **, ##, etc.)
- Keep content authentic and natural-sounding
- Maintain consistency in messaging across platforms
- Avoid generic or repetitive phrasing
- Each platform should feel tailored, not just copied

RESPONSE FORMAT:
Return ONLY valid JSON with no additional text. Do not wrap in markdown code blocks.

{{
    "linkedin": "The LinkedIn post content here",
    "instagram": "The Instagram caption here",
    "youtube": "The YouTube description here",
    "tiktok": "The TikTok hook/caption here"
}}

Only include the platforms requested above. Generate content now:"""

    return prompt


def build_platforms_section(platforms: list) -> str:
    """
    Build detailed platform-specific guidelines for each requested platform
    """

    guidelines = {}

    guidelines['linkedin'] = """LINKEDIN:
- Length: 150-300 words
- Style: Professional, insightful, thought-leadership focused
- Format: Single cohesive post (not a thread format)
- Include: 3-5 relevant hashtags, professional tone
- Add: Clear call-to-action (encourage comments, connection requests, or engagement)
- Best practices: Share key insights, add value, show expertise
- Avoid: Overly casual language, self-promotion, spam-like tone
- Example structure: Hook → Key insight → Why it matters → CTA + hashtags"""

    guidelines['instagram'] = """INSTAGRAM:
- Length: 100-200 characters for caption
- Style: Engaging, conversational, visual-forward, emoji-friendly
- Format: Single caption with potential for line breaks for readability
- Include: 15-25 relevant hashtags (use popular + niche)
- Hashtag placement: Can be in caption or first comment
- Add: Emojis to enhance engagement and visual interest
- Best practices: Start with a hook, tell a story, invite engagement
- Avoid: Overly formal language, walls of text, irrelevant hashtags
- Example structure: Hook/emoji → Story/insight → CTA (question/engagement) → Hashtags"""

    guidelines['youtube'] = """YOUTUBE:
- Length: 250-500 words
- Style: Detailed, SEO-optimized, descriptive, viewer-focused
- Format: Comprehensive description that can be expanded with sections
- Include: Video title suggestion, key moments, links if applicable
- Keywords: Naturally incorporate relevant keywords for searchability
- Add: Clear call-to-action (subscribe, watch full video, click link, etc.)
- Structure: Start with engaging hook → Main content → Key takeaways → CTA
- Best practices: Be specific, use chapters/timestamps, provide value
- Avoid: Misleading titles (no clickbait), excessive links, keyword stuffing"""

    guidelines['tiktok'] = """TIKTOK:
- Length: 50-150 characters maximum
- Style: Viral, trendy, punchy, fast-paced, hook-first
- Format: Ultra-concise with immediate hook in first 3 seconds
- Include: 3-5 trending or relevant hashtags
- Emoji usage: Yes, use strategically for visual interest
- Add: Clear, compelling call-to-action or trending sound suggestion
- Best practices: Start with curiosity gap or value hook, short and snappy
- Avoid: Long sentences, corporate jargon, slow burn (hook immediately)
- Example structure: Immediate hook/value → Brief insight → Trending element → CTA"""

    section = ""
    for platform in ['linkedin', 'instagram', 'youtube', 'tiktok']:
        if platform in guidelines:
            section += f"\n{guidelines[platform]}\n"

    return section


def get_tone_description(tone: str) -> str:
    """
    Get detailed description of tone/style for the prompt
    """

    tone_descriptions = {
        'professional': "Professional, credible, and authority-focused. Use industry language where appropriate but remain accessible. Convey expertise and trustworthiness.",

        'casual': "Casual and friendly, like talking to a knowledgeable friend. Use conversational language, contractions, and approachable tone while maintaining credibility.",

        'fun': "Fun, playful, and entertaining. Use humor, wordplay, and lighthearted language. Make the content enjoyable and shareable while conveying the core message.",

        'serious': "Serious, formal, and grave. Focus on the importance and weight of the topic. Use sophisticated language and emphasize significance.",

        'inspirational': "Inspirational, motivational, and uplifting. Focus on possibilities, growth, and positive outcomes. Use emotive language that moves people to action."
    }

    return tone_descriptions.get(tone, "Professional and clear")


# Platform-specific additional prompts (not used in main prompt but available for future use)
def get_linkedin_specific_prompt() -> str:
    return """Generate a LinkedIn post that:
    - Establishes thought leadership
    - Provides genuine value to professionals
    - Sparks meaningful discussion
    - Uses professional but engaging language
    - Includes a clear engagement CTA"""

def get_instagram_specific_prompt() -> str:
    return """Generate an Instagram caption that:
    - Captures attention immediately
    - Encourages likes, comments, and shares
    - Uses relevant hashtags strategically
    - Feels authentic and non-salesy
    - Works well with visual content"""

def get_youtube_specific_prompt() -> str:
    return """Generate a YouTube description that:
    - Helps with video SEO and discoverability
    - Provides value even without watching the video
    - Includes timestamps for longer videos if applicable
    - Has clear CTAs (subscribe, watch full, click link)
    - Is scannable with good formatting suggestions"""

def get_tiktok_specific_prompt() -> str:
    return """Generate a TikTok caption that:
    - Hooks viewers in the first second
    - Uses trending sounds or hashtags if relevant
    - Is incredibly short and punchy
    - Encourages engagement (likes, comments, shares, follows)
    - Feels authentic to TikTok culture"""
