"""
Test script for Content Repurposing Service
Run this to validate the service works end-to-end
"""

import asyncio
import json
import time
from datetime import datetime
from services.content_repurpose_service import repurpose_service

# Sample test data
TEST_CONTENT = """
Today we're going to learn about the top 10 productivity hacks that will change your life.

Hack #1: The Pomodoro Technique
The Pomodoro Technique is a time management method that uses a timer to break work into focused intervals. You work for 25 minutes, then take a 5-minute break. After four pomodoros, you take a longer 15-30 minute break.

This method works because:
- It reduces distractions
- It builds focus gradually
- It prevents burnout
- It's easy to track

Hack #2: The Two-Minute Rule
If a task takes less than 2 minutes, do it immediately. This prevents small tasks from piling up and creating mental clutter. Your email inbox will stay clean, your desk stays organized, and you feel more accomplished.

Hack #3: Time Blocking
Time blocking is scheduling specific times for specific tasks. Instead of a to-do list, you create blocks on your calendar. Monday 9-10am = emails, 10-12pm = deep work, etc.

Benefits:
- Know exactly what you should be doing
- Easier to say no to distractions
- Better work-life balance
- Track actual vs planned time

Hack #4: The 80/20 Rule
80% of results come from 20% of effort. Focus on the 20% of tasks that give you the best results. Not all tasks are created equal.

Hack #5: Batch Similar Tasks
Group similar tasks together. Answer all emails at once, make all phone calls at once, do all admin work together. This reduces context switching.

Context switching is expensive. Every time you switch tasks, your brain needs 15-25 minutes to refocus. If you switch 5 times, that's over an hour lost just to switching.

These 5 hacks will transform how you work. Start with just one and see the difference it makes.
"""

class TestReport:
    """Helper class for formatting test results"""

    def __init__(self):
        self.results = {
            "test_name": "Content Repurposing Service Test",
            "timestamp": datetime.now().isoformat(),
            "tests": []
        }

    def add_test(self, name, status, details=None, duration=None):
        self.results["tests"].append({
            "name": name,
            "status": status,
            "details": details,
            "duration_seconds": duration
        })

    def print_report(self):
        print("\n" + "="*80)
        print("📊 TEST REPORT".center(80))
        print("="*80)

        for test in self.results["tests"]:
            status_symbol = "✅" if test["status"] == "PASS" else "❌"
            print(f"\n{status_symbol} {test['name']}")
            if test["duration_seconds"]:
                print(f"   ⏱️  {test['duration_seconds']:.2f}s")
            if test["details"]:
                print(f"   📝 {test['details']}")

        total_tests = len(self.results["tests"])
        passed = len([t for t in self.results["tests"] if t["status"] == "PASS"])

        print("\n" + "="*80)
        print(f"📈 Summary: {passed}/{total_tests} tests passed")
        print("="*80 + "\n")


async def test_repurpose_service():
    """Test the content repurposing service"""

    report = TestReport()

    # Test 1: Service initialization
    print("🧪 Running tests for ContentRepurposingService...")
    start = time.time()
    try:
        assert repurpose_service is not None
        assert repurpose_service.client is not None
        assert repurpose_service.model is not None
        report.add_test(
            "Service Initialization",
            "PASS",
            f"Model: {repurpose_service.model}",
            time.time() - start
        )
        print("✅ Service initialized successfully")
    except Exception as e:
        report.add_test(
            "Service Initialization",
            "FAIL",
            str(e),
            time.time() - start
        )
        print(f"❌ Service initialization failed: {e}")
        return report

    # Test 2: Input validation
    print("\n🧪 Testing input validation...")
    start = time.time()
    try:
        # Check content length
        if len(TEST_CONTENT) < 100:
            raise ValueError("Content too short (< 100 words)")

        word_count = len(TEST_CONTENT.split())
        report.add_test(
            "Input Validation",
            "PASS",
            f"Content: {word_count} words (minimum 100 required)",
            time.time() - start
        )
        print(f"✅ Content valid: {word_count} words")
    except Exception as e:
        report.add_test(
            "Input Validation",
            "FAIL",
            str(e),
            time.time() - start
        )
        print(f"❌ Validation failed: {e}")
        return report

    # Test 3: Prompt generation
    print("\n🧪 Testing prompt generation...")
    start = time.time()
    try:
        formats = ["tiktok", "instagram", "twitter", "blog", "email", "podcast", "linkedin"]
        prompts = {}

        for fmt in formats:
            prompt = repurpose_service._create_prompt(
                TEST_CONTENT,
                fmt,
                "Productivity",
                "Business",
                "Professionals"
            )
            assert prompt is not None
            assert len(prompt) > 100
            prompts[fmt] = len(prompt)

        report.add_test(
            "Prompt Generation",
            "PASS",
            f"Generated 7 format-specific prompts: {prompts}",
            time.time() - start
        )
        print(f"✅ Prompts generated successfully")
        for fmt, length in prompts.items():
            print(f"   - {fmt}: {length} characters")
    except Exception as e:
        report.add_test(
            "Prompt Generation",
            "FAIL",
            str(e),
            time.time() - start
        )
        print(f"❌ Prompt generation failed: {e}")
        return report

    # Test 4: Full repurposing (the main test!)
    print("\n🧪 Testing full content repurposing (this takes 1-2 min)...")
    start = time.time()
    try:
        result = await repurpose_service.repurpose_content(
            original_content=TEST_CONTENT,
            content_type="blog",
            content_title="10 Productivity Hacks",
            topic="Productivity",
            niche="Business",
            target_audience="Professionals"
        )

        elapsed = time.time() - start

        # Validate results
        assert result["status"] == "completed", f"Status is {result['status']}, not completed"
        assert result["tiktok_scripts"] is not None, "TikTok scripts not generated"
        assert result["instagram_captions"] is not None, "Instagram captions not generated"
        assert result["twitter_thread"] is not None, "Twitter thread not generated"
        assert result["blog_post"] is not None, "Blog post not generated"
        assert result["email_scripts"] is not None, "Email scripts not generated"
        assert result["podcast_notes"] is not None, "Podcast notes not generated"
        assert result["linkedin_post"] is not None, "LinkedIn post not generated"

        report.add_test(
            "Full Repurposing Pipeline",
            "PASS",
            f"Generated all 7 formats successfully",
            elapsed
        )
        print(f"✅ Repurposing completed in {elapsed:.2f} seconds")

        # Test 5: Output quality
        print("\n🧪 Testing output quality...")
        start = time.time()
        try:
            quality_checks = {
                "TikTok scripts": len(result["tiktok_scripts"]) == 3,
                "Instagram captions": len(result["instagram_captions"]) == 5,
                "Twitter thread": len(result["twitter_thread"]) > 0,
                "Blog post": len(result["blog_post"]) > 500,
                "Email scripts": isinstance(result["email_scripts"], dict),
                "Podcast notes": isinstance(result["podcast_notes"], dict),
                "LinkedIn post": isinstance(result["linkedin_post"], dict),
                "Hashtags": result["hashtags"] is not None,
                "Posting times": result["best_posting_times"] is not None,
                "Engagement forecast": result["engagement_forecast"] is not None
            }

            all_passed = all(quality_checks.values())
            status = "PASS" if all_passed else "PARTIAL"

            details = "Quality checks:\n"
            for check, passed in quality_checks.items():
                symbol = "✅" if passed else "❌"
                details += f"   {symbol} {check}\n"

            report.add_test(
                "Output Quality",
                status,
                details.strip(),
                time.time() - start
            )
            print(f"✅ Quality validation: {sum(quality_checks.values())}/{len(quality_checks)} passed")

        except Exception as e:
            report.add_test(
                "Output Quality",
                "FAIL",
                str(e),
                time.time() - start
            )
            print(f"❌ Quality check failed: {e}")

        # Test 6: Output samples
        print("\n🧪 Testing output samples...")
        start = time.time()
        try:
            samples = {
                "TikTok Script #1": result["tiktok_scripts"][0].get("script", "")[:100] if result["tiktok_scripts"] else "",
                "Instagram Caption #1": result["instagram_captions"][0].get("caption", "")[:100] if result["instagram_captions"] else "",
                "Twitter Tweet #1": result["twitter_thread"][0][:100] if result["twitter_thread"] else "",
                "Blog Post (first 100 chars)": result["blog_post"][:100] if result["blog_post"] else "",
            }

            all_have_content = all(len(str(v)) > 20 for v in samples.values())

            details = "Sample outputs:\n"
            for name, content in samples.items():
                details += f"   📄 {name}...\n"

            report.add_test(
                "Output Samples",
                "PASS" if all_have_content else "PARTIAL",
                details.strip(),
                time.time() - start
            )
            print(f"✅ Sample content extracted successfully")

        except Exception as e:
            report.add_test(
                "Output Samples",
                "FAIL",
                str(e),
                time.time() - start
            )
            print(f"❌ Sample extraction failed: {e}")

        # Print detailed results
        print("\n" + "="*80)
        print("📋 DETAILED OUTPUT PREVIEW")
        print("="*80)

        print("\n🎬 TikTok Scripts:")
        if result["tiktok_scripts"]:
            for i, script in enumerate(result["tiktok_scripts"][:1]):
                print(f"   Script {i+1}:")
                print(f"   Hook: {script.get('hook', 'N/A')[:60]}...")
                print(f"   Duration: {script.get('duration_seconds', 'N/A')}s")

        print("\n📸 Instagram Captions:")
        if result["instagram_captions"]:
            for i, caption in enumerate(result["instagram_captions"][:1]):
                print(f"   Caption {i+1}:")
                print(f"   {caption.get('caption', 'N/A')[:80]}...")

        print("\n🐦 Twitter Thread:")
        if result["twitter_thread"]:
            print(f"   Tweet count: {len(result['twitter_thread'])}")
            print(f"   First tweet: {result['twitter_thread'][0][:80]}...")

        print("\n📝 Blog Post:")
        if result["blog_post"]:
            print(f"   Length: {len(result['blog_post'])} characters")
            print(f"   Preview: {result['blog_post'][:100]}...")

        print("\n📊 Metadata:")
        if result["hashtags"]:
            print(f"   Hashtags: {list(result['hashtags'].keys())}")
        if result["best_posting_times"]:
            print(f"   Posting times: {len(result['best_posting_times'])} platforms")

        report.print_report()

        return report

    except Exception as e:
        elapsed = time.time() - start
        report.add_test(
            "Full Repurposing Pipeline",
            "FAIL",
            str(e),
            elapsed
        )
        print(f"❌ Repurposing failed: {e}")
        import traceback
        traceback.print_exc()
        report.print_report()
        return report


if __name__ == "__main__":
    print("🚀 Starting Content Repurposing Service Tests\n")
    print(f"Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Content length: {len(TEST_CONTENT)} characters, {len(TEST_CONTENT.split())} words\n")

    # Run async test
    report = asyncio.run(test_repurpose_service())

    # Save report
    with open("test_results.json", "w") as f:
        json.dump(report.results, f, indent=2)
    print("📁 Results saved to test_results.json")
