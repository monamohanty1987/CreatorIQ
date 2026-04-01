"""
Content Repurposing Service
Converts one piece of content into 7 different formats using OpenAI API
"""

import logging
import json
import asyncio
import time
from datetime import datetime
from openai import OpenAI, APIError as OpenAIAPIError, APITimeoutError as OpenAITimeoutError
from config import settings

logger = logging.getLogger(__name__)

# Token pricing for GPT-4o (OpenAI)
OPENAI_PRICING = {
    "gpt-4o": {
        "input_tokens_per_mtok": 5.0,  # $5 per 1M input tokens
        "output_tokens_per_mtok": 15.0,  # $15 per 1M output tokens
    },
    "gpt-4o-mini": {
        "input_tokens_per_mtok": 0.15,  # $0.15 per 1M input tokens
        "output_tokens_per_mtok": 0.60,  # $0.60 per 1M output tokens
    }
}

class ContentRepurposingService:
    """Service for repurposing content across multiple formats using OpenAI"""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o"  # Using GPT-4o for best quality
        self.total_tokens_used = 0
        self.total_cost = 0.0
        self.format_stats = {}

    def _calculate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """Calculate API cost for a single request using OpenAI pricing"""
        pricing = OPENAI_PRICING.get(self.model, OPENAI_PRICING["gpt-4o"])
        input_cost = (input_tokens / 1_000_000) * pricing["input_tokens_per_mtok"]
        output_cost = (output_tokens / 1_000_000) * pricing["output_tokens_per_mtok"]
        return input_cost + output_cost

    def _log_format_stats(self, format_type: str, input_tokens: int, output_tokens: int, latency: float):
        """Log statistics for each format generation"""
        cost = self._calculate_cost(input_tokens, output_tokens)
        self.format_stats[format_type] = {
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": input_tokens + output_tokens,
            "latency_seconds": latency,
            "cost_usd": cost
        }
        self.total_tokens_used += input_tokens + output_tokens
        self.total_cost += cost
        logger.info(f"Format {format_type}: {input_tokens + output_tokens} tokens, ${cost:.4f}, {latency:.2f}s")

    def _create_prompt(self, original_content: str, format_type: str, topic: str, niche: str, target_audience: str) -> str:
        """Create format-specific prompts for content generation"""

        base_context = f"""
You are a content creation expert specializing in repurposing content.
The original content is about: {topic}
Niche: {niche}
Target Audience: {target_audience}

Original Content:
{original_content}
"""

        prompts = {
            "tiktok": f"""{base_context}

Create 3 SHORT, PUNCHY TikTok scripts (15-60 seconds each).
Each script should:
- Start with a HOOK (first 3 seconds)
- Provide ONE key value/insight
- End with clear CTA (comment, share, follow)
- Include emoji suggestions for visual interest
- Note the best posting times

Return as JSON array:
[
  {{
    "script": "full script text",
    "hook": "opening line",
    "cta": "call to action",
    "emojis": ["emoji1", "emoji2"],
    "best_posting_time": "time",
    "duration_seconds": "number"
  }},
  ...
]""",

            "instagram": f"""{base_context}

Create 5 Instagram caption variations with detailed, comprehensive content.
The FIRST caption (index 0) should be the MAIN caption - the most comprehensive and detailed version.
Other 4 should be shorter alternative variations.

CONTENT FORMAT (VERY IMPORTANT):
For the main caption, use this exact structure:

[Hook/Opening question]

[Numbered list with emoji numbers like 1️⃣, 2️⃣, 3️⃣, etc. - each item on a new line with clear explanation]

[Summary/closing line connecting everything back to the main benefit]

Then add the CTA after a blank line.

EXAMPLE for "5 productivity hacks":
"Ever wondered how to get more done in less time? Here are the top 5 productivity hacks that transformed my work routine:

1️⃣ Prioritize tasks using the Eisenhower Box to focus on what truly matters.
2️⃣ Implement the Pomodoro Technique to maintain laser-sharp focus with regular breaks.
3️⃣ Batch similar tasks to minimize context switching and increase efficiency.
4️⃣ Leverage technology with productivity apps like Todoist and Trello for seamless task management.
5️⃣ Reflect weekly to assess progress and adjust strategies.

These strategies have not only improved my efficiency but also brought balance to my busy schedule!

💾 Save this post to revisit these life-changing hacks!"

Return as JSON array:
[
  {{
    "slide": 1,
    "is_main": true,
    "hook": "Hook line (can be integrated into content)",
    "content": "Formatted content with numbered items (emoji + description on each line), summary, then blank line",
    "cta": "Call to action (emoji + text)",
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"]
  }},
  {{
    "slide": 2,
    "is_main": false,
    "hook": "Alternative hook",
    "content": "Shorter alternative version (3-4 items instead of full list)",
    "cta": "Alternative CTA",
    "hashtags": ["#tag1", "#tag2", "#tag3"]
  }},
  ...
]""",

            "twitter": f"""{base_context}

Create a Twitter thread with 5-10 tweets.
Requirements:
- Each tweet max 280 characters
- Build narrative across tweets
- Include data/insights
- Thread should be shareable

Return as JSON array of strings:
["Tweet 1 text", "Tweet 2 text", ...]""",

            "blog": f"""{base_context}

Expand this into a comprehensive 1500+ word blog post.
Structure:
- Attention-grabbing headline
- Meta description (160 characters max)
- Introduction (100 words)
- 3 main sections (300 words each)
- Real examples/case studies
- Actionable conclusion with CTA
- Include H2 and H3 headers for SEO

Make it informative, engaging, and original.

Return as plain text (no markdown, no JSON).""",

            "email": f"""{base_context}

Create 3 different email versions for different urgency levels:
1. Short version (50 words max) - for busy readers
2. Medium version (150 words) - balanced
3. Long version (300 words) - detailed with story

Each should have:
- Subject line (50 chars max)
- Preview text (40 chars max)
- Opening hook
- Main message/benefit
- Clear CTA button text

Return as JSON object:
{{
  "short": {{"subject": "...", "preview": "...", "body": "..."}},
  "medium": {{"subject": "...", "preview": "...", "body": "..."}},
  "long": {{"subject": "...", "preview": "...", "body": "..."}}
}}""",

            "podcast": f"""{base_context}

Create podcast elements from this content:
1. Intro script (30 seconds / ~75 words)
2. Outro script (30 seconds / ~75 words)
3. Show notes (300 words, with timestamps)

Show notes should include:
- Key takeaways (bullet points)
- Mentioned resources/links
- Time stamps for key moments
- Call to action

Return as JSON:
{{
  "intro": "full intro script",
  "outro": "full outro script",
  "show_notes": "full show notes text",
  "key_takeaways": ["takeaway1", "takeaway2"],
  "cta": "call to action"
}}""",

            "linkedin": f"""{base_context}

Create LinkedIn professional post with engagement hooks.
Include:
1. Main post (150-200 words) - professional but personable
2. 3 comment hooks to drive conversation
3. Relevant hashtags
4. Optional: call to action for connection

Return as JSON:
{{
  "post": "main post text",
  "comment_hooks": ["question1", "statement1", "insight1"],
  "hashtags": ["#tag1", "#tag2"],
  "cta": "connection CTA"
}}"""
        }

        return prompts.get(format_type, "")

    async def repurpose_content(
        self,
        original_content: str,
        content_type: str,  # "video", "blog", "podcast"
        content_title: str,
        topic: str,
        niche: str,
        target_audience: str
    ) -> dict:
        """
        Repurpose content into all 7 formats using parallel Claude API calls

        Returns dict with all repurposed content, metadata, and performance metrics
        """

        start_time = time.time()
        results = {
            "status": "processing",
            "tiktok_scripts": None,
            "instagram_captions": None,
            "twitter_thread": None,
            "blog_post": None,
            "email_scripts": None,
            "podcast_notes": None,
            "linkedin_post": None,
            "hashtags": None,
            "best_posting_times": None,
            "engagement_forecast": None,
            "format_stats": {},
            "total_tokens": 0,
            "total_cost_usd": 0.0,
            "processing_time_seconds": 0,
            "error": None
        }

        try:
            # Validate input
            if not original_content or len(original_content.strip()) < 10:
                raise ValueError("Original content must be at least 10 characters")

            logger.info(f"🚀 Starting content repurposing: {content_title}")
            logger.info(f"   Content type: {content_type}")
            logger.info(f"   Topic: {topic}, Niche: {niche}")
            logger.info(f"   Content length: {len(original_content)} characters")

            # Define all format tasks
            format_tasks = {
                "tiktok": self._generate_tiktok,
                "instagram": self._generate_instagram,
                "twitter": self._generate_twitter,
                "blog": self._generate_blog,
                "email": self._generate_email,
                "podcast": self._generate_podcast,
                "linkedin": self._generate_linkedin
            }

            logger.info(f"⚡ Executing {len(format_tasks)} format generations in parallel...")

            # Run all format generations in parallel
            tasks = {
                fmt: task(original_content, content_type, topic, niche, target_audience)
                for fmt, task in format_tasks.items()
            }

            # Execute all in parallel with timeout
            try:
                responses = await asyncio.wait_for(
                    asyncio.gather(*tasks.values(), return_exceptions=True),
                    timeout=300  # 5 minute timeout for all 7 formats
                )
            except asyncio.TimeoutError:
                logger.error("⏱️  Timeout: Content repurposing exceeded 5 minutes")
                raise TimeoutError("Content repurposing exceeded maximum time limit (5 minutes)")

            # Map responses to results
            format_list = list(format_tasks.keys())
            success_count = 0

            for fmt, response in zip(format_list, responses):
                if isinstance(response, Exception):
                    logger.warning(f"⚠️  Error generating {fmt}: {type(response).__name__}: {str(response)}")
                    results[f"{fmt}_error"] = str(response)
                else:
                    success_count += 1
                    logger.info(f"✅ {fmt.upper()} generated successfully")
                    if fmt == "tiktok":
                        results["tiktok_scripts"] = response
                    elif fmt == "instagram":
                        results["instagram_captions"] = response
                    elif fmt == "twitter":
                        results["twitter_thread"] = response
                    elif fmt == "blog":
                        results["blog_post"] = response
                    elif fmt == "email":
                        results["email_scripts"] = response
                    elif fmt == "podcast":
                        results["podcast_notes"] = response
                    elif fmt == "linkedin":
                        results["linkedin_post"] = response

            logger.info(f"📊 Format generation complete: {success_count}/{len(format_tasks)} successful")

            # Generate metadata (hashtags, times, forecast)
            logger.info("🏷️  Generating hashtags and metadata...")
            try:
                results["hashtags"] = await self._generate_hashtags(original_content, topic, niche)
                logger.info("✅ Hashtags generated")
            except Exception as e:
                logger.warning(f"⚠️  Hashtag generation failed: {str(e)}")
                results["hashtags"] = {}

            results["best_posting_times"] = self._get_best_posting_times()

            try:
                results["engagement_forecast"] = await self._forecast_engagement(topic, niche)
                logger.info("✅ Engagement forecast generated")
            except Exception as e:
                logger.warning(f"⚠️  Engagement forecast failed: {str(e)}")
                results["engagement_forecast"] = {}

            # Calculate performance metrics
            processing_time = time.time() - start_time
            results["processing_time_seconds"] = round(processing_time, 2)
            results["format_stats"] = self.format_stats
            results["total_tokens"] = self.total_tokens_used
            results["total_cost_usd"] = round(self.total_cost, 4)
            results["status"] = "completed"

            logger.info(f"🎉 Content repurposing completed!")
            logger.info(f"   ⏱️  Processing time: {processing_time:.2f} seconds")
            logger.info(f"   📊 Total tokens: {self.total_tokens_used}")
            logger.info(f"   💰 Total cost: ${self.total_cost:.4f}")

            return results

        except ValueError as e:
            logger.error(f"❌ Validation error: {str(e)}")
            results["status"] = "failed"
            results["error"] = f"Validation error: {str(e)}"
            return results
        except (OpenAIAPIError, OpenAITimeoutError) as e:
            logger.error(f"❌ OpenAI API error: {str(e)}")
            results["status"] = "failed"
            results["error"] = f"API error: {str(e)}"
            return results
        except Exception as e:
            logger.error(f"❌ Unexpected error: {type(e).__name__}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            results["status"] = "failed"
            results["error"] = f"Unexpected error: {str(e)}"
            return results

    async def _generate_tiktok(self, original_content: str, content_type: str, topic: str, niche: str, target_audience: str) -> list:
        """Generate TikTok scripts using OpenAI API"""
        prompt = self._create_prompt(original_content, "tiktok", topic, niche, target_audience)
        start_time = time.time()

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=1500,
                temperature=0.7,
                messages=[
                    {"role": "system", "content": "You are a expert content creator specializing in social media."},
                    {"role": "user", "content": prompt}
                ]
            )

            text = response.choices[0].message.content
            latency = time.time() - start_time

            # Track tokens and cost
            self._log_format_stats("tiktok", response.usage.prompt_tokens, response.usage.completion_tokens, latency)

            # Parse JSON response
            try:
                json_match = text[text.find('['):text.rfind(']')+1]
                result = json.loads(json_match)
                logger.debug(f"TikTok: Generated {len(result)} scripts")
                return result
            except json.JSONDecodeError:
                logger.warning(f"TikTok: JSON parsing failed, returning raw response")
                return [{"script": text, "hook": text[:50], "cta": "Follow for more"}]

        except Exception as e:
            logger.error(f"TikTok generation error: {str(e)}")
            raise

    async def _generate_instagram(self, original_content: str, content_type: str, topic: str, niche: str, target_audience: str) -> list:
        """Generate Instagram captions using OpenAI API"""
        prompt = self._create_prompt(original_content, "instagram", topic, niche, target_audience)
        start_time = time.time()

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=2000,
                temperature=0.7,
                messages=[
                    {"role": "system", "content": "You are a expert content creator specializing in social media."},
                    {"role": "user", "content": prompt}
                ]
            )

            text = response.choices[0].message.content
            latency = time.time() - start_time
            self._log_format_stats("instagram", response.usage.prompt_tokens, response.usage.completion_tokens, latency)

            try:
                json_match = text[text.find('['):text.rfind(']')+1]
                return json.loads(json_match)
            except json.JSONDecodeError:
                return [{"caption": text, "slide": 1}]
        except Exception as e:
            logger.error(f"Instagram generation error: {str(e)}")
            raise

    async def _generate_twitter(self, original_content: str, content_type: str, topic: str, niche: str, target_audience: str) -> list:
        """Generate Twitter thread using OpenAI API"""
        prompt = self._create_prompt(original_content, "twitter", topic, niche, target_audience)
        start_time = time.time()

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=1500,
                temperature=0.7,
                messages=[
                    {"role": "system", "content": "You are a expert content creator specializing in social media."},
                    {"role": "user", "content": prompt}
                ]
            )

            text = response.choices[0].message.content
            latency = time.time() - start_time
            self._log_format_stats("twitter", response.usage.prompt_tokens, response.usage.completion_tokens, latency)

            try:
                json_match = text[text.find('['):text.rfind(']')+1]
                return json.loads(json_match)
            except json.JSONDecodeError:
                return [text]
        except Exception as e:
            logger.error(f"Twitter generation error: {str(e)}")
            raise

    async def _generate_blog(self, original_content: str, content_type: str, topic: str, niche: str, target_audience: str) -> str:
        """Generate blog post using OpenAI API"""
        prompt = self._create_prompt(original_content, "blog", topic, niche, target_audience)
        start_time = time.time()

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=3000,
                temperature=0.7,
                messages=[
                    {"role": "system", "content": "You are a expert content writer specializing in creating engaging blog posts."},
                    {"role": "user", "content": prompt}
                ]
            )

            text = response.choices[0].message.content
            latency = time.time() - start_time
            self._log_format_stats("blog", response.usage.prompt_tokens, response.usage.completion_tokens, latency)
            return text
        except Exception as e:
            logger.error(f"Blog generation error: {str(e)}")
            raise

    async def _generate_email(self, original_content: str, content_type: str, topic: str, niche: str, target_audience: str) -> dict:
        """Generate email sequences using OpenAI API"""
        prompt = self._create_prompt(original_content, "email", topic, niche, target_audience)
        start_time = time.time()

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=2000,
                temperature=0.7,
                messages=[
                    {"role": "system", "content": "You are an expert email copywriter specializing in converting readers into customers."},
                    {"role": "user", "content": prompt}
                ]
            )

            text = response.choices[0].message.content
            latency = time.time() - start_time
            self._log_format_stats("email", response.usage.prompt_tokens, response.usage.completion_tokens, latency)

            try:
                json_match = text[text.find('{'):text.rfind('}')+1]
                return json.loads(json_match)
            except json.JSONDecodeError:
                return {"error": "Could not parse JSON", "raw": text}
        except Exception as e:
            logger.error(f"Email generation error: {str(e)}")
            raise

    async def _generate_podcast(self, original_content: str, content_type: str, topic: str, niche: str, target_audience: str) -> dict:
        """Generate podcast content using OpenAI API"""
        prompt = self._create_prompt(original_content, "podcast", topic, niche, target_audience)
        start_time = time.time()

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=2000,
                temperature=0.7,
                messages=[
                    {"role": "system", "content": "You are an expert podcast producer and scriptwriter."},
                    {"role": "user", "content": prompt}
                ]
            )

            text = response.choices[0].message.content
            latency = time.time() - start_time
            self._log_format_stats("podcast", response.usage.prompt_tokens, response.usage.completion_tokens, latency)

            try:
                json_match = text[text.find('{'):text.rfind('}')+1]
                return json.loads(json_match)
            except json.JSONDecodeError:
                return {"error": "Could not parse JSON", "raw": text}
        except Exception as e:
            logger.error(f"Podcast generation error: {str(e)}")
            raise

    async def _generate_linkedin(self, original_content: str, content_type: str, topic: str, niche: str, target_audience: str) -> dict:
        """Generate LinkedIn post using OpenAI API"""
        prompt = self._create_prompt(original_content, "linkedin", topic, niche, target_audience)
        start_time = time.time()

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=1500,
                temperature=0.7,
                messages=[
                    {"role": "system", "content": "You are an expert LinkedIn content creator specializing in professional engagement."},
                    {"role": "user", "content": prompt}
                ]
            )

            text = response.choices[0].message.content
            latency = time.time() - start_time
            self._log_format_stats("linkedin", response.usage.prompt_tokens, response.usage.completion_tokens, latency)

            try:
                json_match = text[text.find('{'):text.rfind('}')+1]
                return json.loads(json_match)
            except json.JSONDecodeError:
                return {"error": "Could not parse JSON", "raw": text}
        except Exception as e:
            logger.error(f"LinkedIn generation error: {str(e)}")
            raise

    async def _generate_hashtags(self, original_content: str, topic: str, niche: str) -> dict:
        """Generate platform-specific hashtags using OpenAI API"""
        prompt = f"""
Based on this content about {topic} in the {niche} niche, suggest 5-10 hashtags for each platform.

Original content:
{original_content[:500]}

Return ONLY valid JSON (no markdown, no extra text):
{{
  "instagram": ["#tag1", "#tag2"],
  "tiktok": ["#tag1", "#tag2"],
  "twitter": ["#tag1", "#tag2"],
  "linkedin": ["#tag1", "#tag2"]
}}
"""
        start_time = time.time()

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=500,
                temperature=0.5,
                messages=[
                    {"role": "system", "content": "You are an expert in social media hashtags. Return ONLY JSON, nothing else."},
                    {"role": "user", "content": prompt}
                ]
            )

            text = response.choices[0].message.content
            latency = time.time() - start_time
            self._log_format_stats("hashtags", response.usage.prompt_tokens, response.usage.completion_tokens, latency)

            try:
                json_match = text[text.find('{'):text.rfind('}')+1]
                return json.loads(json_match)
            except json.JSONDecodeError:
                return {}
        except Exception as e:
            logger.error(f"Hashtags generation error: {str(e)}")
            return {}

    def _get_best_posting_times(self) -> dict:
        """Return platform-specific best posting times"""
        return {
            "tiktok": "6PM-10PM (when users scroll before bed)",
            "instagram": "5PM-7PM or 11AM-1PM (lunch/evening)",
            "twitter": "8AM-10AM and 5PM-7PM (work hours)",
            "linkedin": "8AM-10AM Tuesday-Thursday",
            "email": "Tuesday-Thursday, 10AM or 6PM",
            "blog": "Tuesday-Thursday anytime",
            "youtube": "7PM-9PM Friday-Sunday"
        }

    async def _forecast_engagement(self, topic: str, niche: str) -> dict:
        """Forecast expected engagement by platform using OpenAI API"""
        prompt = f"""
For {niche} content about {topic}, provide realistic engagement metrics:
- Estimated views/impressions range
- Expected engagement rate (%)
- Estimated conversion rate if monetized

Return ONLY valid JSON (no markdown, no extra text):
{{
  "tiktok": {{"views_range": "1K-10K", "engagement_rate": "5-8%", "conversion": "0.5-1%"}},
  "instagram": {{"views_range": "500-5K", "engagement_rate": "3-6%", "conversion": "0.3-0.8%"}},
  "twitter": {{"views_range": "1K-5K", "engagement_rate": "2-4%", "conversion": "0.2-0.5%"}},
  "linkedin": {{"views_range": "500-2K", "engagement_rate": "1-3%", "conversion": "0.1-0.3%"}},
  "blog": {{"views_range": "100-1K", "engagement_rate": "10-20%", "conversion": "1-5%"}},
  "email": {{"open_rate": "20-40%", "click_rate": "2-5%", "conversion": "0.5-2%"}},
  "youtube": {{"views_range": "100-1K", "engagement_rate": "5-10%", "conversion": "1-3%"}}
}}
"""
        start_time = time.time()

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=800,
                temperature=0.5,
                messages=[
                    {"role": "system", "content": "You are a social media analytics expert. Return ONLY JSON, nothing else."},
                    {"role": "user", "content": prompt}
                ]
            )

            text = response.choices[0].message.content
            latency = time.time() - start_time
            self._log_format_stats("forecast", response.usage.prompt_tokens, response.usage.completion_tokens, latency)

            try:
                json_match = text[text.find('{'):text.rfind('}')+1]
                return json.loads(json_match)
            except json.JSONDecodeError:
                return {}
        except Exception as e:
            logger.error(f"Engagement forecast error: {str(e)}")
            return {}


# Create singleton instance
repurpose_service = ContentRepurposingService()
