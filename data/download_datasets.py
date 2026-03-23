"""
CreatorIQ Dataset Downloader
Downloads all required Kaggle datasets into their respective module folders.
"""

import kaggle
import os
import sys

api = kaggle.KaggleApi()
api.authenticate()

BASE = "C:/CreatorIQ Project/data/raw"

datasets = [
    {
        "name": "Social Media Sponsorship & Engagement",
        "slug": "karim12345/social-media-sponsorships",
        "fallback": "influencers/social-media-influencers-brand-deals",
        "dest": f"{BASE}/module2_module4",
        "modules": "Module 2 + Module 4"
    },
    {
        "name": "YouTube Statistics Dataset",
        "slug": "datasnaek/youtube-new",
        "fallback": "advaypatil/youtube-statistics",
        "dest": f"{BASE}/module2",
        "modules": "Module 2"
    },
    {
        "name": "Instagram Influencer Dataset",
        "slug": "surajjha3006/instagram-influencers",
        "fallback": "ramjasmaurya/top-1000-instagramers",
        "dest": f"{BASE}/module2_module4",
        "modules": "Module 2 + Module 4"
    },
    {
        "name": "Digital Products Sales",
        "slug": "shreyanshverma31/online-sales-dataset-popular-marketplace-data",
        "fallback": "thedevastator/unlock-profits-with-e-commerce-sales-data",
        "dest": f"{BASE}/module1",
        "modules": "Module 1"
    },
    {
        "name": "Influencer Marketing & ROI",
        "slug": "thedevastator/influencer-marketing-brand-deals-data",
        "fallback": "kambojharyana/influencermarketingdata",
        "dest": f"{BASE}/module3_module4",
        "modules": "Module 3 + Module 4"
    },
    {
        "name": "TikTok Creator Analytics",
        "slug": "erikaaldisa/tiktok-dataset",
        "fallback": "yakhyojon/tiktok-dataset",
        "dest": f"{BASE}/module2_module4",
        "modules": "Module 2 + Module 4"
    },
    {
        "name": "Social Media Engagement Dataset",
        "slug": "ashaychoudhary60/social-media-engagment-dataset",
        "fallback": "atharvaingle/social-media-data",
        "dest": f"{BASE}/module3",
        "modules": "Module 3"
    },
]

print("=" * 60)
print("CreatorIQ Dataset Downloader")
print("=" * 60)

results = []
for ds in datasets:
    print(f"\n[DOWNLOADING] {ds['name']}")
    print(f"  -> Destination: {ds['dest']}")
    success = False
    for slug in [ds["slug"], ds.get("fallback", "")]:
        if not slug:
            continue
        try:
            api.dataset_download_files(slug, path=ds["dest"], unzip=True, quiet=False)
            print(f"  [OK] Downloaded using: {slug}")
            results.append({"name": ds["name"], "status": "OK", "slug": slug, "dest": ds["dest"]})
            success = True
            break
        except Exception as e:
            print(f"  [FAIL] {slug}: {str(e)[:80]}")
    if not success:
        results.append({"name": ds["name"], "status": "FAILED", "slug": ds["slug"], "dest": ds["dest"]})

print("\n" + "=" * 60)
print("DOWNLOAD SUMMARY")
print("=" * 60)
for r in results:
    status = "[OK]  " if r["status"] == "OK" else "[FAIL]"
    print(f"{status} {r['name']}")
    if r["status"] == "OK":
        print(f"       -> {r['dest']}")

failed = [r for r in results if r["status"] == "FAILED"]
if failed:
    print(f"\n{len(failed)} dataset(s) failed. Check slugs or try manually.")
else:
    print(f"\nAll {len(results)} datasets downloaded successfully!")
