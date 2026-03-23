# CreatorIQ — n8n Workflow Documentation
## Workflow: Brand Deal Rate Checker

**Version:** 1.0.0
**Created:** March 2026
**Status:** Proof of Concept (POC)
**Workflow File:** `workflow.json`

---

## 1. Purpose & Business Context

### Problem Being Solved
Individual creators and small creator teams (1–5 people) negotiate brand deals **completely blind**. Brands have access to market rate databases; creators do not. The result: creators systematically accept offers that are **40–46% below market rate** (per CreatorIQ dataset analysis).

### Solution
An automated brand deal rate checker that:
1. Receives deal details via webhook (POST request)
2. Looks up market rate benchmarks from 52,000+ deal records
3. Calculates whether the offer is fair, below market, or above market
4. Returns an actionable report with counter-offer amounts and negotiation talking points

### Business Value
- **$7,800/year** in recovered negotiation value per creator (12 deals/year average)
- **<2 seconds** to get a full market rate analysis
- Eliminates information asymmetry between brands and creators

---

## 2. Workflow Architecture

```
[Webhook Trigger]
       │
       ▼
[Code: Market Rate Benchmark]
       │
       ▼
[IF: Is Offered Rate < Market Rate?]
       │                    │
    YES (True)           NO (False)
       │                    │
       ▼                    ▼
[Set: Below Market      [Set: Good Deal
 Alert + Talking         Confirmation +
 Points]                 Upsell Tips]
       │                    │
       └──────┬─────────────┘
              ▼
    [Merge: Combine Results]
              │
              ▼
    [Code: Format Report]
              │
              ▼
    [Respond to Webhook]
```

---

## 3. Node-by-Node Breakdown

### Node 1 — Webhook: Receive Deal Data
| Field | Value |
|-------|-------|
| Type | Webhook Trigger |
| Method | POST |
| Path | `/brand-deal-check` |
| Response Mode | Response Node (returns JSON) |

**Expected Input (POST body):**
```json
{
  "niche": "fitness",
  "platform": "instagram",
  "followers": 85000,
  "offered_rate_usd": 800,
  "format": "reel"
}
```

**Input Fields:**
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `niche` | string | Creator content niche | `"fitness"`, `"food & cooking"` |
| `platform` | string | Social platform | `"instagram"`, `"youtube"`, `"tiktok"` |
| `followers` | integer | Total follower count | `85000` |
| `offered_rate_usd` | float | Brand's offered rate in USD | `800` |
| `format` | string | Content format requested | `"post"`, `"reel"`, `"video"`, `"story"` |

---

### Node 2 — Code: Market Rate Benchmark
**Purpose:** Calculates the expected market rate using a benchmark lookup table derived from 52,000 deal records.

**Logic:**
1. Classifies follower count into tier: `nano / micro / mid / macro / mega`
2. Looks up base rate from benchmark table (platform × format × tier)
3. Applies niche multiplier (Finance = 1.45×, Lifestyle = 1.0×, Pets = 0.9×)
4. Calculates: market rate, low/high range, gap USD, gap %, percentile, counter-offer

**Follower Tier Classification:**
| Tier | Follower Range |
|------|---------------|
| Nano | < 10,000 |
| Micro | 10,000 – 99,999 |
| Mid | 100,000 – 499,999 |
| Macro | 500,000 – 999,999 |
| Mega | 1,000,000+ |

**Niche Multipliers:**
| Niche | Multiplier |
|-------|-----------|
| Finance | 1.45× |
| Business & Entrepreneurship | 1.38× |
| Tech & Gaming | 1.32× |
| Health & Fitness | 1.20× |
| Beauty & Fashion | 1.15× |
| Education | 1.18× |
| Food & Cooking | 1.05× |
| Lifestyle (baseline) | 1.00× |

---

### Node 3 — IF: Below Market Rate?
**Condition:** `offered_rate_usd < market_rate_usd × 0.90`

Uses a 10% tolerance buffer to avoid flagging deals that are marginally below market.

| Branch | Condition | Outcome |
|--------|-----------|---------|
| True | Offer < 90% of market rate | Routes to "Below Market Alert" |
| False | Offer ≥ 90% of market rate | Routes to "Good Deal Confirmation" |

---

### Node 4 — Set: Below Market Alert
**Triggered when:** Offer is significantly below market rate.

**Sets:**
- `status`: `"BELOW_MARKET"`
- `alert_level`: `"WARNING"`
- `headline`: Dynamic message with exact gap percentage
- `recommendation`: Counter-offer amount with justification
- `talking_points`: 4 negotiation strategies (engagement rate, comparable deals, exclusivity window, bundling)

---

### Node 5 — Set: Good Deal Confirmation
**Triggered when:** Offer is at or above market rate.

**Sets:**
- `status`: `"AT_OR_ABOVE_MARKET"`
- `alert_level`: `"GOOD"`
- `headline`: Positive confirmation with gap percentage
- `recommendation`: Still encourages minor upsell (usage rights, performance bonus)
- `talking_points`: 4 optimisation tips

---

### Node 6 — Merge: Combine Results
Merges both branches (below market / good deal) back into a single flow.

---

### Node 7 — Code: Format Report
Structures the final JSON response into a clean, readable report format.

**Output Structure:**
```json
{
  "timestamp": "2026-03-19T08:00:00.000Z",
  "workflow": "CreatorIQ — Brand Deal Rate Checker",
  "deal_summary": { "platform", "niche", "format", "follower_count", "follower_tier" },
  "rate_analysis": { "offered_rate", "market_rate", "market_range", "offer_percentile", "gap_amount", "gap_pct" },
  "verdict": { "status", "alert_level", "headline", "recommendation", "counter_offer", "talking_points" },
  "disclaimer": "Rates are benchmarks only..."
}
```

---

### Node 8 — Respond to Webhook
Returns the formatted JSON report to the caller with:
- HTTP 200 status
- `Content-Type: application/json`
- `X-Powered-By: CreatorIQ n8n Automation` header

---

## 4. Sample Input & Output

### Sample Request
```bash
curl -X POST http://localhost:5678/webhook/brand-deal-check \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "health & fitness",
    "platform": "instagram",
    "followers": 85000,
    "offered_rate_usd": 700,
    "format": "reel"
  }'
```

### Sample Response (Below Market)
```json
{
  "timestamp": "2026-03-19T09:30:00.000Z",
  "workflow": "CreatorIQ — Brand Deal Rate Checker",
  "deal_summary": {
    "platform": "instagram",
    "niche": "health & fitness",
    "format": "reel",
    "follower_count": 85000,
    "follower_tier": "micro"
  },
  "rate_analysis": {
    "offered_rate": "$700",
    "market_rate": "$1,440",
    "market_range": "$1,080 – $1,944",
    "offer_percentile": "< 25th",
    "gap_amount": "$740 below market",
    "gap_pct": "-51.4%"
  },
  "verdict": {
    "status": "BELOW_MARKET",
    "alert_level": "WARNING",
    "headline": "⚠️ This offer is -51.4% below market rate",
    "recommendation": "Counter-offer $1,584. The market rate for your tier is $1,440.",
    "counter_offer": "$1,584",
    "talking_points": [
      "Your engagement rate justifies the market rate",
      "Reference comparable deals in your niche",
      "Offer a 30-day exclusivity window to justify higher rate",
      "Bundle deliverables (post + story + reel) to increase value"
    ]
  },
  "disclaimer": "Rates are benchmarks only. Always verify with current market data before negotiating."
}
```

---

## 5. How to Import & Run

### Step 1: Import Workflow into n8n
1. Open n8n at `http://localhost:5678`
2. Navigate to `Personal → CreatorIQ` folder
3. Click **"Create workflow"** → **"Import from file"**
4. Select `C:/CreatorIQ Project/n8n/workflow.json`

### Step 2: Activate the Workflow
1. Open the imported workflow
2. Click the **"Active"** toggle (top right)
3. The webhook URL will become live

### Step 3: Test with curl
```bash
curl -X POST http://localhost:5678/webhook/brand-deal-check \
  -H "Content-Type: application/json" \
  -d '{"niche":"finance","platform":"youtube","followers":250000,"offered_rate_usd":3000,"format":"video"}'
```

---

## 6. Alignment with CreatorIQ Use Cases

| Use Case | Module | This Workflow Addresses |
|----------|--------|------------------------|
| O4 — Market Rate Benchmarking | Module 4 (Brand Deal Intel) | ✅ Core implementation |
| O3 — Contract Analysis (RAG) | Module 4 (Brand Deal Intel) | 🔄 Extension: add Claude API node |
| O6 — Intelligent Automation | Cross-module | ✅ Full automation loop |

### Extension Path (Post-POC)
To extend this POC into full production:
1. Add **Claude API node** after Merge to generate personalised negotiation scripts
2. Add **Gmail node** to email the report to the creator
3. Add **Google Sheets node** to log deals for trend analysis
4. Add **LangSmith** tracing to monitor AI response quality

---

## 7. Risk Mitigations Applied

| Risk ID | Risk | Mitigation in This Workflow |
|---------|------|---------------------------|
| A-04 | Rate benchmark wrong — creator under-negotiates | 10% buffer zone; show market range not just point estimate |
| L-01 | AI gives incorrect legal advice | Disclaimer appended to every response |
| A-02 | Price recommendation causes bad decision | Creator sees full rate range + percentile, not just one number |
| I-03 | n8n workflow fails silently | Respond-to-webhook always returns — no silent failures |

---

*Documentation created: March 2026*
*Project: CreatorIQ — AI-Powered Creator Monetization Platform*
