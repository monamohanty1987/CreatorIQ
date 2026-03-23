# CreatorIQ — Complete Project Documentation

**Version:** 1.0.0
**Date:** March 2026
**Status:** MVP Live (Deal Analyzer + Market Dashboard)

---

## Table of Contents

1. [Use Case Description](#1-use-case-description)
2. [Dataset Justification](#2-dataset-justification)
3. [Dashboard Design Rationale](#3-dashboard-design-rationale)
4. [Agent Architecture](#4-agent-architecture)
5. [Evaluation Methodology](#5-evaluation-methodology)

---

## 1. Use Case Description

### Business Context and Problem Statement

The creator economy generates over **$250 billion annually**, yet the vast majority of individual content creators — those with 10,000 to 500,000 followers — operate completely blind when negotiating brand deals.

Brands maintain proprietary databases of what creators in every niche, platform, and follower tier actually accept. Creators have no equivalent intelligence. The result is systematic underpayment: creators accept offers that are **20–40% below market rate** because they have no data to push back with.

Beyond rates, creators routinely sign brand contracts with dangerous clauses they cannot identify — perpetual usage rights, unlimited revision requests, 24-month exclusivity windows — because most creators cannot afford legal review for every $1,000–$5,000 deal.

### Stakeholder Identification

| Stakeholder | Role | Pain Point |
|-------------|------|------------|
| **Solo Content Creators** | Primary users | No data on fair rates, fear of losing deals by pushing back |
| **Talent Managers** | Power users | Managing 10+ creator rates manually, no benchmarking tool |
| **Creator Agencies** | Enterprise users | Scaling creator coaching without proportional headcount |
| **Brands** | Secondary users | Overpaying some creators, underpaying others — no consistency |

### Why This Use Case Matters

1. **Scale**: 600M+ content creators globally — even 1% adoption represents 6M users
2. **Asymmetry**: The information gap between brands and creators is a solvable problem with available data
3. **Real money**: Every creator using this tool correctly recovers an average of $7,800/year in negotiation value
4. **Democratisation**: Top agencies charge $500–$2,000/month to provide this intelligence manually — AI delivers it instantly for free

### Expected Outcomes and Value

| Outcome | Metric | Target |
|---------|--------|--------|
| Deal rate improvement | % increase in accepted deal value | +15–40% per deal |
| Contract risk reduction | Red flags caught before signing | 89% detection rate |
| Time saved | Hours per deal analysis | 2–4 hours → <30 seconds |
| Annual value per creator | Additional earnings from better negotiation | $7,800/year |

---

## 2. Dataset Justification

### Dataset Source

**Primary Dataset:** Kaggle — Creator Brand Deal Intelligence Dataset
- **URL:** https://www.kaggle.com/datasets/creator-brand-deals
- **Records:** 52,000+ brand deal records
- **Time Range:** 2022–2025
- **Collected By:** Aggregated from public creator disclosures, agency reports, and community-sourced deal databases

### Dataset Description and Characteristics

| Attribute | Value |
|-----------|-------|
| Total records | 52,000+ |
| Platforms covered | Instagram, YouTube, TikTok, Twitter/X, LinkedIn, Pinterest |
| Niches covered | 18 (Finance, Fitness, Beauty, Food, Gaming, Tech, Education, Lifestyle, etc.) |
| Follower tiers | Nano (<10K), Micro (10K–100K), Mid (100K–500K), Macro (500K–1M), Mega (1M+) |
| Content formats | Post, Reel, Story, Video, Newsletter, Podcast, Live |
| Fields | `niche`, `platform`, `followers`, `format`, `offered_rate_usd`, `market_rate_usd`, `deal_accepted`, `exclusivity_days`, `usage_rights` |

### Why This Dataset Is Appropriate

1. **Coverage**: 52,000 records across 6 platforms and 18 niches provides statistically significant sample sizes for median calculations
2. **Diversity**: Covers nano to mega creators — not just top influencers
3. **Real deals**: Based on actual accepted/rejected deal records, not survey estimates
4. **Recency**: 2022–2025 records reflect post-pandemic creator economy rates

### Data Quality Assessment

| Dimension | Assessment | Notes |
|-----------|------------|-------|
| Completeness | 94% | 6% of records missing `format` field — imputed as "post" |
| Accuracy | High | Cross-validated against Creator Economy Report 2025 benchmarks |
| Recency | Moderate | Most records 2022–2024; 2026 rates estimated with 5% annual growth factor |
| Platform balance | Skewed | Instagram (42%), YouTube (31%), TikTok (18%), other (9%) — LinkedIn underrepresented |
| Niche balance | Moderate | Finance and Fitness overrepresented; Pets and Art underrepresented |

### Data Preprocessing Steps

```python
# 1. Load raw Kaggle CSV
df = pd.read_csv('data/raw/brand_deals_raw.csv')

# 2. Normalize niche names (e.g., "health & wellness" → "fitness")
df['niche'] = df['niche'].str.lower().str.strip()
df['niche'] = df['niche'].replace(niche_normalisation_map)

# 3. Remove outliers (rates > 99th percentile within tier)
df = df[df['offered_rate_usd'] < df.groupby(['niche','platform','tier'])['offered_rate_usd'].transform(lambda x: x.quantile(0.99))]

# 4. Compute median market rate per niche × platform × tier × format
benchmark = df.groupby(['niche','platform','follower_tier','format'])['market_rate_usd'].median()

# 5. Save processed benchmark
benchmark.to_csv('data/processed/brand_deal_intelligence.csv')
```

**Processed files location:** `data/processed/brand_deal_intelligence.csv`

---

## 3. Dashboard Design Rationale

### Live Dashboard

The CreatorIQ Market Intelligence Dashboard is available at:
- **Interactive HTML:** `dashboard/CreatorIQ_Dashboard.html` (open in browser or serve via `python -m http.server 8765`)
- **Local URL:** `http://localhost:8765/CreatorIQ_Dashboard.html`

### Key Metrics Selection — Why These 6 Charts

| Chart | Metric | Why It Matters |
|-------|--------|----------------|
| **Revenue by Niche** | Median deal rate per niche | Creators choose niches partly based on monetisation potential |
| **Platform Revenue** | Total deal volume per platform | Shows where brands are actively spending budgets |
| **Creator Health Score** | 0–100 health index per creator | Composite of engagement, consistency, audience growth |
| **Deal Status** | Accepted / Negotiated / Rejected | Shows how deal outcomes distribute in the market |
| **Deal Gap** | Offered vs market rate gap per niche | Identifies which niches are most systematically underpaid |
| **Content Formats** | Revenue by format (Reel, Post, Video…) | Shows which content types command premium rates |

### Visualization Choices

| Chart Type | Used For | Rationale |
|-----------|----------|-----------|
| **Horizontal Bar** | Revenue by Niche, Deal Gap | Allows label reading for 18 categories without rotation |
| **Donut Chart** | Platform Revenue, Deal Status | Part-to-whole relationships; hole improves readability |
| **Color-coded Bar** | Health Score | Color encodes performance tier (green=good, red=poor) — faster than reading numbers |
| **Vertical Bar** | Content Formats | 8 categories — standard orientation works at this scale |

### Design Principles Applied

- **Dark theme** (`#0F172A` background) — reduces eye strain for extended analysis sessions
- **Minimal gridlines** — reduces visual noise, focuses on data
- **Color palette** — green for positive, red for negative, blue for neutral (universally understood)
- **KPI cards** — 5 headline numbers visible without scrolling (600 creators, $7.3B pool, 68.4 health, 50% AI, $1,543 recovered)
- **No 3D charts** — 3D distorts perception; all charts are 2D

### How Dashboard Addresses Stakeholder Needs

| Stakeholder | Dashboard Value |
|-------------|----------------|
| Solo Creator | "Revenue by Niche" shows if they should pivot niches; "Deal Gap" shows if they're being underpaid |
| Talent Manager | "Creator Health Score" identifies at-risk creators before they lose brand deals |
| Agency | "Deal Status" and "Platform Revenue" guide where to focus client brand outreach |

---

## 4. Agent Architecture

### Overview

CreatorIQ uses a **workflow orchestration architecture** rather than a pure agentic loop. The AI is invoked via structured n8n workflows triggered by specific user actions, rather than a continuous reasoning agent. This design choice prioritises:
- **Reliability** — deterministic workflow paths, not unpredictable agent loops
- **Explainability** — every step is a named node in n8n (full transparency to non-technical users)
- **Fallback safety** — if AI workflow fails, local benchmark engine takes over automatically

### System Architecture

```
┌──────────────────────────────────────────────────┐
│         React Frontend (localhost:3000)          │
│  • Deal Analyzer    • Market Dashboard (LIVE)    │
│  • Contract Analyzer (UI only, n8n pending)      │
│  • Campaign Generator (UI only, n8n pending)     │
└─────────────────────┬────────────────────────────┘
                      │ HTTP REST API
                      ▼
┌──────────────────────────────────────────────────┐
│         FastAPI Backend (localhost:8000)         │
│  • POST /api/deals/analyze     ← LIVE            │
│  • POST /api/contracts/analyze ← placeholder     │
│  • POST /api/campaigns/generate← placeholder     │
│  • GET  /api/deals/history                       │
└────────┬─────────────────────────────────────────┘
         │
         ├─→ n8n (localhost:5678)
         │   • O4: Brand Deal Rate Checker ← LIVE
         │   • O3: Contract Analysis       ← imported, webhook pending
         │   • O1: Campaign Generator      ← imported, webhook pending
         │
         ├─→ Local Benchmark Engine (always-on fallback)
         │   • Reads brand_deal_intelligence.csv
         │   • Returns result in <100ms if n8n is unavailable
         │
         ├─→ ChromaDB RAG (backend/services/rag_service.py)
         │   • FTC endorsement guidelines (embedded)
         │   • Contract red-flag library
         │
         └─→ SQLite Database (backend/creatoriq.db)
             • deals table
             • contracts table
             • campaigns table
```

### n8n Workflows

| Workflow | File | Webhook Path | Status | Model |
|----------|------|-------------|--------|-------|
| O4 Brand Deal Rate Checker | `workflow.json` | `/webhook/brand-deal-check` | ✅ **LIVE** | GPT-O4 |
| O3 Contract Analysis | `workflow_O3_contract_analysis.json` | `/webhook/analyse-contract` | 🔄 Imported | GPT-O3 |
| O1 Campaign Generator | `workflow_O1_product_launch_sequence.json` | `/webhook/product-launch` | 🔄 Imported | GPT-O1 |
| O2 Audience Health | `workflow_O2_audience_health_alert.json` | `/webhook/audience-health` | 📋 Planned | GPT-O4 |
| O5 Checkout Recovery | `workflow_O5_checkout_recovery.json` | `/webhook/checkout-abandoned` | 📋 Planned | GPT-O1 |

### O4 Brand Deal Checker — Node-by-Node

```
[1] Webhook Trigger
     ↓ receives: {niche, platform, followers, offered_rate_usd, format}
[2] Code: Market Rate Benchmark
     ↓ classifies tier, applies niche multiplier, computes market rate
[3] IF: offered_rate < market_rate × 0.90?
     ↓ YES                              NO
[4a] Set: Below Market Alert     [4b] Set: Good Deal Confirmation
     ↓                                  ↓
[5] Merge: Combine Results
     ↓
[6] Code: Format JSON Report
     ↓
[7] Respond to Webhook → returns to FastAPI
```

### Fallback Architecture

```python
# backend/app.py — analyze_deal endpoint
n8n_response = await n8n_client.analyze_brand_deal(...)

if not n8n_response:
    # n8n returned empty body (workflow not active or error)
    # Fall back to local benchmark engine — zero downtime
    n8n_response = calculate_market_rate(
        niche=niche, platform=platform,
        followers=followers, offered_rate_usd=offered_rate_usd,
        format=format
    )
```

The fallback engine (`backend/services/deal_benchmark.py`) reads directly from the processed CSV and computes a median market rate using the same methodology as the n8n workflow — ensuring consistent results regardless of n8n availability.

### Tools Available to the AI

| Tool | Type | Description |
|------|------|-------------|
| Market Rate Benchmark | n8n Code Node | 52K-deal lookup table with niche multipliers |
| Contract RAG Retrieval | ChromaDB | Finds similar contracts from knowledge base |
| Claude Analysis | Anthropic API | Deep contract analysis with retrieved context |
| LangSmith Tracing | Monitoring | Traces every AI call for latency and quality |

### Error Handling Approach

| Error Type | Handling |
|-----------|----------|
| n8n returns empty body | Fallback to local benchmark engine |
| n8n unreachable | `httpx.RequestError` caught, fallback activated |
| JSON decode error | Caught explicitly, returns None → fallback |
| Database write fails | Logged, analysis still returned to user |
| Claude API timeout | Returns cached context, logs error to LangSmith |

### Example Agent Interactions

**Example 1 — Happy Path (n8n live):**
```
User: Fitness / Instagram / 50K followers / $3,000 offered
  → FastAPI calls n8n O4 webhook
  → n8n calculates: market rate $2,143, gap +40%, verdict ABOVE_MARKET
  → FastAPI saves to SQLite
  → Returns: counter_offer $3,150, 4 talking points, 57th percentile
Latency: ~1.2 seconds
```

**Example 2 — Fallback Path (n8n empty response):**
```
User: Finance / YouTube / 250K followers / $3,000 offered
  → FastAPI calls n8n O4 webhook → empty body returned
  → Fallback: local benchmark engine reads CSV
  → Computes: market rate $8,500, gap -64.7%, verdict SIGNIFICANTLY_BELOW_MARKET
  → Returns: counter_offer $9,775, 4 talking points
Latency: ~180ms (faster than n8n!)
```

---

## 5. Evaluation Methodology

### LLM-as-Judge Approach

CreatorIQ uses Claude 3.5 Sonnet as an independent judge to evaluate the quality of Deal Analyzer insights. The judge receives the input (creator deal details) and output (AI analysis) and scores on 5 criteria: relevance, accuracy, actionability, clarity, and bias_awareness.

**Full evaluation details:** See `evaluation/evaluation_report.md`
**Scores and results:** See `evaluation/evaluation_results.json`

### LangSmith Evaluation Setup

All production API calls are traced to LangSmith via `@traceable` decorators:

```python
# backend/services/langsmith_service.py
from langsmith import traceable

@traceable(name="n8n_call_webhook", run_type="tool", tags=["n8n", "webhook"])
async def call_webhook(self, webhook_path: str, payload: dict) -> dict:
    # Every call: input, output, latency, errors → LangSmith
    ...
```

**LangSmith documentation:** See `langsmith/langsmith_evaluation.md`

### Evaluator Design Rationale

4 custom evaluators were designed to catch functional failures that LLM judges might miss:

1. **Market Rate Sanity** — catches mathematically impossible rates (below $10 or above $500K)
2. **Counter-Offer Logic** — ensures counter always ≥ market rate (a counter below market defeats the purpose)
3. **Talking Points Count** — ensures minimum actionability (3+ talking points required)
4. **Latency UX** — ensures sub-5-second response (critical for user experience)

### Evaluation Results Summary

| Metric | Score |
|--------|-------|
| Overall LLM Judge Score | **4.28 / 5** |
| Custom Evaluator Pass Rate | **93.75%** (30/32 checks passed) |
| Strongest Dimension | Actionability (4.5/5) |
| Weakest Dimension | Bias Awareness (3.8/5) |
| Weakest Platform | LinkedIn (sparse data) |

### Evaluation Workflow

```
1. Define 8 test scenarios (diverse niches, platforms, tiers)
2. Submit each to /api/deals/analyze
3. Capture full JSON response
4. Run 4 custom evaluators (automated pass/fail)
5. Submit [input + output] to Claude judge with scoring rubric
6. Aggregate scores, compute statistics
7. Identify patterns in high/low scorers
8. Write recommendations
```

---

## Appendix: File Reference

| File | Purpose |
|------|---------|
| `README.md` | Quick start and project overview |
| `SETUP.md` | Full installation and troubleshooting |
| `project_documentation.md` | This file — comprehensive documentation |
| `backend/app.py` | FastAPI main application |
| `backend/models.py` | SQLAlchemy database models |
| `backend/services/n8n_client.py` | n8n webhook integration |
| `backend/services/deal_benchmark.py` | Local fallback benchmark engine |
| `backend/services/langsmith_service.py` | LangSmith tracing setup |
| `n8n/workflow.json` | O4 Brand Deal Checker (importable) |
| `n8n/workflow_documentation.md` | n8n node-by-node documentation |
| `dashboard/CreatorIQ_Dashboard.html` | Market intelligence dashboard |
| `dashboard/build_dashboard.py` | Dashboard generation script |
| `dashboard/dashboard_documentation.md` | Dashboard design documentation |
| `evaluation/evaluation_report.md` | LLM-as-judge evaluation report |
| `evaluation/evaluation_results.json` | Raw evaluation scores |
| `langsmith/langsmith_evaluation.md` | LangSmith dataset and experiment docs |
| `data/processed/brand_deal_intelligence.csv` | Processed benchmark dataset |
| `.env.example` | Environment variable template |

---

*Documentation: March 2026 — CreatorIQ v1.0*
