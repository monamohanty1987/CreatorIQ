"""
Create LangSmith Datasets and Experiments for CreatorIQ Features
"""
import sys
import os
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import settings
os.environ["LANGCHAIN_API_KEY"]    = settings.LANGCHAIN_API_KEY
os.environ["LANGCHAIN_ENDPOINT"]   = settings.LANGCHAIN_ENDPOINT
os.environ["LANGSMITH_ENDPOINT"]   = settings.LANGCHAIN_ENDPOINT
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"]    = settings.LANGCHAIN_PROJECT

from langsmith import Client

def create_all_datasets():
    client = Client(
        api_url=settings.LANGCHAIN_ENDPOINT,
        api_key=settings.LANGCHAIN_API_KEY
    )

    print("=" * 60)
    print("Creating LangSmith Datasets for CreatorIQ")
    print(f"Endpoint: {settings.LANGCHAIN_ENDPOINT}")
    print("=" * 60)

    # 1. COMMERCE SCRIPT
    print("\n[1/4] Commerce Script dataset...")
    try:
        ds = client.create_dataset(
            dataset_name="CreatorIQ_Commerce_Script_Tests",
            description="Evaluation dataset for AI Commerce Script Generator"
        )
        examples = [
            {
                "inputs": {"product_name": "Digital E-Book: How to Study in Germany", "benefits": ["Comprehensive guide", "Save time"], "discount_code": "STUDY20", "content_type": "Tutorial", "tone": "Educational"},
                "outputs": {"success": True, "has_intro": True, "has_midpoint": True, "has_outro": True}
            },
            {
                "inputs": {"product_name": "ProjectFlow - Project Management Tool", "benefits": ["Boost productivity", "Real-time collaboration"], "discount_code": "CREATORS15", "content_type": "Review", "tone": "Professional"},
                "outputs": {"success": True, "has_intro": True, "has_midpoint": True, "has_outro": True}
            },
            {
                "inputs": {"product_name": "Advanced Python Course", "benefits": ["Expert instructors", "Lifetime access"], "discount_code": "PYTHON25", "content_type": "How-To", "tone": "Authentic"},
                "outputs": {"success": True, "has_intro": True, "has_midpoint": True, "has_outro": True}
            },
        ]
        for ex in examples:
            client.create_example(dataset_id=ds.id, inputs=ex["inputs"], outputs=ex["outputs"])
        print(f"  [OK] Created with {len(examples)} examples")
    except Exception as e:
        print(f"  [SKIP] {e}")

    # 2. CONTENT REPURPOSER
    print("\n[2/4] Content Repurposer dataset...")
    try:
        ds = client.create_dataset(
            dataset_name="CreatorIQ_Content_Repurposer_Tests",
            description="Evaluation dataset for AI Content Repurposer"
        )
        examples = [
            {
                "inputs": {"content": "Complete guide to digital marketing strategies for 2026.", "platforms": ["linkedin", "instagram"], "tone": "professional", "audience": "general"},
                "outputs": {"platforms_generated": 2, "linkedin_adapted": True, "instagram_adapted": True}
            },
            {
                "inputs": {"content": "Tips for optimizing Python code performance.", "platforms": ["linkedin", "youtube"], "tone": "educational", "audience": "tech-savvy"},
                "outputs": {"platforms_generated": 2, "linkedin_adapted": True, "youtube_adapted": True}
            },
            {
                "inputs": {"content": "My fitness journey - how I lost 20kg in 6 months.", "platforms": ["instagram", "tiktok"], "tone": "casual", "audience": "fitness enthusiasts"},
                "outputs": {"platforms_generated": 2, "instagram_adapted": True, "tiktok_adapted": True}
            },
        ]
        for ex in examples:
            client.create_example(dataset_id=ds.id, inputs=ex["inputs"], outputs=ex["outputs"])
        print(f"  [OK] Created with {len(examples)} examples")
    except Exception as e:
        print(f"  [SKIP] {e}")

    # 3. DEAL NAVIGATOR
    print("\n[3/4] Deal Navigator dataset...")
    try:
        ds = client.create_dataset(
            dataset_name="CreatorIQ_Deal_Navigator_Tests",
            description="Evaluation dataset for AI Deal Navigator (Contract Analyzer)"
        )
        examples = [
            {
                "inputs": {"creator_name": "Sarah Tech", "brand_name": "TechBrand Co", "contract_type": "brand-sponsorship", "creator_niche": "tech", "deal_value": 5000, "contract_text": "This brand sponsorship agreement grants exclusive rights..."},
                "outputs": {"analysis_provided": True, "educational_disclaimer": True, "complexity": "simple"}
            },
            {
                "inputs": {"creator_name": "John Creator", "brand_name": "SecureCompany", "contract_type": "nda", "creator_niche": "business", "deal_value": 0, "contract_text": "Non-Disclosure Agreement: All confidential information..."},
                "outputs": {"analysis_provided": True, "educational_disclaimer": True, "complexity": "simple"}
            },
            {
                "inputs": {"creator_name": "Emma Beauty", "brand_name": "GlowCosmetics", "contract_type": "influencer-marketing", "creator_niche": "beauty", "deal_value": 10000, "contract_text": "Influencer Marketing Agreement with exclusivity clauses, penalties and IP ownership terms..."},
                "outputs": {"analysis_provided": True, "educational_disclaimer": True, "complexity": "complex"}
            },
        ]
        for ex in examples:
            client.create_example(dataset_id=ds.id, inputs=ex["inputs"], outputs=ex["outputs"])
        print(f"  [OK] Created with {len(examples)} examples")
    except Exception as e:
        print(f"  [SKIP] {e}")

    # 4. DEAL ANALYZER - check existing
    print("\n[4/4] Deal Analyzer dataset...")
    try:
        existing = list(client.list_datasets(dataset_name="CreatorIQ-Deal-Analyzer"))
        if existing:
            print(f"  [EXISTS] Already exists: {existing[0].name} (id: {existing[0].id})")
        else:
            ds = client.create_dataset(
                dataset_name="CreatorIQ_Deal_Analyzer_Tests",
                description="Evaluation dataset for AI Deal Analyzer"
            )
            examples = [
                {
                    "inputs": {"creator_name": "Tech Creator", "niche": "tech", "platform": "youtube", "followers": 50000, "offered_rate_usd": 5000.0},
                    "outputs": {"verdict": "FAIR", "deal_scored": True}
                },
                {
                    "inputs": {"creator_name": "Beauty Creator", "niche": "beauty", "platform": "instagram", "followers": 100000, "offered_rate_usd": 1000.0},
                    "outputs": {"verdict": "BELOW_MARKET", "deal_scored": True}
                },
                {
                    "inputs": {"creator_name": "Lifestyle Creator", "niche": "lifestyle", "platform": "tiktok", "followers": 500000, "offered_rate_usd": 25000.0},
                    "outputs": {"verdict": "ABOVE_MARKET", "deal_scored": True}
                },
            ]
            for ex in examples:
                client.create_example(dataset_id=ds.id, inputs=ex["inputs"], outputs=ex["outputs"])
            print(f"  [OK] Created with {len(examples)} examples")
    except Exception as e:
        print(f"  [SKIP] {e}")

    print("\n" + "=" * 60)
    print("[DONE] Check LangSmith -> Datasets & Experiments")
    print("=" * 60)

if __name__ == "__main__":
    create_all_datasets()
