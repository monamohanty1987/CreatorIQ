"""
Test CreatorIQ Features to Generate LangSmith Experiment Data
Tests Commerce Script, Content Repurposer, Deal Navigator, and Deal Analyzer
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import httpx
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"
RESULTS = []

def test_commerce_script():
    """Test Commerce Script feature"""
    print("\nTesting Commerce Script...")

    test_cases = [
        {
            "name": "Digital E-Book",
            "product_name": "Digital E-Book: How to Study in Germany",
            "benefits": ["Comprehensive guide", "Save time on research"],
            "discount_code": "STUDY20",
            "content_type": "Tutorial",
            "tone": "Educational"
        },
        {
            "name": "SaaS Tool",
            "product_name": "ProjectFlow",
            "benefits": ["Boost productivity", "Real-time collaboration"],
            "discount_code": "CREATORS15",
            "content_type": "Review",
            "tone": "Professional"
        },
    ]

    for test in test_cases:
        try:
            response = httpx.post(
                f"{BASE_URL}/api/ai-commerce/generate-script",
                json={
                    "product_name": test["product_name"],
                    "benefits": test["benefits"],
                    "discount_code": test["discount_code"],
                    "content_type": test["content_type"],
                    "tone": test["tone"],
                },
                timeout=30
            )
            if response.status_code == 200:
                print(f"  [OK] {test['name']} - Commerce Script generated")
                RESULTS.append({
                    "feature": "Commerce Script",
                    "test_case": test["name"],
                    "status": "success"
                })
            else:
                print(f"  [FAIL] {test['name']} - Status: {response.status_code}")
        except Exception as e:
            print(f"  [ERROR] {test['name']} - {e}")

def test_content_repurposer():
    """Test Content Repurposer feature"""
    print("\nTesting Content Repurposer...")

    test_cases = [
        {
            "name": "YouTube to Social",
            "platforms": ["linkedin", "instagram"],
            "tone": "professional",
            "audience": "general",
            "input_content": "This is a comprehensive guide about digital marketing strategies for 2026."
        },
        {
            "name": "Blog to Threads",
            "platforms": ["threads", "twitter"],
            "tone": "casual",
            "audience": "tech-savvy",
            "input_content": "Tips and tricks for optimizing your Python code performance and readability."
        },
    ]

    for test in test_cases:
        try:
            response = httpx.post(
                f"{BASE_URL}/api/ai-repurposer/generate-variations",
                json={
                    "input_text": test["input_content"],
                    "platforms": test["platforms"],
                    "tone": test["tone"],
                    "audience": test["audience"],
                },
                timeout=30
            )
            if response.status_code == 200:
                print(f"  [OK] {test['name']} - Content repurposed for {len(test['platforms'])} platforms")
                RESULTS.append({
                    "feature": "Content Repurposer",
                    "test_case": test["name"],
                    "status": "success"
                })
            else:
                print(f"  [FAIL] {test['name']} - Status: {response.status_code}")
        except Exception as e:
            print(f"  [ERROR] {test['name']} - {e}")

def test_deal_navigator():
    """Test Deal Navigator feature"""
    print("\nTesting Deal Navigator...")

    test_cases = [
        {
            "name": "Simple Brand Deal",
            "creator_name": "Sarah Tech",
            "brand_name": "TechBrand Co",
            "contract_type": "brand-sponsorship",
            "creator_niche": "tech",
            "deal_value": 5000,
            "contract_text": "This is a sample brand sponsorship agreement..."
        },
        {
            "name": "Complex NDA",
            "creator_name": "John Creator",
            "brand_name": "SecureCompany",
            "contract_type": "nda",
            "creator_niche": "business",
            "deal_value": 0,
            "contract_text": "Confidentiality Agreement - All terms are confidential..."
        },
    ]

    for test in test_cases:
        try:
            response = httpx.post(
                f"{BASE_URL}/api/contracts/analyze",
                json={
                    "creator_name": test["creator_name"],
                    "brand_name": test["brand_name"],
                    "contract_type": test["contract_type"],
                    "creator_niche": test["creator_niche"],
                    "deal_value": test["deal_value"],
                    "contract_text": test["contract_text"],
                },
                timeout=30
            )
            if response.status_code == 200:
                print(f"  [OK] {test['name']} - Deal Navigator analyzed")
                RESULTS.append({
                    "feature": "Deal Navigator",
                    "test_case": test["name"],
                    "status": "success"
                })
            else:
                print(f"  [FAIL] {test['name']} - Status: {response.status_code}")
        except Exception as e:
            print(f"  [ERROR] {test['name']} - {e}")

def test_deal_analyzer():
    """Test Deal Analyzer feature"""
    print("\nTesting Deal Analyzer...")

    test_cases = [
        {
            "name": "Fair Tech Deal",
            "creator_name": "Tech Creator",
            "niche": "tech",
            "platform": "youtube",
            "followers": 50000,
            "offered_rate_usd": 5000.0
        },
        {
            "name": "Underpriced Beauty Deal",
            "creator_name": "Beauty Creator",
            "niche": "beauty",
            "platform": "instagram",
            "followers": 100000,
            "offered_rate_usd": 1000.0
        },
    ]

    for test in test_cases:
        try:
            response = httpx.post(
                f"{BASE_URL}/api/deals/analyze",
                params={
                    "creator_name": test["creator_name"],
                    "niche": test["niche"],
                    "platform": test["platform"],
                    "followers": test["followers"],
                    "offered_rate_usd": test["offered_rate_usd"],
                },
                timeout=30
            )
            if response.status_code == 200:
                print(f"  [OK] {test['name']} - Deal Analyzer scored")
                RESULTS.append({
                    "feature": "Deal Analyzer",
                    "test_case": test["name"],
                    "status": "success"
                })
            else:
                print(f"  [FAIL] {test['name']} - Status: {response.status_code}")
        except Exception as e:
            print(f"  [ERROR] {test['name']} - {e}")

if __name__ == "__main__":
    print("=" * 70)
    print("Testing CreatorIQ Features for LangSmith Experiments")
    print("=" * 70)

    test_commerce_script()
    test_content_repurposer()
    test_deal_navigator()
    test_deal_analyzer()

    print("\n" + "=" * 70)
    print("Test Results Summary")
    print("=" * 70)

    for result in RESULTS:
        status_icon = "[OK]" if result["status"] == "success" else "[FAIL]"
        print(f"{status_icon} {result['feature']}: {result['test_case']}")

    print("\n" + "=" * 70)
    print("Check LangSmith Cloud:")
    print("  1. Go to: https://eu.smith.langchain.com")
    print("  2. Project: CreatorIQ")
    print("  3. Tab: Tracing")
    print("  4. You should see new runs for each test")
    print("=" * 70)
