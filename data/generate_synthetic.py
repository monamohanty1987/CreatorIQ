"""
CreatorIQ Synthetic Data Generator
Generates realistic synthetic data for all 4 modules using Faker.
Covers creator profiles, digital products, audience health, content history,
brand deals, contracts, email campaigns, and abandoned checkouts.

Niches: Finance, Tech, Travel, Food, Beauty, Gaming, Education,
        Photography, Business, Home Decor, Parenting, Music,
        Comedy, Science, Language Learning, Sustainable Living,
        Personal Development, Pet Care
"""

import pandas as pd
import numpy as np
from faker import Faker
import random
import os
from datetime import datetime, timedelta

fake = Faker()
random.seed(42)
np.random.seed(42)

OUTPUT = "C:/CreatorIQ Project/data/raw/synthetic"
os.makedirs(OUTPUT, exist_ok=True)

# ─── CONSTANTS ────────────────────────────────────────────────────────────────

NICHES = [
    "Finance & Investing",
    "Technology & Software",
    "Travel & Adventure",
    "Food & Cooking",
    "Beauty & Fashion",
    "Gaming & Esports",
    "Education & Online Courses",
    "Photography & Videography",
    "Business & Entrepreneurship",
    "Home Decor & Interior Design",
    "Parenting & Family",
    "Music & Audio Production",
    "Comedy & Entertainment",
    "Science & Space",
    "Language Learning",
    "Sustainable Living",
    "Personal Development",
    "Pet Care",
]

PLATFORMS = ["YouTube", "Instagram", "TikTok", "LinkedIn", "Twitter/X", "Substack"]

FOLLOWER_TIERS = {
    "Nano":    (1_000,   10_000),
    "Micro":   (10_000,  100_000),
    "Mid":     (100_000, 500_000),
    "Macro":   (500_000, 1_000_000),
    "Mega":    (1_000_000, 5_000_000),
}

PRODUCT_TYPES = {
    "Finance & Investing":          ["Budget Spreadsheet", "Investment Tracker", "Options Playbook", "Crypto Guide", "Financial Freedom Course"],
    "Technology & Software":        ["Notion Template Pack", "VS Code Setup Guide", "AI Prompts Bundle", "Dev Roadmap PDF", "Automation Course"],
    "Travel & Adventure":           ["Itinerary Bundle", "Packing List PDF", "Travel Hacking Guide", "City Guide Pack", "Flight Deal Tracker"],
    "Food & Cooking":               ["Recipe eBook", "Meal Prep Guide", "Knife Skills Course", "Fermentation Guide", "Baking Masterclass"],
    "Beauty & Fashion":             ["Capsule Wardrobe Guide", "Skincare Routine PDF", "Colour Analysis Guide", "Style Bundle", "Makeup Masterclass"],
    "Gaming & Esports":             ["Pro Settings Pack", "Game Guide PDF", "Stream Setup Checklist", "Clip Editing Template", "Ranking Course"],
    "Education & Online Courses":   ["Study System PDF", "Note-Taking Bundle", "Exam Prep Kit", "Research Template", "Learning Roadmap"],
    "Photography & Videography":    ["Lightroom Preset Pack", "Composition Guide", "Editing Course", "Camera Settings PDF", "Portfolio Template"],
    "Business & Entrepreneurship":  ["Business Plan Template", "Pitch Deck Kit", "Cold Email Scripts", "Pricing Playbook", "Launch Checklist"],
    "Home Decor & Interior Design": ["Room Planning Guide", "Colour Palette Pack", "Furniture Layout PDF", "Styling Checklist", "DIY Tutorial Bundle"],
    "Parenting & Family":           ["Chore Chart Template", "Reading Log PDF", "Family Budget Sheet", "Activity Ideas Bundle", "Sleep Schedule Guide"],
    "Music & Audio Production":     ["Sample Pack", "Mixing Template", "Chord Progression PDF", "Vocal Warm-Up Guide", "Beat Making Course"],
    "Comedy & Entertainment":       ["Joke Writing Guide", "Script Template", "Improv Exercise Pack", "Storytelling Course", "Content Calendar"],
    "Science & Space":              ["Astronomy Guide PDF", "Experiment Bundle", "Lab Notebook Template", "Study Cards Pack", "Science Course"],
    "Language Learning":            ["Vocabulary Flash Cards", "Grammar Cheat Sheet", "Phrase Book PDF", "Study Schedule", "Accent Reduction Guide"],
    "Sustainable Living":           ["Zero-Waste Starter Guide", "Eco Swap Checklist", "Plant-Based Recipe Book", "Sustainability Tracker", "Green Home Guide"],
    "Personal Development":         ["Habit Tracker Notion", "Journal Prompts PDF", "Goal Setting Workbook", "Morning Routine Guide", "Confidence Course"],
    "Pet Care":                     ["Dog Training Guide", "Cat Behaviour PDF", "Pet Nutrition Sheet", "Vet Visit Checklist", "Pet First Aid Guide"],
}

BRANDS = [
    "NordVPN", "Squarespace", "Skillshare", "Audible", "Brilliant",
    "Morning Brew", "ExpressVPN", "Notion", "Canva", "Hubspot",
    "Shopify", "LastPass", "Raycon", "Ridge Wallet", "MVMT Watches",
    "MasterClass", "Codecademy", "Wix", "Hover", "Grammarly",
    "HelloFresh", "Blue Apron", "Headspace", "Calm", "Noom",
    "Dollar Shave Club", "Manscaped", "Athletic Greens", "Magic Spoon",
    "Factor Meals", "Public", "Acorns", "Betterment", "Robinhood",
    "Fiverr", "Toptal", "Monday.com", "Asana", "Airtable",
]

CONTENT_FORMATS = ["YouTube Video", "Instagram Reel", "TikTok", "Instagram Post",
                   "Instagram Story", "LinkedIn Post", "Substack Issue", "YouTube Short"]

RED_FLAG_CLAUSES = [
    "Brand retains perpetual, worldwide, irrevocable rights to use all content in paid advertising without additional compensation.",
    "Creator agrees not to promote any competing products in the same category for a period of 24 months.",
    "Brand may request unlimited revisions at no additional cost.",
    "Payment terms: Net 90 days from content publication.",
    "Creator grants brand exclusive rights to creator likeness for category promotion indefinitely.",
    "Brand approval required for all creator content across all platforms during campaign period.",
    "Creator waives moral rights to all content produced under this agreement.",
]

CLEAN_CLAUSES = [
    "Brand may use content in paid advertising for 90 days from publication for an additional usage fee of 35% of base rate.",
    "Creator agrees not to promote direct competitors in the same subcategory for 60 days.",
    "Brand may request up to 2 rounds of revisions within 7 days of content submission.",
    "Payment terms: Net 30 days from invoice date.",
    "Creator grants brand non-exclusive rights to creator likeness for campaign duration only.",
    "Creator retains full creative control subject to brand safety guidelines.",
    "Creator retains all intellectual property rights to content.",
]

# ─── GENERATOR FUNCTIONS ──────────────────────────────────────────────────────

def random_followers(tier=None):
    if tier is None:
        tier = random.choices(
            list(FOLLOWER_TIERS.keys()),
            weights=[5, 35, 40, 15, 5]
        )[0]
    lo, hi = FOLLOWER_TIERS[tier]
    return random.randint(lo, hi), tier


def engagement_rate(followers, platform):
    base = {
        "YouTube": 0.04, "Instagram": 0.035, "TikTok": 0.06,
        "LinkedIn": 0.025, "Twitter/X": 0.02, "Substack": 0.45,
    }.get(platform, 0.03)
    noise = random.gauss(0, base * 0.3)
    return round(max(0.005, base + noise), 4)


def random_date(start_days_ago=730, end_days_ago=0):
    start = datetime.now() - timedelta(days=start_days_ago)
    end = datetime.now() - timedelta(days=end_days_ago)
    delta = end - start
    return start + timedelta(days=random.randint(0, delta.days))


# ─── 1. CREATOR PROFILES ─────────────────────────────────────────────────────
print("[1/9] Generating creator_profiles.csv ...")

profiles = []
for i in range(600):
    niche = random.choice(NICHES)
    platform = random.choice(PLATFORMS)
    followers, tier = random_followers()
    er = engagement_rate(followers, platform)
    monthly_revenue = followers * random.uniform(0.002, 0.012) * (1 + er * 10)
    profiles.append({
        "creator_id": f"CRE{i+1:04d}",
        "username": fake.user_name(),
        "niche": niche,
        "primary_platform": platform,
        "secondary_platform": random.choice([p for p in PLATFORMS if p != platform]),
        "follower_count": followers,
        "follower_tier": tier,
        "engagement_rate": er,
        "monthly_revenue_usd": round(monthly_revenue, 2),
        "years_active": round(random.uniform(0.5, 8), 1),
        "email_list_size": int(followers * random.uniform(0.02, 0.15)),
        "country": fake.country(),
        "audience_age_group": random.choice(["18-24", "25-34", "35-44", "45+"]),
        "audience_gender_primary": random.choice(["Female", "Male", "Mixed"]),
        "posts_per_week": round(random.uniform(1, 7), 1),
        "joined_date": random_date(2920, 180).strftime("%Y-%m-%d"),
    })

df_profiles = pd.DataFrame(profiles)
df_profiles.to_csv(f"{OUTPUT}/creator_profiles.csv", index=False)
print(f"   -> {len(df_profiles)} rows saved")


# ─── 2. DIGITAL PRODUCTS ─────────────────────────────────────────────────────
print("[2/9] Generating digital_products.csv ...")

products = []
for i in range(2500):
    niche = random.choice(NICHES)
    product_type = random.choice(PRODUCT_TYPES[niche])
    tier = random.choices(list(FOLLOWER_TIERS.keys()), weights=[5, 35, 40, 15, 5])[0]
    followers, _ = random_followers(tier)

    base_price = {
        "Nano": random.uniform(7, 27),
        "Micro": random.uniform(17, 67),
        "Mid": random.uniform(37, 197),
        "Macro": random.uniform(97, 497),
        "Mega": random.uniform(197, 997),
    }[tier]

    actual_price = round(base_price * random.uniform(0.5, 1.5), 2)
    market_price = round(base_price * random.uniform(0.9, 1.1), 2)
    units_sold = int(followers * random.uniform(0.001, 0.03) * random.uniform(0.5, 2))
    conversion_rate = round(random.uniform(0.01, 0.08), 4)
    launch_date = random_date(730, 30)

    products.append({
        "product_id": f"PRD{i+1:05d}",
        "creator_id": f"CRE{random.randint(1, 600):04d}",
        "product_name": product_type,
        "niche": niche,
        "product_type": random.choice(["eBook", "Template", "Course", "Bundle", "Guide", "Preset Pack"]),
        "price_usd": actual_price,
        "market_price_usd": market_price,
        "price_gap_pct": round((market_price - actual_price) / market_price * 100, 1),
        "units_sold": units_sold,
        "total_revenue_usd": round(actual_price * units_sold, 2),
        "conversion_rate": conversion_rate,
        "platform_sold_on": random.choice(["Gumroad", "Etsy", "Teachable", "Podia", "Own Website", "Patreon"]),
        "launch_date": launch_date.strftime("%Y-%m-%d"),
        "creator_follower_tier": tier,
        "creator_niche": niche,
        "has_affiliate_programme": random.choice([True, False]),
        "affiliate_commission_pct": round(random.uniform(0.1, 0.4), 2) if random.random() > 0.4 else 0,
        "rating": round(random.uniform(3.5, 5.0), 1),
        "review_count": random.randint(0, 500),
    })

df_products = pd.DataFrame(products)
df_products.to_csv(f"{OUTPUT}/digital_products.csv", index=False)
print(f"   -> {len(df_products)} rows saved")


# ─── 3. AUDIENCE HEALTH WEEKLY ───────────────────────────────────────────────
print("[3/9] Generating audience_health_weekly.csv ...")

health_rows = []
for creator_id in [f"CRE{i+1:04d}" for i in range(200)]:
    niche = random.choice(NICHES)
    platform = random.choice(PLATFORMS)
    base_followers = random.randint(50_000, 500_000)
    base_er = engagement_rate(base_followers, platform)

    # Simulate 52 weeks; inject a penalty event for ~40% of creators
    has_penalty = random.random() < 0.4
    penalty_week = random.randint(20, 45) if has_penalty else None

    for week in range(1, 53):
        penalty_active = has_penalty and penalty_week <= week <= penalty_week + 8
        recovery = has_penalty and week > penalty_week + 8

        # Calculate weekly metrics
        follower_change = int(base_followers * random.gauss(0.005, 0.01))
        if penalty_active:
            follower_change -= int(base_followers * random.uniform(0.01, 0.04))
        if recovery:
            follower_change += int(base_followers * random.uniform(0.003, 0.008))

        er_weekly = base_er * (0.6 if penalty_active else 1.0) * random.uniform(0.85, 1.15)
        save_rate = round(er_weekly * random.uniform(0.1, 0.3), 4)
        watch_time_pct = round(random.gauss(0.42 if not penalty_active else 0.28, 0.06), 3)
        comment_sentiment = round(random.gauss(0.72 if not penalty_active else 0.48, 0.1), 3)
        share_view_ratio = round(er_weekly * random.uniform(0.05, 0.15), 4)
        new_viewer_ratio = round(random.uniform(0.25, 0.55) * (0.7 if penalty_active else 1.0), 3)
        unsubscribe_rate = round(random.uniform(0.001, 0.008) * (2.5 if penalty_active else 1.0), 4)
        post_frequency = round(random.uniform(1.5, 6) * (0.7 if penalty_active else 1.0), 1)
        days_since_community = random.randint(0, 21) if not penalty_active else random.randint(5, 30)

        health_score = (
            (min(watch_time_pct / 0.5, 1) * 25) +
            (min(comment_sentiment, 1) * 20) +
            (min(save_rate / 0.05, 1) * 20) +
            (min(new_viewer_ratio / 0.5, 1) * 15) +
            (max(1 - unsubscribe_rate / 0.01, 0) * 10) +
            (min(post_frequency / 5, 1) * 10)
        )
        health_score = round(min(max(health_score, 0), 100), 1)

        risk_level = "Safe"
        if health_score < 40: risk_level = "Critical"
        elif health_score < 55: risk_level = "Alert"
        elif health_score < 70: risk_level = "Watch"

        week_date = (datetime.now() - timedelta(weeks=52-week)).strftime("%Y-%m-%d")

        health_rows.append({
            "creator_id": creator_id,
            "niche": niche,
            "platform": platform,
            "week_number": week,
            "week_date": week_date,
            "follower_count": max(base_followers + follower_change, 1000),
            "weekly_follower_change": follower_change,
            "engagement_rate": round(er_weekly, 4),
            "save_rate": save_rate,
            "watch_time_pct": max(watch_time_pct, 0.05),
            "comment_sentiment_score": round(min(max(comment_sentiment, 0), 1), 3),
            "share_to_view_ratio": share_view_ratio,
            "new_viewer_ratio": round(min(max(new_viewer_ratio, 0), 1), 3),
            "unsubscribe_rate": unsubscribe_rate,
            "post_frequency_per_week": post_frequency,
            "days_since_community_post": days_since_community,
            "health_score": health_score,
            "risk_level": risk_level,
            "algorithm_penalty_active": penalty_active,
        })

df_health = pd.DataFrame(health_rows)
df_health.to_csv(f"{OUTPUT}/audience_health_weekly.csv", index=False)
print(f"   -> {len(df_health)} rows saved")


# ─── 4. CONTENT HISTORY ──────────────────────────────────────────────────────
print("[4/9] Generating content_history.csv ...")

content_rows = []
content_topics = {
    "Finance & Investing":          ["How I Paid Off Debt", "Investing for Beginners", "Budget Review", "Stock Market Explained", "Passive Income Ideas"],
    "Technology & Software":        ["Best AI Tools 2025", "Notion Setup Tour", "Coding Tutorial", "App Review", "Tech Gear Setup"],
    "Travel & Adventure":           ["Hidden Gems in Bali", "Budget Europe Trip", "Travel Hacks", "Solo Travel Guide", "City Vlog"],
    "Food & Cooking":               ["5-Ingredient Dinner", "Street Food Tour", "Recipe Breakdown", "Meal Prep Sunday", "Restaurant Review"],
    "Beauty & Fashion":             ["Get Ready With Me", "Outfit of the Week", "Skincare Routine", "Thrift Haul", "Makeup Tutorial"],
    "Gaming & Esports":             ["New Game Review", "Pro Tips", "Stream Highlights", "Game Lore Deep Dive", "Challenge Run"],
    "Education & Online Courses":   ["Study With Me", "Book Summary", "Learning Hack", "Course Review", "Note-Taking System"],
    "Photography & Videography":    ["Camera Gear Review", "Editing Tutorial", "Photo Walk Vlog", "Behind the Scenes", "Preset Tutorial"],
    "Business & Entrepreneurship":  ["My Revenue Report", "How I Got Clients", "Business Mistakes", "Productivity System", "Cold Email Tips"],
    "Home Decor & Interior Design": ["Room Makeover", "IKEA Hacks", "Small Space Ideas", "Colour Palette Guide", "Budget Decor"],
    "Parenting & Family":           ["Morning Routine With Kids", "Honest Parenting", "Kid-Friendly Recipes", "School Tips", "Family Vlog"],
    "Music & Audio Production":     ["Beat Making Tutorial", "Song Breakdown", "Studio Vlog", "Music Theory Explained", "Gear Review"],
    "Comedy & Entertainment":       ["Sketch Comedy", "Reaction Video", "Storytime", "Day in My Life", "Parody"],
    "Science & Space":              ["Space Discovery Explained", "Science Experiment", "Myth Busting", "Documentary Reaction", "Research Breakdown"],
    "Language Learning":            ["Learn 100 Words Fast", "Language Learning Mistakes", "Immersion Tips", "Conversation Practice", "Grammar Explained"],
    "Sustainable Living":           ["Zero Waste Swaps", "Eco Product Review", "Sustainable Fashion", "Plant-Based Meal", "Green Home Tour"],
    "Personal Development":         ["Morning Routine", "Book That Changed My Life", "Productivity System", "Mindset Shift", "Goal Setting"],
    "Pet Care":                     ["Dog Training Tips", "Cat Behaviour Explained", "Pet Haul", "Vet Visit Story", "Rescue Animal Story"],
}

for i in range(5000):
    niche = random.choice(NICHES)
    creator_id = f"CRE{random.randint(1, 600):04d}"
    platform = random.choice(PLATFORMS)
    content_format = random.choice(CONTENT_FORMATS)
    topic = random.choice(content_topics[niche])
    publish_date = random_date(180, 1)

    views = int(random.lognormvariate(10, 1.5))
    likes = int(views * random.uniform(0.02, 0.12))
    comments = int(views * random.uniform(0.002, 0.03))
    saves = int(views * random.uniform(0.005, 0.05))
    shares = int(views * random.uniform(0.005, 0.04))

    # Revenue attribution (some content converts much better)
    is_converting = random.random() < 0.25
    affiliate_clicks = int(views * random.uniform(0.01, 0.08)) if is_converting else int(views * random.uniform(0, 0.01))
    affiliate_revenue = round(affiliate_clicks * random.uniform(0.5, 8.0), 2) if is_converting else 0
    product_sales = int(affiliate_clicks * random.uniform(0.02, 0.1)) if is_converting else 0
    product_revenue = round(product_sales * random.uniform(19, 197), 2) if is_converting else 0
    total_revenue = round(affiliate_revenue + product_revenue, 2)

    production_hours = {"YouTube Video": random.uniform(4, 10),
                        "Instagram Reel": random.uniform(1, 4),
                        "TikTok": random.uniform(0.5, 3),
                        "Instagram Post": random.uniform(0.5, 2),
                        "Instagram Story": random.uniform(0.1, 0.5),
                        "LinkedIn Post": random.uniform(0.3, 1.5),
                        "Substack Issue": random.uniform(1, 5),
                        "YouTube Short": random.uniform(0.5, 2)}.get(content_format, 2)

    revenue_per_hour = round(total_revenue / max(production_hours, 0.1), 2)

    content_rows.append({
        "content_id": f"CON{i+1:05d}",
        "creator_id": creator_id,
        "niche": niche,
        "platform": platform,
        "content_format": content_format,
        "topic": topic,
        "publish_date": publish_date.strftime("%Y-%m-%d"),
        "views": views,
        "likes": likes,
        "comments": comments,
        "saves": saves,
        "shares": shares,
        "watch_time_pct": round(random.uniform(0.2, 0.75), 3),
        "affiliate_clicks": affiliate_clicks,
        "affiliate_revenue_usd": affiliate_revenue,
        "product_sales": product_sales,
        "product_revenue_usd": product_revenue,
        "total_revenue_usd": total_revenue,
        "production_hours": round(production_hours, 1),
        "revenue_per_hour_usd": revenue_per_hour,
        "is_high_converting": is_converting,
        "has_affiliate_link": affiliate_clicks > 0,
        "has_product_link": product_sales > 0,
    })

df_content = pd.DataFrame(content_rows)
df_content.to_csv(f"{OUTPUT}/content_history.csv", index=False)
print(f"   -> {len(df_content)} rows saved")


# ─── 5. BRAND DEALS ──────────────────────────────────────────────────────────
print("[5/9] Generating brand_deals.csv ...")

deal_rows = []
for i in range(2000):
    niche = random.choice(NICHES)
    platform = random.choice(PLATFORMS)
    followers, tier = random_followers()
    er = engagement_rate(followers, platform)
    content_format = random.choice(["Dedicated Video", "Integration", "Instagram Post", "Reel", "TikTok", "Story Series", "Newsletter"])
    brand = random.choice(BRANDS)

    niche_premium = {"Finance & Investing": 1.6, "Technology & Software": 1.5,
                     "Business & Entrepreneurship": 1.45, "Education & Online Courses": 1.3,
                     "Gaming & Esports": 1.2, "Travel & Adventure": 1.15,
                     "Beauty & Fashion": 1.1, "Food & Cooking": 1.05,
                     "Personal Development": 1.1, "Science & Space": 1.2}.get(niche, 1.0)

    format_multiplier = {"Dedicated Video": 1.8, "Integration": 1.0, "Instagram Post": 0.7,
                         "Reel": 0.9, "TikTok": 0.85, "Story Series": 0.6, "Newsletter": 1.2}.get(content_format, 1.0)

    base_rate = (followers / 1000) * 12 * niche_premium * format_multiplier * (1 + er * 8)
    market_rate = round(base_rate * random.uniform(0.9, 1.1), 2)
    offered_rate = round(market_rate * random.uniform(0.3, 0.85), 2)
    negotiated_rate = round(offered_rate * random.uniform(1.0, 1.6), 2)
    final_rate = min(negotiated_rate, market_rate * 1.05)
    usage_rights_included = random.choice([True, False])
    usage_rights_fee = round(final_rate * random.uniform(0.3, 0.5), 2) if usage_rights_included else 0
    exclusivity_months = random.choice([0, 0, 0, 1, 2, 3, 6, 12])
    exclusivity_fee = round(final_rate * 0.25 * (exclusivity_months / 3), 2) if exclusivity_months > 0 else 0
    total_deal_value = round(final_rate + usage_rights_fee + exclusivity_fee, 2)
    deal_date = random_date(365, 0)

    deal_rows.append({
        "deal_id": f"DEA{i+1:05d}",
        "creator_id": f"CRE{random.randint(1, 600):04d}",
        "brand": brand,
        "niche": niche,
        "platform": platform,
        "content_format": content_format,
        "follower_count": followers,
        "follower_tier": tier,
        "engagement_rate": er,
        "offered_rate_usd": offered_rate,
        "market_rate_usd": market_rate,
        "offer_vs_market_pct": round((offered_rate / market_rate - 1) * 100, 1),
        "negotiated_rate_usd": round(final_rate, 2),
        "usage_rights_included": usage_rights_included,
        "usage_rights_fee_usd": usage_rights_fee,
        "exclusivity_months": exclusivity_months,
        "exclusivity_fee_usd": exclusivity_fee,
        "total_deal_value_usd": total_deal_value,
        "payment_terms_days": random.choice([15, 30, 30, 30, 45, 60, 90]),
        "kill_fee_included": random.choice([True, False]),
        "revision_rounds_allowed": random.choice([1, 2, 2, 3, 5, "Unlimited"]),
        "deal_date": deal_date.strftime("%Y-%m-%d"),
        "status": random.choice(["Completed", "Completed", "Completed", "In Progress", "Negotiating", "Declined"]),
        "used_ai_benchmark": random.choice([True, False]),
    })

df_deals = pd.DataFrame(deal_rows)
df_deals.to_csv(f"{OUTPUT}/brand_deals.csv", index=False)
print(f"   -> {len(df_deals)} rows saved")


# ─── 6. CONTRACT SAMPLES ─────────────────────────────────────────────────────
print("[6/9] Generating contract_samples.csv ...")

contract_rows = []
for i in range(800):
    niche = random.choice(NICHES)
    brand = random.choice(BRANDS)
    num_red_flags = random.choices([0, 1, 2, 3, 4], weights=[20, 30, 25, 15, 10])[0]
    red_flags = random.sample(RED_FLAG_CLAUSES, min(num_red_flags, len(RED_FLAG_CLAUSES)))
    clean = random.sample(CLEAN_CLAUSES, min(7 - num_red_flags, len(CLEAN_CLAUSES)))
    all_clauses = red_flags + clean

    hidden_value_lost = num_red_flags * random.uniform(300, 2500)

    contract_rows.append({
        "contract_id": f"CON{i+1:04d}",
        "creator_id": f"CRE{random.randint(1, 600):04d}",
        "brand": brand,
        "niche": niche,
        "total_clauses": len(all_clauses),
        "red_flag_count": num_red_flags,
        "compliant_clause_count": len(clean),
        "missing_kill_fee": random.choice([True, False]),
        "missing_ftc_disclosure": num_red_flags > 2 and random.random() > 0.5,
        "has_perpetual_exclusivity": any("perpetual" in c and "exclusivity" in c for c in red_flags),
        "has_uncompensated_usage_rights": any("paid advertising" in c and "compensation" in c for c in red_flags),
        "payment_terms_days": random.choice([30, 30, 30, 45, 60, 90, 90]),
        "revision_rounds_stated": random.choice([1, 2, 2, 3, "Unlimited", "Unlimited"]),
        "estimated_hidden_value_usd": round(hidden_value_lost, 2),
        "risk_rating": "Critical" if num_red_flags >= 3 else "High" if num_red_flags == 2 else "Medium" if num_red_flags == 1 else "Low",
        "contract_date": random_date(365, 0).strftime("%Y-%m-%d"),
        "analysed_by_ai": random.choice([True, False]),
    })

df_contracts = pd.DataFrame(contract_rows)
df_contracts.to_csv(f"{OUTPUT}/contract_samples.csv", index=False)
print(f"   -> {len(df_contracts)} rows saved")


# ─── 7. EMAIL CAMPAIGNS ──────────────────────────────────────────────────────
print("[7/9] Generating email_campaigns.csv ...")

campaign_types = ["Product Launch", "Abandoned Cart Recovery", "Weekly Newsletter",
                  "Promotional Offer", "New Content Alert", "Re-engagement"]

email_rows = []
for i in range(1200):
    campaign_type = random.choice(campaign_types)
    list_size = random.randint(200, 15000)

    open_rate_base = {"Product Launch": 0.38, "Abandoned Cart Recovery": 0.45,
                      "Weekly Newsletter": 0.28, "Promotional Offer": 0.25,
                      "New Content Alert": 0.32, "Re-engagement": 0.18}.get(campaign_type, 0.28)

    open_rate = round(open_rate_base * random.uniform(0.7, 1.4), 3)
    click_rate = round(open_rate * random.uniform(0.1, 0.35), 3)
    conversion_rate = round(click_rate * random.uniform(0.05, 0.2), 4)
    revenue_per_email = round(random.uniform(0.5, 12) if campaign_type in ["Product Launch", "Abandoned Cart Recovery", "Promotional Offer"] else 0, 2)
    total_revenue = round(list_size * open_rate * click_rate * revenue_per_email * 10, 2)

    email_rows.append({
        "campaign_id": f"EML{i+1:04d}",
        "creator_id": f"CRE{random.randint(1, 600):04d}",
        "campaign_type": campaign_type,
        "niche": random.choice(NICHES),
        "email_list_size": list_size,
        "emails_sent": int(list_size * random.uniform(0.92, 1.0)),
        "open_rate": open_rate,
        "click_rate": click_rate,
        "conversion_rate": conversion_rate,
        "unsubscribe_rate": round(random.uniform(0.001, 0.015), 4),
        "revenue_generated_usd": total_revenue,
        "revenue_per_email_usd": revenue_per_email,
        "ai_generated_copy": random.choice([True, False]),
        "send_date": random_date(365, 0).strftime("%Y-%m-%d"),
        "send_day_of_week": random.choice(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
        "subject_line_length": random.randint(30, 75),
        "has_emoji_in_subject": random.choice([True, False]),
        "sequence_number": random.randint(1, 5),
    })

df_email = pd.DataFrame(email_rows)
df_email.to_csv(f"{OUTPUT}/email_campaigns.csv", index=False)
print(f"   -> {len(df_email)} rows saved")


# ─── 8. ABANDONED CHECKOUTS ──────────────────────────────────────────────────
print("[8/9] Generating abandoned_checkouts.csv ...")

checkout_rows = []
for i in range(1500):
    product_price = round(random.choice([9, 17, 27, 37, 47, 67, 97, 127, 197, 297, 497]), 2)
    recovery_email_sent = random.choice([True, True, False])
    time_to_email_hours = round(random.uniform(0.5, 4), 1) if recovery_email_sent else None
    recovered = recovery_email_sent and random.random() < 0.08
    abandon_date = random_date(180, 0)

    checkout_rows.append({
        "checkout_id": f"CHK{i+1:05d}",
        "creator_id": f"CRE{random.randint(1, 600):04d}",
        "product_id": f"PRD{random.randint(1, 2500):05d}",
        "niche": random.choice(NICHES),
        "product_price_usd": product_price,
        "abandon_stage": random.choice(["Added to Cart", "Started Checkout", "Payment Info", "Final Review"]),
        "visitor_source": random.choice(["YouTube", "Instagram", "TikTok", "Email", "Direct", "Google"]),
        "recovery_email_sent": recovery_email_sent,
        "time_to_recovery_email_hours": time_to_email_hours,
        "ai_personalised_email": recovery_email_sent and random.choice([True, False]),
        "recovery_email_opened": recovery_email_sent and random.random() < 0.45,
        "recovered": recovered,
        "recovery_revenue_usd": product_price if recovered else 0,
        "abandon_date": abandon_date.strftime("%Y-%m-%d"),
        "abandon_hour": random.randint(0, 23),
        "device_type": random.choice(["Mobile", "Mobile", "Desktop", "Tablet"]),
    })

df_checkout = pd.DataFrame(checkout_rows)
df_checkout.to_csv(f"{OUTPUT}/abandoned_checkouts.csv", index=False)
print(f"   -> {len(df_checkout)} rows saved")


# ─── 9. PRODUCT LAUNCH HISTORY ───────────────────────────────────────────────
print("[9/9] Generating product_launch_history.csv ...")

launch_rows = []
for i in range(1000):
    niche = random.choice(NICHES)
    product_type = random.choice(PRODUCT_TYPES[niche])
    followers, tier = random_followers()
    list_size = int(followers * random.uniform(0.02, 0.12))
    price = round(random.choice([17, 27, 37, 47, 67, 97, 127, 197, 297]), 2)
    used_email_sequence = random.choice([True, True, False])
    num_emails = random.randint(3, 7) if used_email_sequence else 0
    launch_revenue = round(list_size * random.uniform(0.01, 0.05) * price, 2)
    abandoned_pct = round(random.uniform(0.55, 0.80), 3)
    recovered_pct = round(random.uniform(0.03, 0.11) if used_email_sequence else 0.01, 3)
    recovery_revenue = round(launch_revenue * abandoned_pct * recovered_pct, 2)
    launch_date = random_date(730, 30)

    launch_rows.append({
        "launch_id": f"LNC{i+1:04d}",
        "creator_id": f"CRE{random.randint(1, 600):04d}",
        "product_name": product_type,
        "niche": niche,
        "product_type": random.choice(["eBook", "Template", "Course", "Bundle", "Guide", "Preset Pack"]),
        "price_usd": price,
        "follower_tier": tier,
        "email_list_size": list_size,
        "used_email_launch_sequence": used_email_sequence,
        "number_of_launch_emails": num_emails,
        "ai_generated_emails": used_email_sequence and random.choice([True, False]),
        "launch_duration_days": random.choice([3, 5, 7, 10, 14]),
        "units_sold": int(launch_revenue / price),
        "gross_revenue_usd": launch_revenue,
        "cart_abandonment_rate": abandoned_pct,
        "cart_recovery_rate": recovered_pct,
        "recovery_revenue_usd": recovery_revenue,
        "total_revenue_usd": round(launch_revenue + recovery_revenue, 2),
        "refund_rate": round(random.uniform(0.01, 0.08), 3),
        "affiliate_partners": random.randint(0, 20),
        "affiliate_revenue_usd": round(launch_revenue * random.uniform(0, 0.3), 2),
        "launch_date": launch_date.strftime("%Y-%m-%d"),
        "platform_promoted_on": random.choice(PLATFORMS),
    })

df_launches = pd.DataFrame(launch_rows)
df_launches.to_csv(f"{OUTPUT}/product_launch_history.csv", index=False)
print(f"   -> {len(df_launches)} rows saved")


# ─── SUMMARY ─────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("SYNTHETIC DATA GENERATION COMPLETE")
print("=" * 60)
files = os.listdir(OUTPUT)
total_size = 0
for f in sorted(files):
    path = os.path.join(OUTPUT, f)
    size = os.path.getsize(path)
    total_size += size
    rows = len(pd.read_csv(path)) if f.endswith('.csv') else "-"
    print(f"  {f:<45} {rows:>6} rows  {size/1024:.1f} KB")

print(f"\n  Total: {len(files)} files | {total_size/1024/1024:.1f} MB")
print(f"  Niches used: {len(NICHES)} (no fitness category)")
print(f"  Output: {OUTPUT}")
