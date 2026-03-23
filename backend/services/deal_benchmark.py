"""
Local Deal Benchmark Calculator
Used as fallback when n8n webhook returns no data.
Reads brand_deal_intelligence.csv to compute market rates from real data.
"""

import os
import csv
import math
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Path to the processed benchmark CSV
_CSV_PATH = os.path.join(
    os.path.dirname(__file__),
    "..", "..", "data", "processed", "brand_deal_intelligence.csv"
)

# Cached rows loaded on first use
_ROWS: Optional[List[Dict]] = None


def _load_rows() -> List[Dict]:
    global _ROWS
    if _ROWS is not None:
        return _ROWS
    try:
        path = os.path.normpath(_CSV_PATH)
        with open(path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            _ROWS = [r for r in reader]
        logger.info(f"Loaded {len(_ROWS)} benchmark rows from {path}")
    except Exception as e:
        logger.warning(f"Could not load benchmark CSV: {e}")
        _ROWS = []
    return _ROWS


def _follower_tier(followers: int) -> str:
    if followers < 10_000:
        return "Nano"
    if followers < 100_000:
        return "Micro"
    if followers < 500_000:
        return "Mid"
    if followers < 1_000_000:
        return "Macro"
    return "Mega"


def _format_usd(val: float) -> str:
    return f"${val:,.0f}"


def calculate_market_rate(
    niche: str,
    platform: str,
    followers: int,
    offered_rate_usd: float,
    format: str = "post",
) -> Dict[str, Any]:
    """
    Compute market rate from benchmark CSV and return an n8n-compatible response dict.
    """
    rows = _load_rows()
    niche_norm    = niche.lower().strip()
    platform_norm = platform.lower().strip()

    # Try to match niche + platform first, then niche only, then platform only
    def _matches(r: Dict, use_niche=True, use_platform=True) -> bool:
        ok = True
        if use_niche:
            ok = ok and niche_norm in r.get("niche", "").lower()
        if use_platform:
            ok = ok and platform_norm in r.get("platform", "").lower()
        return ok

    def _market_rates(subset: List[Dict]) -> List[float]:
        rates = []
        for r in subset:
            try:
                rates.append(float(r["market_rate_usd"]))
            except (ValueError, KeyError):
                pass
        return rates

    # Progressively loosen the filter
    for use_niche, use_platform in [(True, True), (True, False), (False, True), (False, False)]:
        subset = [r for r in rows if _matches(r, use_niche, use_platform)]
        rates  = _market_rates(subset)
        if len(rates) >= 3:
            break

    if not rates:
        # Hard fallback: CPM-style estimate
        cpm = 0.01  # $10 CPM
        rates = [followers * cpm]

    # Median market rate
    rates.sort()
    mid = len(rates) // 2
    market_rate = rates[mid] if len(rates) % 2 == 1 else (rates[mid - 1] + rates[mid]) / 2.0
    market_rate = round(market_rate, 2)

    # Range: 25th–75th percentile
    p25 = rates[max(0, int(len(rates) * 0.25))]
    p75 = rates[min(len(rates) - 1, int(len(rates) * 0.75))]

    gap_usd  = round(offered_rate_usd - market_rate, 2)
    gap_pct  = round((gap_usd / market_rate) * 100, 1) if market_rate else 0.0

    # Percentile of offer vs. distribution
    below = sum(1 for r in rates if r <= offered_rate_usd)
    offer_percentile = round(below / len(rates), 3) if rates else 0.5

    # Verdict
    if gap_pct >= 10:
        status      = "ABOVE_MARKET"
        alert_level = "GOOD"
        headline    = f"Strong offer — {gap_pct:+.1f}% above market"
        recommendation = "Accept or counter slightly higher to maximise value."
        counter_offer  = round(offered_rate_usd * 1.05, 2)
    elif gap_pct >= -5:
        status      = "AT_MARKET"
        alert_level = "NEUTRAL"
        headline    = "Fair market offer"
        recommendation = "Offer is within normal range. Negotiate 5–10% higher."
        counter_offer  = round(market_rate * 1.08, 2)
    elif gap_pct >= -20:
        status      = "BELOW_MARKET"
        alert_level = "WARNING"
        headline    = f"Below market — {abs(gap_pct):.1f}% under benchmark"
        recommendation = "Counter at market rate or higher. Include usage rights & exclusivity fees."
        counter_offer  = round(market_rate * 1.10, 2)
    else:
        status      = "SIGNIFICANTLY_BELOW_MARKET"
        alert_level = "DANGER"
        headline    = f"Significantly below market — {abs(gap_pct):.1f}% under benchmark"
        recommendation = "Counter firmly. This offer undervalues your audience significantly."
        counter_offer  = round(market_rate * 1.15, 2)

    tier = _follower_tier(followers)

    talking_points = [
        f"Market benchmark for {niche} on {platform} is {_format_usd(market_rate)} (median of {len(rates)} comparable deals)",
        f"Your audience of {followers:,} ({tier} tier) commands {_format_usd(p25)}–{_format_usd(p75)} range",
        f"Counter offer of {_format_usd(counter_offer)} reflects fair value + 10% negotiation buffer",
        "Request usage rights fee (+15–25%) and exclusivity compensation if required",
        "Leverage engagement rate — ask for performance bonus if CPM exceeds 3%",
    ]

    logger.info(
        f"[BENCHMARK FALLBACK] {niche}/{platform}/{followers}: "
        f"market={_format_usd(market_rate)} offered={_format_usd(offered_rate_usd)} "
        f"gap={gap_pct:+.1f}% status={status}"
    )

    return {
        "source": "local_benchmark",
        "verdict": {
            "status":         status,
            "alert_level":    alert_level,
            "headline":       headline,
            "recommendation": recommendation,
            "counter_offer":  _format_usd(counter_offer),
            "talking_points": talking_points,
        },
        "rate_analysis": {
            "offered_rate":      _format_usd(offered_rate_usd),
            "market_rate":       _format_usd(market_rate),
            "market_range":      f"{_format_usd(p25)} – {_format_usd(p75)}",
            "offer_percentile":  f"{int(offer_percentile * 100)}th percentile",
            "gap_amount":        _format_usd(gap_usd),
            "gap_pct":           f"{gap_pct:+.1f}%",
        },
        "deal_summary": {
            "platform":      platform,
            "niche":         niche,
            "format":        format,
            "follower_count": followers,
            "follower_tier":  tier,
        },
    }
