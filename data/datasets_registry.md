# CreatorIQ — Dataset Registry
## All Data Sources for the Project

---

## MODULE 1 — Content E-Commerce AI

### Dataset 1 — Gumroad Products & Reviews
| Field | Detail |
|-------|--------|
| **Name** | Gumroad Products & Reviews Dataset |
| **Source** | Kaggle |
| **URL** | https://www.kaggle.com/datasets/muhammetakkurt/gumroad-products-and-reviews-dataset |
| **Size** | 6.7 MB (2 CSV files) |
| **Files** | dataset_gumroad_products.csv, dataset_gumroad_reviews.csv |
| **Key Columns** | Product name, price, category, seller info, ratings, reviews |
| **License** | CC BY-NC 4.0 |
| **Use** | Training E-Commerce AI to predict digital product pricing |

### Dataset 2 — Etsy Shops Sales Data
| Field | Detail |
|-------|--------|
| **Name** | 1M+ Etsy Shops Sales Data |
| **Source** | Kaggle |
| **URL** | https://www.kaggle.com/datasets/polartech/1m-etsy-shops-sales-data |
| **Key Columns** | Shop name, product category, sales volume, pricing |
| **Use** | Supplement e-commerce pricing intelligence |

### Dataset 3 — E-Commerce Sales Dataset
| Field | Detail |
|-------|--------|
| **Name** | E-Commerce Sales Dataset |
| **Source** | Kaggle |
| **URL** | https://www.kaggle.com/datasets/thedevastator/unlock-profits-with-e-commerce-sales-data |
| **Use** | Product conversion rate benchmarks |

---

## MODULE 2 — Audience Health & Churn Predictor

### Dataset 4 — Social Media Sponsorship & Engagement (PRIMARY)
| Field | Detail |
|-------|--------|
| **Name** | Social Media Sponsorship & Engagement Dataset |
| **Source** | Kaggle |
| **URL** | https://www.kaggle.com/datasets/omenkj/social-media-sponsorship-and-engagement-dataset |
| **Size** | 8.05 MB / 52,000+ rows |
| **Platforms** | YouTube, TikTok, Instagram, Bilibili, RedNote |
| **Key Columns** | creator_id, follower_count, views, likes, shares, comments_count, is_sponsored, sponsor_name, audience_age_distribution, audience_gender_distribution, post_date |
| **Creators** | 5,000 distinct creators |
| **Time Span** | 2 years of data |
| **License** | Check on Kaggle |
| **Use** | PRIMARY dataset for audience health scoring and churn prediction |

### Dataset 5 — 2024 YouTube Channels (1 Million)
| Field | Detail |
|-------|--------|
| **Name** | 2024 Youtube Channels (1 Million) |
| **Source** | Kaggle |
| **URL** | https://www.kaggle.com/datasets/asaniczka/2024-youtube-channels-1-million |
| **Size** | 382 MB / 1,000,000+ channels |
| **Key Columns** | Subscriber counts, total views, total videos, engagement statistics |
| **License** | ODC Attribution License (ODC-By) |
| **Use** | Audience growth/decline trend analysis, churn benchmarks |

### Dataset 6 — Global YouTube Statistics 2023
| Field | Detail |
|-------|--------|
| **Name** | Global YouTube Statistics 2023 |
| **Source** | Kaggle |
| **URL** | https://www.kaggle.com/datasets/nelgiriyewithana/global-youtube-statistics-2023 |
| **Use** | Channel category benchmarks, subscriber growth patterns |

### Dataset 7 — YouTube Video and Channel Analytics
| Field | Detail |
|-------|--------|
| **Name** | YouTube Video and Channel Analytics |
| **Source** | Kaggle |
| **URL** | https://www.kaggle.com/datasets/thedevastator/youtube-video-and-channel-analytics |
| **Use** | Video-level engagement patterns for content-health correlation |

---

## MODULE 3 — Content-To-Commerce Converter

### Dataset 8 — Influencer Marketing ROI Dataset
| Field | Detail |
|-------|--------|
| **Name** | Influencer Marketing ROI Dataset |
| **Source** | Kaggle |
| **URL** | https://www.kaggle.com/datasets/tfisthis/influencer-marketing-roi-dataset |
| **Use** | Map content type to conversion/ROI outcomes |

### Dataset 9 — Social Media Engagement Dataset
| Field | Detail |
|-------|--------|
| **Name** | Social Media Engagement Dataset |
| **Source** | Kaggle |
| **URL** | https://www.kaggle.com/datasets/subashmaster0411/social-media-engagement-dataset |
| **Use** | Platform-level engagement benchmarks by content type |

---

## MODULE 4 — Brand Deal Intelligence

### Dataset 10 — Social Media Sponsorship & Engagement (SHARED)
| Field | Detail |
|-------|--------|
| **Name** | Social Media Sponsorship & Engagement Dataset |
| **Source** | Kaggle |
| **URL** | https://www.kaggle.com/datasets/omenkj/social-media-sponsorship-and-engagement-dataset |
| **Key Columns for Brand Deals** | is_sponsored, sponsor_name, sponsor_category, disclosure_type, disclosure_location |
| **Use** | Brand deal pattern analysis, disclosure compliance checking |

### Dataset 11 — Top 100 Social Media Influencers 2024
| Field | Detail |
|-------|--------|
| **Name** | Top 100 Social Media Influencers 2024 Countrywise |
| **Source** | Kaggle |
| **URL** | https://www.kaggle.com/datasets/bhavyadhingra00020/top-100-social-media-influencers-2024-countrywise |
| **Use** | Market rate benchmarks for brand deal pricing by follower tier |

---

## RAG KNOWLEDGE BASE — Documents for AI Agents

| Document | URL | Module |
|----------|-----|--------|
| FTC Endorsement Guides | https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking | Brand Deal Intelligence |
| FTC Disclosures 101 | https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers | Brand Deal Intelligence |
| YouTube Partner Program Policies | https://support.google.com/youtube/answer/72851 | Content-Commerce |
| Instagram Branded Content | https://help.instagram.com/116947042301556 | Brand Deal Intelligence |
| Creator Economy Market Report (MBO) | https://www.mbopartners.com/state-of-independence/creator-economy-report/ | Sector Research |

---

## SYNTHETIC DATA — Generated with Python Faker

| File | Content | Module |
|------|---------|--------|
| creators.csv | 50 fictional creator profiles (name, niche, platform, followers, engagement rate) | All |
| content_history.csv | 6 months of content posts per creator (type, views, saves, clicks) | Modules 2 & 3 |
| brand_deals.csv | Brand deal history (offer, market rate, final deal, contract flags) | Module 4 |
| product_sales.csv | Digital product sales history per creator | Module 1 |
| audience_metrics.csv | Weekly audience health scores, engagement signals | Module 2 |

---

## DOWNLOAD PRIORITY ORDER

```
Priority 1 (Download first — used across multiple modules):
  Dataset 4 — Social Media Sponsorship & Engagement (Kaggle)

Priority 2 (Audience Health — Module 2):
  Dataset 5 — 2024 YouTube Channels 1M (Kaggle)
  Dataset 6 — Global YouTube Statistics (Kaggle)

Priority 3 (E-Commerce — Module 1):
  Dataset 1 — Gumroad Products & Reviews (Kaggle)

Priority 4 (Brand Deals — Module 4):
  Dataset 11 — Top 100 Influencers 2024 (Kaggle)

Priority 5 (Generate synthetic data):
  Run: python generate_synthetic_data.py
```

---

*Registry created: March 2026 | All datasets verified as free and publicly accessible*
