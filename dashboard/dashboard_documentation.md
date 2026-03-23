# CreatorIQ — Dashboard Documentation
## Tableau Public Dashboard: AI-Powered Creator Monetization Platform

**Tool:** Tableau Public (Web Authoring)
**Published URL:** https://public.tableau.com/authoring/CreatorIQ-AI-PoweredCreatorMonetizationPlatform/CreatorIQDashboard
**Data Source:** `creator_overview.csv` (processed synthetic dataset)
**Created:** March 2026

---

## Dashboard Pages

### Page 1 — Creator Economy Overview
- **Chart:** Niche vs Monthly Revenue USD (horizontal bar, sorted descending)
- **Insight:** Food & Cooking leads with $400K+ monthly revenue; Business & Entrepreneurship close second

### Page 2 — Audience Health & Churn Risk
- **Chart:** Risk Level vs AVG Health Score (horizontal bar, sorted ascending)
- **Insight:** Critical tier averages 39.30 health score; Safe tier at 77.40

### Page 3 — Content Revenue Attribution
- **Chart:** Niche vs Total Content Revenue (bar with labels)
- **Insight:** Business & Entrepreneurship generates $2.8M+ total content revenue

### Page 4 — Brand Deal Intelligence
- **Chart:** Niche vs AVG Offer Gap % (negative bars showing below-market offers)
- **Insight:** All niches receive offers 40-46% below market; Gaming & Esports worst at -45.65%

---

## Data Pipeline
```
generate_synthetic.py → raw CSV files → prepare_dashboard_data.py → processed CSVs → Tableau
```
