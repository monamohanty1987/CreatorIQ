# CreatorIQ — n8n Workflow Documentation

**Version:** 2.0.0
**Updated:** April 2026
**Status:** Production-Ready POC
**Total Workflows:** 5 (O1–O5)

---

## Table of Contents

1. [Workflow Overview](#1-workflow-overview)
2. [O1 — Product Launch Email Sequence](#2-o1--product-launch-email-sequence)
3. [O2 — Weekly Audience Health Alert](#3-o2--weekly-audience-health-alert)
4. [O3 — RAG Contract Analysis](#4-o3--rag-contract-analysis)
5. [O4 — Brand Deal Rate Checker](#5-o4--brand-deal-rate-checker)
6. [O5 — Abandoned Checkout Recovery](#6-o5--abandoned-checkout-recovery)
7. [How to Import & Run](#7-how-to-import--run)
8. [Risk Mitigations](#8-risk-mitigations)

---

## 1. Workflow Overview

| ID | Workflow Name | Trigger | Webhook Path | Model | Est. Value |
|----|--------------|---------|--------------|-------|------------|
| O1 | Product Launch Email Sequence | HTTP Webhook (POST) | `/webhook/product-launch` | Code Logic | $18K–$20K/year |
| O2 | Weekly Audience Health Alert | Schedule (Monday 8am) | — (Scheduled) | Code Logic | $15K–$40K protected |
| O3 | RAG Contract Analysis | HTTP Webhook (POST) | `/webhook/analyse-contract` | RAG + Code | $5,200/year saved |
| O4 | Brand Deal Rate Checker | HTTP Webhook (POST) | `/webhook/brand-deal-check` | Benchmark Engine | $800–$2K/deal |
| O5 | Abandoned Checkout Recovery | HTTP Webhook (POST) | `/webhook/checkout-abandoned` | Code Logic | $3,492/launch |

### How Workflows Connect to the FastAPI Backend

All webhook-based workflows (O1, O3, O4, O5) are called by `services/n8n_client.py` in the FastAPI backend. Every call is traced via LangSmith (EU endpoint). If n8n is unreachable or returns an empty response, the backend automatically falls back to a direct OpenAI call — ensuring 100% uptime for all AI features.

```
React Frontend
      │
      ▼
FastAPI Backend (Railway)
      │
      ├── n8n_client.py ──► n8n Cloud Webhook ──► Workflow ──► JSON Response
      │        │                                                      │
      │        └── (fallback if n8n unreachable) ──► OpenAI API ─────┘
      │
      └── LangSmith EU ◄── All calls traced here
```

---

## 2. O1 — Product Launch Email Sequence

**File:** `CreatorIQ — O1 Product Launch Email Sequence.json`
**Workflow ID:** `04dadb0f`
**Business Value:** Saves 10 hours per product launch; generates $18K–$20K/year in predictive revenue

### 2.1 Purpose

Automatically generates a complete 5-email product launch sequence for a creator's product (course, e-book, coaching, merchandise). Each email is timed relative to the launch date and calibrated for audience size and product type.

### 2.2 Architecture

```
[Webhook — New Product Launch]
              │
              ▼
[Code — Generate 5-Email Sequence]
              │
              ▼
[IF — Final Email? (urgency = CRITICAL)]
        │              │
    YES (True)      NO (False)
        │              │
        ▼              ▼
[Set — High      [Set — Standard
 Priority Flag]   Priority Flag]
        │              │
        └──────┬────────┘
               ▼
    [Merge — All Emails]
               │
               ▼
  [HTTP Request — Schedule Email]
               │
               ▼
    [Respond to Webhook]
```

### 2.3 Trigger — Webhook

| Field | Value |
|-------|-------|
| Type | Webhook (HTTP POST) |
| Path | `/webhook/product-launch` |
| Response Mode | Response Node |
| Webhook ID | `062a4307-6278-548a-8a20-8b933de5a38c` |

**Input Payload:**
```json
{
  "product_name": "Creator Business Masterclass",
  "product_price": 197,
  "product_type": "online course",
  "creator_name": "Alex Finance",
  "creator_niche": "finance",
  "launch_date": "2026-05-01",
  "subscriber_count": 12000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `product_name` | string | Name of the product |
| `product_price` | float | Full price in USD |
| `product_type` | string | Category: course, e-book, coaching, merchandise |
| `creator_name` | string | Creator's display name |
| `creator_niche` | string | Content niche |
| `launch_date` | string | ISO date (YYYY-MM-DD) |
| `subscriber_count` | integer | Email subscriber count |

### 2.4 Node Breakdown

#### Node 2 — Code: Generate 5-Email Sequence
- Reads all input fields from the webhook body
- Calculates early bird price (75% of full price) and early bird end date (+3 days from launch)
- Generates 5 email objects with subject, preview, key message, CTA, and urgency flag

**Email Schedule:**

| Email | Day | Type | Subject Pattern | Urgency |
|-------|-----|------|----------------|---------|
| 1 | Day 0 | ANNOUNCEMENT | "It's HERE! {product} is now live" | HIGH |
| 2 | Day 2 | SOCIAL_PROOF | "What early students are saying..." | MEDIUM |
| 3 | Day 6 | VALUE_DEEPDIVE | "What's actually inside {product}" | LOW |
| 4 | Day 13 | TRANSFORMATION | "Week 1 results from students" | MEDIUM |
| 5 | Day 29 | LAST_CHANCE | "Final 24 hours — closes tonight" | CRITICAL |

#### Node 3 — IF: Final Email?
- Condition: `urgency == "CRITICAL"` (Email 5 only)
- TRUE → Set — High Priority Flag
- FALSE → Set — Standard Priority Flag

#### Node 4 — Set: High Priority Flag
Marks Email 5 with `priority: "URGENT"` and countdown timer flag for the sending service.

#### Node 5 — Set: Standard Priority Flag
Marks Emails 1–4 with `priority: "STANDARD"` for normal queue processing.

#### Node 6 — Merge: All Emails
Combines both branches into a single ordered list of 5 emails.

#### Node 7 — HTTP Request: Schedule Email
- POSTs each email to the configured email service provider webhook
- Retry: 3 attempts with 5-second delay
- Error handling: `continueErrorOutput` (non-fatal failure)
- **Replace URL** with: Mailchimp, ConvertKit, ActiveCampaign, or Mailgun webhook

#### Node 8 — Respond to Webhook
Returns confirmation to the FastAPI backend:
```json
{
  "status": "SEQUENCE_SCHEDULED",
  "campaign_id": "LAUNCH-1714500000000",
  "emails_queued": 5,
  "first_send": "2026-05-01",
  "last_send": "2026-05-30",
  "workflow": "O1 — Product Launch Email Sequence",
  "hours_saved": 10
}
```

### 2.5 Sample curl

```bash
curl -X POST https://[your-n8n-instance].app.n8n.cloud/webhook/product-launch \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Creator Business Masterclass",
    "product_price": 197,
    "product_type": "online course",
    "creator_name": "Alex Finance",
    "creator_niche": "finance",
    "launch_date": "2026-05-01",
    "subscriber_count": 12000
  }'
```

---

## 3. O2 — Weekly Audience Health Alert

**File:** `CreatorIQ — O2 Weekly Audience Health Alert.json`
**Workflow ID:** `1393b605`
**Business Value:** Protects $15K–$40K/year by detecting audience churn before it becomes critical

### 3.1 Purpose

Automatically runs every Monday at 8:00 AM and evaluates audience health for all monitored creators. Creators with a health score below 55 receive urgent alerts with revenue-at-risk calculations. Healthy creators receive a positive weekly summary.

### 3.2 Architecture

```
[Schedule — Every Monday 8am]
              │
              ▼
  [Code — Load Health Data]
              │
              ▼
[IF — At Risk? (health_score < 55)]
        │              │
    YES (True)      NO (False)
        │              │
        ▼              ▼
[Set — Urgent      [Set — Weekly
 Alert]             Summary]
        │              │
        └──────┬────────┘
               ▼
   [Merge — All Alerts]
               │
               ▼
[Code — Build Weekly Report]
               │
               ▼
 [HTTP Request — Send Report]
```

### 3.3 Trigger — Schedule

| Field | Value |
|-------|-------|
| Type | Schedule Trigger |
| Frequency | Every Monday at 8:00 AM |
| Testing Mode | Change to `everyMinute` for demo |

> ⚠️ **No webhook input** — this workflow is self-triggered. It does not accept external POST requests.

### 3.4 Node Breakdown

#### Node 2 — Code: Load Health Data
Loads 5 creator health records (in production: reads from database or CSV).

**Health Data Fields:**

| Field | Description |
|-------|-------------|
| `creator_id` | Unique creator identifier |
| `name` | Creator display name |
| `niche` | Content niche |
| `platform` | Social platform |
| `followers` | Current follower count |
| `health_score` | 0–100 composite score |
| `engagement_rate` | % engagement |
| `watch_time_pct` | Average watch time percentage |
| `unsubscribe_rate` | Weekly unsubscribe % |
| `weekly_follower_change` | Net follower change (positive/negative) |

**Computed fields added by this node:**

| Field | Logic |
|-------|-------|
| `risk_level` | score < 40 → Critical; < 55 → Alert; < 70 → Watch; else Safe |
| `trend` | change < -300 → Declining Fast; < 0 → Declining; < 500 → Stable; else Growing |
| `revenue_at_risk_usd` | If score < 55: `followers × 0.012 × 12`; else 0 |

**Sample Creator Data (POC):**

| Creator | Niche | Platform | Followers | Health Score | Risk Level |
|---------|-------|----------|-----------|--------------|------------|
| FitWithSarah | Health & Fitness | Instagram | 85,000 | 38 | **Critical** |
| FinanceWithAlex | Finance | YouTube | 220,000 | 72 | Safe |
| TechTalkMia | Tech & Gaming | YouTube | 145,000 | 51 | **Alert** |
| CookWithJamie | Food & Cooking | TikTok | 320,000 | 81 | Safe |
| StyleByLuna | Beauty & Fashion | Instagram | 67,000 | 44 | **Alert** |

#### Node 3 — IF: At Risk?
- Condition: `health_score < 55`
- TRUE → Urgent Alert (Critical or Alert creators)
- FALSE → Weekly Summary (Watch or Safe creators)

#### Node 4 — Set: Urgent Alert
Sets `alert_type: "URGENT"` with:
- Revenue at risk in USD/year
- Specific recommended actions based on metrics
- Subject line for email/Slack notification

#### Node 5 — Set: Weekly Summary
Sets `alert_type: "WEEKLY_SUMMARY"` with positive reinforcement messaging.

#### Node 6 — Merge: All Alerts
Combines urgent alerts and summaries into one list.

#### Node 7 — Code: Build Weekly Report
Aggregates all creator data into a single weekly report:
```json
{
  "report_type": "CreatorIQ Weekly Audience Health Report",
  "week_ending": "2026-04-07",
  "summary": {
    "total_creators_monitored": 5,
    "urgent_alerts": 3,
    "healthy_creators": 2,
    "total_revenue_at_risk": "$42,000/year",
    "action_required": true
  },
  "urgent_alerts": [...],
  "healthy_creators": [...]
}
```

#### Node 8 — HTTP Request: Send Report
- POSTs the weekly report to a webhook (email service, Slack, or dashboard API)
- Retry: 3 attempts with 5-second delay
- **Replace URL** with your alerting endpoint (Slack webhook, email API, etc.)

---

## 4. O3 — RAG Contract Analysis

**File:** `CreatorIQ — O3 RAG Contract Analysis.json`
**Workflow ID:** `2ba3f71b`
**Business Value:** Detects bad contract clauses worth an average $5,200/year in avoided bad deals

### 4.1 Purpose

Analyses brand sponsorship and influencer contract text for red flags, FTC compliance issues, and unfavourable clauses. Returns a health score (0–100), verdict (PASS / NEGOTIATE / REJECT), and prioritised list of issues with negotiation recommendations.

### 4.2 Architecture

```
[Webhook — Analyse Contract]
              │
              ▼
[Set — Extract Contract Data]
              │
              ▼
[Code — Analyse Contract (RAG Simulation)]
              │
              ▼
[IF — Reject Contract? (verdict = REJECT)]
        │              │
    YES (True)      NO (False)
        │              │
        ▼              ▼
[Set — Urgent      [Set — Review /
 Reject Alert]      Pass Report]
        │              │
        └──────┬────────┘
               ▼
   [Merge — All Results]
               │
               ▼
   [Respond to Webhook]
```

### 4.3 Trigger — Webhook

| Field | Value |
|-------|-------|
| Type | Webhook (HTTP POST) |
| Path | `/webhook/analyse-contract` |
| Response Mode | Response Node |
| Webhook ID | `6ec471ef-58f6-516d-948c-4815af7bafbf` |

**Input Payload:**
```json
{
  "contract_text": "This Agreement grants Brand a perpetual license to all content...",
  "creator_name": "Sarah Fitness",
  "creator_niche": "health & fitness",
  "deal_value": 2500,
  "brand_name": "FitGear Co"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `contract_text` | string | Full raw text of the contract |
| `creator_name` | string | Creator's name (for personalised output) |
| `creator_niche` | string | Content niche (used for FTC compliance check) |
| `deal_value` | float | Deal value in EUR/USD |
| `brand_name` | string | Brand or company name |

### 4.4 Node Breakdown

#### Node 2 — Set: Extract Contract Data
Extracts all fields from the webhook body and generates a unique `analysis_id` for tracking.

#### Node 3 — Code: Analyse Contract (RAG Simulation)
The core analysis engine. In production, this node would:
1. Embed the contract text using OpenAI Embeddings
2. Query ChromaDB for semantically similar clauses (FTC guidelines, past contracts)
3. Send contract + retrieved context to Claude/GPT-4o for deep analysis

**In POC mode**, it scans for 7 known red-flag patterns:

| ID | Pattern | Severity | Clause Type | Estimated Cost |
|----|---------|----------|-------------|----------------|
| RF-001 | `exclusivity` | HIGH | Exclusivity | 30% of deal value |
| RF-002 | `perpetual license` | CRITICAL | IP / Content Rights | 50% of deal value |
| RF-003 | `unlimited revisions` | MEDIUM | Scope of Work | 10% of deal value |
| RF-004 | `morality clause` | MEDIUM | Termination | 100% of deal value |
| RF-005 | `non-disparagement` | HIGH | Free Speech | 20% of deal value |
| RF-006 | `late payment` | LOW | Payment Terms | 5% of deal value |
| RF-007 | `governing law` | MEDIUM | Jurisdiction | 8% of deal value |

**FTC Compliance by Niche:**

| Niche | FTC Requirement | Risk Level |
|-------|----------------|------------|
| Finance | Full FTC §205 disclosure required | HIGH |
| Health / Fitness | Health claims require substantiation | HIGH |
| Tech | Standard #ad or #sponsored | MEDIUM |
| Lifestyle / Gaming | Standard #ad or #sponsored | LOW |

**Health Score Calculation:**
- Start at 100
- Deduct: CRITICAL = 35pts, HIGH = 20pts, MEDIUM = 10pts, LOW = 5pts
- Score 70–100 → **PASS**
- Score 40–69 → **NEGOTIATE**
- Score 0–39 → **REJECT**

#### Node 4 — IF: Reject Contract?
- Condition: `verdict == "REJECT"` (health score < 40)
- TRUE → Urgent Reject Alert (DO NOT SIGN)
- FALSE → Review / Pass Report (NEGOTIATE or PASS)

#### Node 5 — Set: Urgent Reject Alert
Flags contract as DO NOT SIGN. Sets `alert_level: "CRITICAL"` with list of critical/high severity flags.

#### Node 6 — Set: Review / Pass Report
- NEGOTIATE: flags clauses needing amendment, provides negotiation recommendations
- PASS: confirms clean contract with any minor notes

#### Node 8 — Respond to Webhook
Returns full analysis JSON to FastAPI backend:
```json
{
  "status": "ANALYSIS_COMPLETE",
  "verdict": "NEGOTIATE",
  "health_score": 55,
  "risk_summary": "3 red flags detected (0 critical, 1 high, 2 medium, 0 low)",
  "total_risk_exposure": 1225,
  "alert_level": "WARNING",
  "red_flags": [...],
  "recommendations": [...],
  "ftc_compliance": {
    "niche": "health & fitness",
    "requirement": "REQUIRED — Health claims require substantiation per FTC Act",
    "risk_level": "HIGH"
  },
  "estimated_value_protected": 1225,
  "workflow": "O3 — RAG Contract Analysis"
}
```

### 4.5 Production Upgrade Path
Replace Node 3 (`Code — Analyse Contract`) with:
1. **OpenAI Embeddings node** — embed the contract text
2. **HTTP Request to ChromaDB** — retrieve top-3 similar clauses from the vector store
3. **OpenAI / Claude API node** — send contract + RAG context for deep analysis
4. **Code node** — parse and structure the AI response

---

## 5. O4 — Brand Deal Rate Checker

**File:** `CreatorIQ — O4 Brand Deal Rate Checker.json`
**Workflow ID:** `9a1703d1`
**Business Value:** Recovers $800–$2,000 per deal; $7,800+/year for active creators

### 5.1 Purpose

Evaluates a brand sponsorship offer against market rate benchmarks derived from 52,000+ deal records. Returns whether the offer is fair, below, or above market, plus a recommended counter-offer and negotiation talking points.

### 5.2 Architecture

```
[Webhook — Receive Deal]
              │
              ▼
[Code — Market Rate Benchmark]
              │
              ▼
[IF — Below Market? (offer < 90% of market)]
        │              │
    YES (True)      NO (False)
        │              │
        ▼              ▼
[Set — Below       [Set — Good
 Market Alert]      Deal]
        │              │
        └──────┬────────┘
               ▼
 [Merge — Combine Branches]
               │
               ▼
  [Code — Format Report]
               │
               ▼
  [Respond to Webhook]
```

### 5.3 Trigger — Webhook

| Field | Value |
|-------|-------|
| Type | Webhook (HTTP POST) |
| Path | `/webhook/brand-deal-check` |
| Response Mode | Response Node |
| Webhook ID | `26317e5f-0f0d-506d-ae76-204382ae7858` |

**Input Payload:**
```json
{
  "niche": "health & fitness",
  "platform": "instagram",
  "followers": 85000,
  "offered_rate_usd": 700,
  "format": "reel"
}
```

### 5.4 Node Breakdown

#### Node 2 — Code: Market Rate Benchmark

**Follower Tier Classification:**

| Tier | Follower Range |
|------|---------------|
| Nano | < 10,000 |
| Micro | 10,000 – 99,999 |
| Mid | 100,000 – 499,999 |
| Macro | 500,000 – 999,999 |
| Mega | 1,000,000+ |

**Benchmark Table (USD) — Micro Tier Examples:**

| Platform | Post | Reel | Story | Video |
|----------|------|------|-------|-------|
| Instagram | $800 | $1,200 | $400 | $1,500 |
| YouTube | $2,000 | — | $300 | — |
| TikTok | $700 | $1,000 | $350 | $900 |

**Niche Multipliers:**

| Niche | Multiplier |
|-------|-----------|
| Finance | 1.45× |
| Business & Entrepreneurship | 1.38× |
| Tech & Gaming | 1.32× |
| Gaming & Esports | 1.28× |
| Health & Fitness | 1.20× |
| Education | 1.18× |
| Beauty & Fashion | 1.15× |
| Travel | 1.10× |
| Food & Cooking | 1.05× |
| Lifestyle | 1.00× (baseline) |
| Parenting | 0.95× |
| Pets | 0.90× |

**Computed outputs:**

| Field | Formula |
|-------|---------|
| `market_rate_usd` | `base_rate × niche_multiplier` |
| `rate_range_low` | `market_rate × 0.75` |
| `rate_range_high` | `market_rate × 1.35` |
| `gap_usd` | `offered_rate − market_rate` |
| `gap_pct` | `(offered − market) / market × 100` |
| `counter_offer_usd` | If below: `market × 1.10`; else: `offered × 1.05` |
| `offer_percentile` | Bottom 25% / 25th–75th / 75th–90th / Top 10% |
| `is_below_market` | `offered_rate < market_rate × 0.90` |

#### Node 3 — IF: Below Market?
- Threshold: offer must be less than 90% of market rate to trigger a warning (10% buffer avoids flagging minor misses)

#### Node 4 — Set: Below Market Alert
Sets:
- `status: "BELOW_MARKET"`
- `alert_level: "WARNING"`
- Counter-offer amount
- 4 negotiation talking points (engagement justification, comparable deals, exclusivity bundling, performance bonus)

#### Node 5 — Set: Good Deal
Sets:
- `status: "AT_OR_ABOVE_MARKET"`
- `alert_level: "GOOD"`
- Still recommends minor upsell (usage rights, performance bonuses)

#### Node 7 — Code: Format Report
Structures all data into the final response with disclaimer.

#### Node 8 — Respond to Webhook
Returns JSON to FastAPI with CORS headers (`Access-Control-Allow-Origin: *`).

### 5.5 Sample Response

```json
{
  "timestamp": "2026-04-02T09:30:00Z",
  "workflow": "CreatorIQ — O4 Brand Deal Rate Checker",
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
    "offer_percentile": "Bottom 25%",
    "gap_amount": "$740 below market",
    "gap_pct": "-51.4%"
  },
  "verdict": {
    "status": "BELOW_MARKET",
    "alert_level": "WARNING",
    "counter_offer": "$1,584",
    "talking_points": [
      "Your engagement rate justifies the market rate",
      "Reference comparable deals in your niche",
      "Offer a 30-day exclusivity window to justify higher rate",
      "Bundle deliverables to increase total value"
    ]
  },
  "disclaimer": "Benchmarks only. Not legal advice. Verify before negotiating."
}
```

### 5.6 Sample curl

```bash
curl -X POST https://[your-n8n-instance].app.n8n.cloud/webhook/brand-deal-check \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "health & fitness",
    "platform": "instagram",
    "followers": 85000,
    "offered_rate_usd": 700,
    "format": "reel"
  }'
```

---

## 6. O5 — Abandoned Checkout Recovery

**File:** `CreatorIQ — O5 Abandoned Checkout Recovery.json`
**Workflow ID:** `2f315fb7`
**Business Value:** Recovers an average of $3,492 per product launch through automated re-engagement

### 6.1 Purpose

Triggered when a customer abandons a checkout on a creator's product page. Waits 1 hour (the optimal recovery window) then sends a personalised recovery email with a 10% discount code. Handles delivery errors gracefully with a separate error path.

### 6.2 Architecture

```
[Webhook — Checkout Abandoned]
              │
              ▼
[Set — Extract Checkout Data]
              │
              ▼
      [Wait — 1 Hour]
              │
              ▼
[Code — Generate Recovery Email]
              │
              ▼
[HTTP Request — Send Recovery Email]
        │              │
    Success          Error
        │              │
        ▼              ▼
[Set — Success    [Set — Format
 Confirmation]     Error]
```

### 6.3 Trigger — Webhook

| Field | Value |
|-------|-------|
| Type | Webhook (HTTP POST) |
| Path | `/webhook/checkout-abandoned` |
| Response Mode | Last Node |
| Webhook ID | `bf5a27be-82f5-553b-a3bb-58db306c6e17` |

**Input Payload:**
```json
{
  "customer_email": "customer@example.com",
  "product_name": "Creator Business Masterclass",
  "product_price": 197,
  "cart_value": 197,
  "creator_name": "Alex Finance",
  "creator_niche": "finance"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `customer_email` | string | Abandoned customer's email address |
| `product_name` | string | Product they were viewing |
| `product_price` | float | Original price |
| `cart_value` | float | Total cart value |
| `creator_name` | string | Creator's name for email personalisation |
| `creator_niche` | string | Content niche |

### 6.4 Node Breakdown

#### Node 2 — Set: Extract Checkout Data
Extracts all fields and generates a unique `recovery_id` for tracking and deduplication.

#### Node 3 — Wait: 1 Hour
- Waits exactly 60 minutes before sending the recovery email
- Research-backed optimal window for abandoned cart recovery
- **For testing:** change duration to seconds

> ⚠️ **Important:** The workflow execution is paused here. n8n resumes it after the wait period using an internal resume webhook (`e1cc61bc-50ac-4953-a991-1dd15c24ffdf`). Do not delete this node or the wait will break.

#### Node 4 — Code: Generate Recovery Email
Builds a personalised recovery email:
- Discount: 10% off (`COMEBACK10` code)
- Calculates `discountAmt`, `finalPrice`, expiry (24 hours from send)
- Generates HTML email body with creator's name, product name, and discount code

**Email Output:**
```json
{
  "to": "customer@example.com",
  "subject": "🛒 You left something behind — Creator Business Masterclass",
  "preview": "Complete your purchase and save $20 today only",
  "html_body": "...",
  "metadata": {
    "recovery_id": "...",
    "discount_code": "COMEBACK10",
    "discount_amt": 20,
    "final_price": 177,
    "expires_at": "2026-04-03T10:30:00Z",
    "estimated_recovery_value": 177
  }
}
```

#### Node 5 — HTTP Request: Send Recovery Email
- POSTs the email object to your email service provider
- Retry: 3 attempts with 5-second delay
- Error path: triggers Node 6 (Set — Format Error) if all retries fail
- **Replace URL** with: Mailgun, SendGrid, SMTP webhook, or ConvertKit

#### Node 6 — Set: Format Error
Captures delivery failure details for logging and alerting.

#### Node 7 — Set: Success Confirmation
Records successful delivery with `recovery_id`, `discount_code`, and send timestamp.

---

## 7. How to Import & Run

### 7.1 Import a Workflow into n8n Cloud

1. Log into your n8n Cloud instance
2. Navigate to your workspace
3. Click **"Add workflow"** → **"Import from file"**
4. Select the `.json` file from `C:/CreatorIQ Project/n8n/`
5. Click **"Import"**
6. Review all nodes and replace placeholder URLs (e.g. `webhook.site/YOUR-...`)
7. Click the **"Active"** toggle in the top-right to make the webhook live

### 7.2 Configure Environment Variables (FastAPI Backend)

Add to your Railway backend Variables or `.env` file:

```
N8N_BASE_URL=https://[your-org].app.n8n.cloud
N8N_TIMEOUT=30
```

The `n8n_client.py` service reads `N8N_BASE_URL` and appends `/webhook/{path}` for each call.

### 7.3 Test Each Workflow

**O1 — Product Launch:**
```bash
curl -X POST $N8N_BASE_URL/webhook/product-launch \
  -H "Content-Type: application/json" \
  -d '{"product_name":"My Course","product_price":197,"product_type":"course","creator_name":"Alex","creator_niche":"finance","launch_date":"2026-05-01","subscriber_count":5000}'
```

**O3 — Contract Analysis:**
```bash
curl -X POST $N8N_BASE_URL/webhook/analyse-contract \
  -H "Content-Type: application/json" \
  -d '{"contract_text":"This grants a perpetual license and exclusivity...","creator_name":"Sarah","creator_niche":"fitness","deal_value":2500,"brand_name":"FitBrand"}'
```

**O4 — Brand Deal Check:**
```bash
curl -X POST $N8N_BASE_URL/webhook/brand-deal-check \
  -H "Content-Type: application/json" \
  -d '{"niche":"finance","platform":"youtube","followers":250000,"offered_rate_usd":3000,"format":"video"}'
```

**O5 — Checkout Recovery:**
```bash
curl -X POST $N8N_BASE_URL/webhook/checkout-abandoned \
  -H "Content-Type: application/json" \
  -d '{"customer_email":"test@example.com","product_name":"My Course","product_price":197,"cart_value":197,"creator_name":"Alex","creator_niche":"finance"}'
```

**O2 — Audience Health Alert:**
> Triggered automatically every Monday 8am. To test manually, open the workflow in n8n and click **"Test workflow"** to run it immediately.

---

## 8. Risk Mitigations

| Risk | Workflow | Mitigation Applied |
|------|----------|--------------------|
| Rate benchmark inaccurate | O4 | 10% tolerance buffer; show full range not just one number |
| AI gives incorrect legal advice | O3 | Disclaimer on every response; no legal advice claim |
| n8n fails silently | O1, O3, O4, O5 | Backend fallback to direct OpenAI call if webhook fails |
| Email delivery fails | O1, O5 | HTTP node with `retryOnFail: true`, 3 attempts, 5s delay |
| Contract analysis misses a clause | O3 | Recommends human legal review; RAG context reduces misses |
| Customer receives duplicate recovery email | O5 | `recovery_id` generated per event for deduplication |
| Health score data is stale | O2 | Scheduled weekly; production: replace with live DB query |
| Exclusivity clause locks creator out | O3 | RF-001 detected with HIGH severity and negotiation script |
| n8n cold start latency | O1, O3, O4 | Fallback ensures user never sees an error; logs ⚠️ warning |

---

*Documentation last updated: April 2026*
*Project: CreatorIQ — AI-Powered Creator Monetization Platform*
*Author: Mona M.*
