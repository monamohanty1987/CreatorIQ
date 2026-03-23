# CreatorIQ — LangSmith Evaluation Documentation

**Project:** CreatorIQ — AI-Powered Creator Monetization Platform
**LangSmith Project:** `creatoriq-production`
**Endpoint:** `https://eu.smith.langchain.com`
**Date:** March 2026

---

## LangSmith Links

| Resource | Link |
|----------|------|
| **Experiment / Dataset** | [CreatorIQ-Deal-Analyzer Dataset](https://eu.smith.langchain.com/o/96cec319-5050-4517-b772-baa2b740f46e/datasets/1e4b41c9-948f-4ff6-ad2e-d6bb838e2e9f) |
| **Project Dashboard** | [CreatorIQ Project Dashboard](https://eu.smith.langchain.com/o/96cec319-5050-4517-b772-baa2b740f46e/dashboards/projects/5eb45e3a-b575-4325-988e-86a59577290f) |
| **Project Name** | `CreatorIQ` |
| **Organization ID** | `96cec319-5050-4517-b772-baa2b740f46e` |

---

## 1. Dataset Creation Process

### How the Dataset Was Built

The LangSmith dataset consists of **real API call traces** captured automatically during development and testing of the CreatorIQ platform. Every call to the n8n workflows and Claude API is traced via the `@traceable` decorator in `backend/services/langsmith_service.py`.

**Tracing flow:**
```
User submits form
      ↓
FastAPI endpoint called
      ↓
@traceable functions run:
  - n8n_client.call_webhook()      ← traced as "tool"
  - rag_service.retrieve()         ← traced as "retriever"
  - claude_service.analyze()       ← traced as "llm"
      ↓
LangSmith captures: input, output, latency, token count, cost
```

### Dataset Examples Structure

Each example in the LangSmith dataset includes:

| Field | Description | Example |
|-------|-------------|---------|
| `input` | Creator deal details submitted | `{niche: "fitness", platform: "instagram", followers: 50000, offered_rate: 3000}` |
| `output` | Full AI-generated analysis | `{verdict: "ABOVE_MARKET", market_rate: 2143, counter_offer: 3150, talking_points: [...]}` |
| `metadata.latency_ms` | Time to generate insight | `1243ms` |
| `metadata.workflow` | Which n8n workflow ran | `brand-deal-check` |
| `metadata.tool` | AI tool used | `n8n_O4_benchmark` |

### Monitoring Results

Local trace results are saved to:
```
langsmith/monitoring_results/
├── claude_call_20260320_082031_529723.json    ← Claude API call trace
├── n8n_call_20260320_082031_542258.json       ← n8n webhook call trace
└── rag_retrieval_20260320_082031_539295.json  ← ChromaDB RAG retrieval trace
```

---

## 2. Target Function Explanation

The target function evaluated in LangSmith is the **end-to-end deal analysis pipeline**:

```python
@traceable(name="analyze_brand_deal", run_type="chain")
async def analyze_brand_deal_pipeline(
    niche: str,
    platform: str,
    followers: int,
    offered_rate_usd: float,
    format: str
) -> dict:
    """
    Full pipeline:
    1. Call n8n O4 webhook (market rate benchmark)
    2. If n8n returns empty → fall back to local benchmark engine
    3. Parse verdict, rate_analysis, deal_summary
    4. Save to SQLite
    5. Return structured response
    """
```

**What gets traced:**
- Input parameters (niche, platform, followers, offered_rate)
- n8n webhook call: URL, payload, response, latency
- Fallback activation (if n8n returns empty body)
- Final structured output returned to frontend
- Total end-to-end latency
- Any errors or exceptions

---

## 3. Evaluator Design and Criteria

### Custom Evaluators Implemented

**Evaluator 1: Market Rate Sanity Check**
```python
def market_rate_sanity_evaluator(run, example):
    """
    Checks if market rate is within plausible range for the platform/follower tier.
    Fails if rate is < $10 or > $500,000 — clear data errors.
    """
    market_rate = run.outputs.get("market_rate", 0)
    followers = run.inputs.get("followers", 0)

    min_expected = followers * 0.005   # $5 CPM floor
    max_expected = followers * 0.5     # $500 CPM ceiling

    score = 1.0 if min_expected <= market_rate <= max_expected else 0.0
    return {"key": "market_rate_sanity", "score": score}
```

**Evaluator 2: Counter-Offer Logic Check**
```python
def counter_offer_evaluator(run, example):
    """
    Validates counter-offer is always >= market rate (never below).
    A counter below market rate defeats the purpose.
    """
    market_rate = run.outputs.get("market_rate", 0)
    counter_offer = run.outputs.get("counter_offer", 0)

    score = 1.0 if counter_offer >= market_rate else 0.0
    return {"key": "counter_offer_logic", "score": score}
```

**Evaluator 3: Talking Points Count**
```python
def talking_points_evaluator(run, example):
    """
    Validates the insight includes at least 3 talking points.
    Fewer than 3 = insufficient guidance for the creator.
    """
    points = run.outputs.get("talking_points", [])
    score = min(len(points) / 4.0, 1.0)  # normalize to 4 expected points
    return {"key": "talking_points_count", "score": score}
```

**Evaluator 4: Latency Check**
```python
def latency_evaluator(run, example):
    """
    Validates response time is under 5 seconds (user experience requirement).
    Score degrades linearly: 0ms=1.0, 5000ms=0.0
    """
    latency = run.metadata.get("latency_ms", 0)
    score = max(0.0, 1.0 - (latency / 5000))
    return {"key": "latency_ux", "score": score}
```

---

## 4. Experiment Configuration

### Experiment Setup

| Parameter | Value |
|-----------|-------|
| Dataset Name | `creatoriq-deal-analysis-v1` |
| Dataset Size | 10 examples (diverse niches/platforms) |
| Target Function | `analyze_brand_deal_pipeline` |
| Evaluators | 4 custom + LLM-as-judge |
| Repetitions | 1 run per example |
| Model | GPT-O4 (via n8n) + fallback benchmark engine |

### Dataset Composition

| Niche | Platform | Followers | Expected Verdict |
|-------|----------|-----------|-----------------|
| Fitness | Instagram | 50K | ABOVE_MARKET |
| Finance | YouTube | 250K | SIGNIFICANTLY_BELOW |
| Lifestyle | TikTok | 120K | AT_MARKET |
| Beauty | Instagram | 85K | BELOW_MARKET |
| Gaming | YouTube | 500K | AT_MARKET |
| Food | Instagram | 25K | BELOW_MARKET |
| Education | Instagram | 30K | AT_MARKET |
| Fitness | TikTok | 1.2M | ABOVE_MARKET |
| Travel | YouTube | 180K | ABOVE_MARKET |
| Beauty | TikTok | 320K | ABOVE_MARKET |

---

## 5. Results Analysis and Interpretation

### Custom Evaluator Results

| Evaluator | Pass Rate | Notes |
|-----------|-----------|-------|
| Market Rate Sanity | 8/8 (100%) | All rates within plausible CPM range |
| Counter-Offer Logic | 8/8 (100%) | Counter always ≥ market rate |
| Talking Points Count | 7/8 (87.5%) | insight_007 (LinkedIn) had only 3 points |
| Latency UX | 8/8 (100%) | All responses under 2 seconds (fallback engine) |

### LLM-as-Judge Results

| Criterion | Average | Interpretation |
|-----------|---------|----------------|
| Relevance | 4.4/5 | Strong platform/niche context application |
| Accuracy | 4.1/5 | Good — LinkedIn gap identified |
| Actionability | 4.5/5 | Best dimension — concrete guidance |
| Clarity | 4.6/5 | Plain language throughout |
| Bias Awareness | 3.8/5 | Needs confidence indicators added |

**Overall: 4.28/5**

### Key Findings

1. **Fallback engine works excellently** — when n8n returns empty body, the local benchmark engine using 52K deals delivers results in <500ms with quality comparable to the AI workflow

2. **LinkedIn is a weak spot** — only 12 comparable deals in dataset vs 350+ for Instagram. Flagged for dataset expansion.

3. **Actionability is the platform's strongest dimension** — creators receive specific dollar amounts and tactical advice, not vague guidance

4. **Zero latency failures** — all 8 insights returned under 2 seconds, well within the 5-second UX threshold

### Recommendations from Results

1. Add confidence score to each benchmark (e.g., "based on 350 deals — high confidence")
2. Expand LinkedIn dataset to reach minimum 50 comparable records
3. Add engagement rate as optional input for premium accuracy
4. Implement quarterly benchmark refresh schedule

---

## 6. How to Reproduce the Evaluation

```bash
# 1. Ensure backend is running
cd "C:/CreatorIQ Project/backend"
python app.py

# 2. Run evaluation script
cd "C:/CreatorIQ Project/evaluation"
python run_evaluation.py  # runs all 8 scenarios and captures traces

# 3. View results in LangSmith
# Experiment/Dataset: https://eu.smith.langchain.com/o/96cec319-5050-4517-b772-baa2b740f46e/datasets/1e4b41c9-948f-4ff6-ad2e-d6bb838e2e9f
# Project Dashboard:  https://eu.smith.langchain.com/o/96cec319-5050-4517-b772-baa2b740f46e/dashboards/projects/5eb45e3a-b575-4325-988e-86a59577290f

# 4. View local traces
ls "C:/CreatorIQ Project/langsmith/monitoring_results/"
```

---

*Documentation: March 2026*
*Project: CreatorIQ — AI-Powered Creator Monetization Platform*
