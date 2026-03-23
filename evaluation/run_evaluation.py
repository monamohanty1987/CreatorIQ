"""
CreatorIQ — LangSmith Experiment Evaluation Script
===================================================
Pushes 8 deal scenarios to LangSmith as a Dataset + Experiment.
Results appear in LangSmith UI:
  → Datasets & Testing > CreatorIQ-Deal-Analyzer > Experiments tab

Also saves results locally to evaluation_results.json.

Usage:
    cd "C:/CreatorIQ Project/evaluation"
    python run_evaluation.py

Requirements:
    - Backend running at http://localhost:8000
    - LANGCHAIN_API_KEY set in ../.env
    - LANGCHAIN_TRACING_V2=true in ../.env
    - LANGCHAIN_ENDPOINT=https://eu.api.smith.langchain.com in ../.env
"""

import os
import json
import httpx
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# ── Load environment ─────────────────────────────────────────────────────────
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)
print(f"Loading .env from: {env_path}")

# Verify LangSmith is configured
LANGSMITH_KEY = os.getenv("LANGCHAIN_API_KEY", "")
if not LANGSMITH_KEY:
    print("ERROR: LANGCHAIN_API_KEY not set in .env — cannot push to LangSmith.")
    exit(1)

from langsmith import Client, evaluate as ls_evaluate

BACKEND_URL   = "http://localhost:8000"
OUTPUT_FILE   = Path(__file__).parent / "evaluation_results.json"
DATASET_NAME  = "CreatorIQ-Deal-Analyzer"

# ── 8 Test Scenarios ──────────────────────────────────────────────────────────
TEST_SCENARIOS = [
    {"niche": "fitness",   "platform": "instagram", "followers": 50000,   "offered_rate_usd": 3000,  "format": "post"},
    {"niche": "finance",   "platform": "youtube",   "followers": 250000,  "offered_rate_usd": 3000,  "format": "video"},
    {"niche": "lifestyle", "platform": "tiktok",    "followers": 120000,  "offered_rate_usd": 1800,  "format": "reel"},
    {"niche": "beauty",    "platform": "instagram", "followers": 85000,   "offered_rate_usd": 700,   "format": "reel"},
    {"niche": "gaming",    "platform": "youtube",   "followers": 500000,  "offered_rate_usd": 10000, "format": "video"},
    {"niche": "food",      "platform": "instagram", "followers": 25000,   "offered_rate_usd": 150,   "format": "post"},
    {"niche": "education", "platform": "instagram", "followers": 30000,   "offered_rate_usd": 500,   "format": "post"},
    {"niche": "fitness",   "platform": "tiktok",    "followers": 1200000, "offered_rate_usd": 25000, "format": "video"},
    # Scenarios 9 & 10 — added to meet minimum 10-example requirement
    {"niche": "travel",    "platform": "youtube",   "followers": 180000,  "offered_rate_usd": 4500,  "format": "video"},
    {"niche": "beauty",    "platform": "tiktok",    "followers": 320000,  "offered_rate_usd": 6000,  "format": "reel"},
]


# ── Step 1: Create / reuse LangSmith Dataset ─────────────────────────────────
def setup_dataset(client: Client) -> str:
    """
    Creates the dataset in LangSmith if it doesn't exist.
    Returns the dataset name (used by evaluate()).
    """
    existing = list(client.list_datasets(dataset_name=DATASET_NAME))
    if existing:
        print(f"  Dataset already exists: '{DATASET_NAME}' (id={existing[0].id})")
        print(f"  Skipping example upload — using existing examples.")
        return DATASET_NAME

    print(f"  Creating new dataset: '{DATASET_NAME}'")
    dataset = client.create_dataset(
        dataset_name=DATASET_NAME,
        description=(
            "8 brand deal scenarios for evaluating the CreatorIQ Deal Analyzer. "
            "Covers fitness, finance, lifestyle, beauty, gaming, food, education niches "
            "across Instagram, YouTube, TikTok — from Micro to Mega tier creators."
        ),
    )

    # Add all 8 scenarios as examples
    # inputs  = what goes into the target function
    # outputs = reference / expected answer (used for comparison in LangSmith UI)
    inputs_list  = [s.copy() for s in TEST_SCENARIOS]
    outputs_list = [
        {
            "expected_verdict": (
                "ABOVE_MARKET" if s["offered_rate_usd"] / s["followers"] > 0.05
                else "BELOW_MARKET"
            ),
            "note": f"{s['niche']} creator on {s['platform']} with {s['followers']:,} followers",
        }
        for s in TEST_SCENARIOS
    ]

    client.create_examples(
        inputs=inputs_list,
        outputs=outputs_list,
        dataset_id=dataset.id,
    )
    print(f"  Added {len(TEST_SCENARIOS)} examples to dataset.")
    return DATASET_NAME


# ── Step 2: Target Function (what we are evaluating) ─────────────────────────
def target(inputs: dict) -> dict:
    """
    Calls the live CreatorIQ Deal Analyzer API.
    This is the function LangSmith will run for each dataset example.
    """
    params = {
        "creator_name":    "LangSmithEval",
        "niche":           inputs["niche"],
        "platform":        inputs["platform"],
        "followers":       inputs["followers"],
        "offered_rate_usd":inputs["offered_rate_usd"],
        "format":          inputs["format"],
    }
    try:
        response = httpx.post(
            f"{BACKEND_URL}/api/deals/analyze",
            params=params,
            timeout=30,
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # Return empty dict so evaluators can handle gracefully
        return {"error": str(e)}


# ── Step 3: Five Evaluator Functions ─────────────────────────────────────────
# Each evaluator receives:
#   run     — the actual output from target()
#   example — the dataset example (inputs + reference outputs)
# Each must return {"key": "<name>", "score": 0.0–1.0}

def eval_relevance(run, example):
    """
    Are talking points tailored to this specific niche and platform?
    Score 1.0 if both mentioned, 0.8 if one, 0.6 if neither.
    """
    outputs = run.outputs or {}
    inputs  = example.inputs
    talking_points = outputs.get("talking_points", [])
    text   = " ".join(talking_points).lower()
    niche  = inputs.get("niche", "").lower()
    platform = inputs.get("platform", "").lower()
    niche_ok    = niche in text
    platform_ok = platform in text
    score = 1.0 if (niche_ok and platform_ok) else 0.8 if (niche_ok or platform_ok) else 0.6
    return {"key": "relevance", "score": score}


def eval_accuracy(run, example):
    """
    Is the market rate within a realistic CPM range and does the verdict
    align with the gap direction?
    Score 1.0 = in range + verdict aligned, 0.8 = in range only, 0.4 = out of range.
    """
    outputs     = run.outputs or {}
    inputs      = example.inputs
    market_rate = outputs.get("market_rate", 0) or 0
    followers   = inputs.get("followers", 0)
    verdict     = outputs.get("verdict", "")
    gap_pct     = outputs.get("gap_pct", 0) or 0
    min_rate    = followers * 0.003   # $3 CPM floor
    max_rate    = followers * 1.0     # $1,000 CPM ceiling
    in_range    = min_rate <= market_rate <= max_rate
    direction_ok = (
        ("BELOW" in verdict and gap_pct < 0) or
        ("ABOVE" in verdict and gap_pct > 0) or
        ("AT_MARKET" in verdict and abs(gap_pct) <= 15)
    )
    score = 1.0 if (in_range and direction_ok) else 0.8 if in_range else 0.4
    return {"key": "accuracy", "score": score}


def eval_actionability(run, example):
    """
    Does the creator have a counter-offer + 3+ talking points + recommendation?
    Score 1.0 = all three, 0.8 = counter + points, 0.6 = partial, 0.2 = nothing.
    """
    outputs       = run.outputs or {}
    counter_offer = outputs.get("counter_offer", 0) or 0
    talking_points = outputs.get("talking_points", [])
    recommendation = outputs.get("recommendation", "")
    has_counter   = counter_offer > 0
    has_points    = len(talking_points) >= 3
    has_rec       = bool(recommendation)
    score = (
        1.0 if (has_counter and has_points and has_rec) else
        0.8 if (has_counter and has_points) else
        0.6 if (has_counter or has_points) else
        0.2
    )
    return {"key": "actionability", "score": score}


def eval_clarity(run, example):
    """
    Is there a readable headline (3-20 words) + a recommendation sentence?
    Score 1.0 = both + good length, 0.8 = both present, 0.6 = headline only, 0.4 = neither.
    """
    outputs        = run.outputs or {}
    headline       = outputs.get("headline", "")
    recommendation = outputs.get("recommendation", "")
    word_count     = len(headline.split()) if headline else 0
    score = (
        1.0 if (headline and recommendation and 3 <= word_count <= 20) else
        0.8 if (headline and recommendation) else
        0.6 if headline else
        0.4
    )
    return {"key": "clarity", "score": score}


def eval_bias_awareness(run, example):
    """
    Are data sources cited in the talking points?
    Counts source keywords: median, comparable, benchmark, deals, percentile, tier, data.
    Score 1.0 = 3+, 0.8 = 2, 0.6 = 1, 0.4 = 0.
    """
    outputs        = run.outputs or {}
    talking_points = outputs.get("talking_points", [])
    text           = " ".join(talking_points).lower()
    keywords       = ["median", "comparable", "benchmark", "deals", "percentile", "tier", "data"]
    refs           = sum(1 for kw in keywords if kw in text)
    score = 1.0 if refs >= 3 else 0.8 if refs >= 2 else 0.6 if refs >= 1 else 0.4
    return {"key": "bias_awareness", "score": score}


# ── Step 4: Local JSON Save ───────────────────────────────────────────────────
def save_local_results(experiment_results):
    """Convert LangSmith experiment results to local JSON format."""
    insights = []
    criteria = ["relevance", "accuracy", "actionability", "clarity", "bias_awareness"]

    for i, result in enumerate(experiment_results._results, 1):
        run     = result.get("run")
        example = result.get("example")
        evals   = result.get("evaluation_results", {}).get("results", [])

        scores = {}
        for ev in evals:
            key = getattr(ev, "key", None)
            score = getattr(ev, "score", None)
            if key and score is not None:
                # Convert 0-1 back to 1-5 scale for local JSON consistency
                scores[key] = round(score * 4 + 1, 1)

        outputs = run.outputs if run and run.outputs else {}
        inputs  = example.inputs if example else {}
        overall = round(sum(scores.get(c, 3) for c in criteria) / len(criteria), 2)

        insights.append({
            "insight_id":   f"insight_{i:03d}",
            "input":        inputs,
            "agent_output": outputs,
            "llm_judge_scores": {c: scores.get(c, 0) for c in criteria},
            "overall_score":    overall,
            "judge_reasoning":  (
                f"Market rate ${outputs.get('market_rate', 0):,.0f} | "
                f"Verdict: {outputs.get('verdict', 'N/A')} | "
                f"Gap: {outputs.get('gap_pct', 0):+.1f}%"
            ),
        })

    if not insights:
        return

    overall_scores = [i["overall_score"] for i in insights]
    avg_scores = {}
    for c in criteria:
        vals = [i["llm_judge_scores"].get(c, 0) for i in insights]
        avg_scores[c] = round(sum(vals) / len(vals), 2)

    output = {
        "evaluation_metadata": {
            "project":                  "CreatorIQ — AI-Powered Creator Monetization Platform",
            "evaluation_date":          datetime.now().strftime("%Y-%m-%d"),
            "evaluator_model":          "LangSmith Rule-Based Evaluators",
            "tool_evaluated":           "Brand Deal Rate Analyzer (O4 Workflow)",
            "total_insights_evaluated": len(insights),
            "evaluation_criteria":      criteria,
            "langsmith_dataset":        DATASET_NAME,
        },
        "summary_statistics": {
            "average_scores":           avg_scores,
            "overall_average":          round(sum(overall_scores) / len(overall_scores), 2),
            "highest_scoring_insight":  max(insights, key=lambda x: x["overall_score"])["insight_id"],
            "lowest_scoring_insight":   min(insights, key=lambda x: x["overall_score"])["insight_id"],
        },
        "insights": insights,
    }

    OUTPUT_FILE.write_text(json.dumps(output, indent=2))
    print(f"\n  Local results saved to: {OUTPUT_FILE}")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("=" * 65)
    print("CreatorIQ — LangSmith Experiment Evaluation")
    print(f"Dataset : {DATASET_NAME}")
    print(f"Backend : {BACKEND_URL}")
    print(f"LangSmith endpoint: {os.getenv('LANGCHAIN_ENDPOINT', 'default')}")
    print("=" * 65)

    # Verify backend is reachable
    try:
        health = httpx.get(f"{BACKEND_URL}/health", timeout=5)
        print(f"\n  Backend status: {health.json().get('status', 'ok')}")
    except Exception:
        print(f"\n  ERROR: Backend not reachable at {BACKEND_URL}")
        print(f"  Start it with: cd backend && python app.py")
        exit(1)

    # Initialize LangSmith client
    ls_client = Client()

    # Step 1: Create dataset
    print("\n[1/3] Setting up LangSmith dataset...")
    setup_dataset(ls_client)

    # Step 2: Run experiment — pushes to LangSmith automatically
    experiment_prefix = f"deal-analyzer-{datetime.now().strftime('%Y%m%d')}"
    print(f"\n[2/3] Running experiment '{experiment_prefix}'...")
    print(f"      Calling {len(TEST_SCENARIOS)} scenarios × 5 evaluators...")

    results = ls_evaluate(
        target,
        data=DATASET_NAME,
        evaluators=[
            eval_relevance,
            eval_accuracy,
            eval_actionability,
            eval_clarity,
            eval_bias_awareness,
        ],
        experiment_prefix=experiment_prefix,
        metadata={
            "project":  "CreatorIQ",
            "tool":     "Brand Deal Rate Analyzer",
            "version":  "1.0",
            "backend":  BACKEND_URL,
        },
        max_concurrency=1,  # Run sequentially to avoid overwhelming the backend
    )

    # Step 3: Save locally
    print("\n[3/3] Saving local copy...")
    try:
        save_local_results(results)
    except Exception as e:
        print(f"  Warning: Could not save local JSON ({e}) — LangSmith results still saved.")

    # Print summary
    print("\n" + "=" * 65)
    print("EVALUATION COMPLETE")
    print(f"  View experiment : https://eu.smith.langchain.com")
    print(f"  Navigate to     : Datasets & Testing > {DATASET_NAME} > Experiments")
    print(f"  Local results   : {OUTPUT_FILE}")
    print("=" * 65)


if __name__ == "__main__":
    main()
