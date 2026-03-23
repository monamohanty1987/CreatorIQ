"""
CreatorIQ — Dashboard Data Preparation
Merges synthetic datasets into a single Tableau-ready CSV.
Covers all 4 dashboard pages:
  Page 1 — Creator Economy Overview (KPIs, market landscape)
  Page 2 — Audience Health & Churn Risk
  Page 3 — Content Revenue Attribution
  Page 4 — Brand Deal Intelligence
"""

import pandas as pd
import numpy as np
import os

RAW = "C:/CreatorIQ Project/data/raw/synthetic"
OUT = "C:/CreatorIQ Project/data/processed"
os.makedirs(OUT, exist_ok=True)

print("Loading datasets...")
profiles   = pd.read_csv(f"{RAW}/creator_profiles.csv")
deals      = pd.read_csv(f"{RAW}/brand_deals.csv")
health     = pd.read_csv(f"{RAW}/audience_health_weekly.csv")
content    = pd.read_csv(f"{RAW}/content_history.csv")
products   = pd.read_csv(f"{RAW}/digital_products.csv")
launches   = pd.read_csv(f"{RAW}/product_launch_history.csv")
emails     = pd.read_csv(f"{RAW}/email_campaigns.csv")
contracts  = pd.read_csv(f"{RAW}/contract_samples.csv")
checkouts  = pd.read_csv(f"{RAW}/abandoned_checkouts.csv")

# ─── TABLE 1: CREATOR OVERVIEW (Page 1 + 2) ──────────────────────────────────
print("Building creator_overview.csv ...")

# Latest health score per creator
latest_health = (
    health.sort_values("week_number")
    .groupby("creator_id")
    .last()
    .reset_index()[["creator_id", "health_score", "risk_level",
                    "engagement_rate", "watch_time_pct",
                    "comment_sentiment_score", "unsubscribe_rate",
                    "weekly_follower_change"]]
    .rename(columns={"engagement_rate": "current_er"})
)

# Deal stats per creator
deal_stats = deals.groupby("creator_id").agg(
    total_deals=("deal_id", "count"),
    avg_offered_rate=("offered_rate_usd", "mean"),
    avg_market_rate=("market_rate_usd", "mean"),
    avg_deal_value=("total_deal_value_usd", "mean"),
    avg_offer_gap_pct=("offer_vs_market_pct", "mean"),
).reset_index()

# Product stats per creator
product_stats = products.groupby("creator_id").agg(
    total_products=("product_id", "count"),
    avg_product_price=("price_usd", "mean"),
    avg_market_price=("market_price_usd", "mean"),
    avg_price_gap_pct=("price_gap_pct", "mean"),
    total_product_revenue=("total_revenue_usd", "sum"),
).reset_index()

# Content revenue per creator
content_stats = content.groupby("creator_id").agg(
    total_content_pieces=("content_id", "count"),
    total_content_revenue=("total_revenue_usd", "sum"),
    avg_revenue_per_hour=("revenue_per_hour_usd", "mean"),
    high_converting_pieces=("is_high_converting", "sum"),
).reset_index()

overview = (
    profiles
    .merge(latest_health, on="creator_id", how="left")
    .merge(deal_stats, on="creator_id", how="left")
    .merge(product_stats, on="creator_id", how="left")
    .merge(content_stats, on="creator_id", how="left")
)

overview["total_annual_revenue"] = (
    overview["monthly_revenue_usd"] * 12
).round(2)

overview["health_score"]         = overview["health_score"].fillna(70)
overview["risk_level"]           = overview["risk_level"].fillna("Watch")
overview["total_deals"]          = overview["total_deals"].fillna(0)
overview["avg_offer_gap_pct"]    = overview["avg_offer_gap_pct"].fillna(-45)
overview["avg_price_gap_pct"]    = overview["avg_price_gap_pct"].fillna(38)
overview["total_product_revenue"]= overview["total_product_revenue"].fillna(0)
overview["total_content_revenue"]= overview["total_content_revenue"].fillna(0)

overview.to_csv(f"{OUT}/creator_overview.csv", index=False)
print(f"   -> {len(overview)} rows | creator_overview.csv")


# ─── TABLE 2: AUDIENCE HEALTH TREND (Page 2) ─────────────────────────────────
print("Building audience_health_trend.csv ...")

# Sample 50 creators for trend — keeps Tableau fast
sample_creators = health["creator_id"].unique()[:50]
health_trend = health[health["creator_id"].isin(sample_creators)].copy()
health_trend["week_date"] = pd.to_datetime(health_trend["week_date"])

health_trend.to_csv(f"{OUT}/audience_health_trend.csv", index=False)
print(f"   -> {len(health_trend)} rows | audience_health_trend.csv")


# ─── TABLE 3: CONTENT ATTRIBUTION (Page 3) ───────────────────────────────────
print("Building content_attribution.csv ...")

content["publish_date"] = pd.to_datetime(content["publish_date"])

# Aggregate by niche + content_format
content_agg = content.groupby(["niche", "content_format", "platform"]).agg(
    total_pieces=("content_id", "count"),
    avg_views=("views", "mean"),
    avg_revenue=("total_revenue_usd", "mean"),
    total_revenue=("total_revenue_usd", "sum"),
    avg_production_hours=("production_hours", "mean"),
    avg_revenue_per_hour=("revenue_per_hour_usd", "mean"),
    converting_pieces=("is_high_converting", "sum"),
    avg_engagement_likes=("likes", "mean"),
    avg_saves=("saves", "mean"),
).reset_index()

content_agg["conversion_rate"] = (
    content_agg["converting_pieces"] / content_agg["total_pieces"]
).round(4)

content_agg["revenue_per_view"] = (
    content_agg["avg_revenue"] / content_agg["avg_views"].replace(0, 1)
).round(6)

content_agg.to_csv(f"{OUT}/content_attribution.csv", index=False)
print(f"   -> {len(content_agg)} rows | content_attribution.csv")


# ─── TABLE 4: BRAND DEAL INTELLIGENCE (Page 4) ───────────────────────────────
print("Building brand_deal_intelligence.csv ...")

deals["deal_date"] = pd.to_datetime(deals["deal_date"])
deals["rate_recovered_usd"] = (
    deals["negotiated_rate_usd"] - deals["offered_rate_usd"]
).round(2)

deals["offer_percentile"] = deals.groupby(["niche", "platform", "follower_tier"])[
    "offered_rate_usd"
].rank(pct=True).round(3)

deals["is_below_market"] = deals["offered_rate_usd"] < deals["market_rate_usd"]
deals["market_gap_usd"]  = (deals["market_rate_usd"] - deals["offered_rate_usd"]).round(2)

deals.to_csv(f"{OUT}/brand_deal_intelligence.csv", index=False)
print(f"   -> {len(deals)} rows | brand_deal_intelligence.csv")


# ─── TABLE 5: NICHE MARKET SUMMARY (Page 1 KPI tiles) ───────────────────────
print("Building niche_market_summary.csv ...")

niche_summary = overview.groupby("niche").agg(
    creator_count=("creator_id", "count"),
    avg_followers=("follower_count", "mean"),
    avg_engagement_rate=("engagement_rate", "mean"),
    avg_monthly_revenue=("monthly_revenue_usd", "mean"),
    avg_health_score=("health_score", "mean"),
    pct_at_risk=("risk_level", lambda x: round((x.isin(["Alert", "Critical"])).mean() * 100, 1)),
    avg_deal_gap_pct=("avg_offer_gap_pct", "mean"),
    avg_price_gap_pct=("avg_price_gap_pct", "mean"),
    total_product_revenue=("total_product_revenue", "sum"),
    total_content_revenue=("total_content_revenue", "sum"),
).reset_index()

niche_summary["total_revenue_pool"] = (
    niche_summary["total_product_revenue"] + niche_summary["total_content_revenue"]
).round(2)

niche_summary["avg_monthly_revenue"] = niche_summary["avg_monthly_revenue"].round(2)
niche_summary["avg_followers"] = niche_summary["avg_followers"].round(0).astype(int)

niche_summary.to_csv(f"{OUT}/niche_market_summary.csv", index=False)
print(f"   -> {len(niche_summary)} rows | niche_market_summary.csv")


# ─── SUMMARY ─────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("DASHBOARD DATA READY")
print("=" * 60)
for f in sorted(os.listdir(OUT)):
    path = os.path.join(OUT, f)
    rows = len(pd.read_csv(path))
    size = os.path.getsize(path) / 1024
    print(f"  {f:<45} {rows:>5} rows  {size:.1f} KB")

print(f"\nUpload these files to Tableau Public from:")
print(f"  {OUT}")
