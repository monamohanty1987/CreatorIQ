# CreatorIQ — Complete Setup Guide

**Status**: Production-Ready MVP
**Created**: 2026-03-19
**All components included**: Backend ✅ | Frontend ✅ | RAG System ✅ | n8n Integration ✅

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Python 3.9+
- Node.js 18+
- n8n running locally on http://localhost:5678
- 2 terminals open

---

## Step 1: Setup Environment Variables

Copy `.env` file and configure:

```bash
cd C:\CreatorIQ Project
# Edit .env with your API keys
```

**Required:** `.env`
```
ANTHROPIC_API_KEY=sk-ant-xxx...
N8N_WEBHOOK_BASE=http://localhost:5678
FRONTEND_URL=http://localhost:3000
DATABASE_URL=sqlite:///./creatoriq.db
CHROMADB_PATH=./rag_system/chromadb
```

**Note:** Get `ANTHROPIC_API_KEY` from https://console.anthropic.com

---

## Step 2: Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd C:\CreatorIQ Project\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python app.py
```

**Expected output:**
```
======================================================
🚀 CreatorIQ API Starting Up
======================================================
✅ Database initialized
✅ RAG knowledge base initialized
✅ Claude API key configured
✅ CreatorIQ API ready to serve requests
======================================================
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Verify:** Open http://localhost:8000/health in browser → Should show status: healthy

---

## Step 3: Frontend Setup (Terminal 2)

```bash
# Navigate to frontend
cd C:\CreatorIQ Project\frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected output:**
```
VITE v5.0.0  ready in 345 ms

➜  Local:   http://127.0.0.1:3000/
➜  press h to show help
```

**Verify:** Open http://localhost:3000 in browser → Should see CreatorIQ home page

---

## Step 4: Verify n8n Workflows

Open http://localhost:5678 and check:
- ✅ `workflow.json` (O4 Brand Deal Rate Checker)
- ✅ `workflow_O1_product_launch_sequence.json` (Campaign Generator)
- ✅ `workflow_O3_contract_analysis.json` (Contract Analyzer)
- ✅ `workflow_O5_checkout_recovery.json` (not in MVP)
- ✅ `workflow_O2_audience_health_alert.json` (not in MVP)

All should show **Active: OFF** (triggers via webhook, not schedule).

---

## 🧪 Testing the System

### Test 1: Brand Deal Analyzer (O4)

1. Go to http://localhost:3000 → **"Brand Deal Analyzer"**
2. Fill form:
   - Your Name: `TestCreator`
   - Niche: `Fitness`
   - Platform: `Instagram`
   - Followers: `50000`
   - Offered Rate: `3000`
   - Format: `Post`
3. Click **"Analyze Deal"**
4. Should see:
   - ✅ Market rate comparison
   - ✅ Gap analysis
   - ✅ Counter-offer
   - ✅ Negotiation talking points

**Data flow:**
React Form → FastAPI (:8000) → n8n Webhook → n8n Code Node → FastAPI → SQLite → React Result

---

### Test 2: Contract Analyzer (O3 + RAG)

1. Go to http://localhost:3000 → **"Contract Analyzer"**
2. Fill form:
   - Your Name: `TestCreator`
   - Brand Name: `TestBrand`
   - Niche: `Fitness`
   - Deal Value: `5000`
   - Contract Text: Paste this sample:
     ```
     BRAND COLLABORATION AGREEMENT

     1. EXCLUSIVITY
     Creator agrees to exclusive relationship. No similar brands for 12 months.

     2. PERPETUAL LICENSE
     Brand receives perpetual, worldwide license to use content.

     3. UNLIMITED REVISIONS
     Creator will revise content until Brand is satisfied.
     ```
3. Click **"Analyze Contract"**
4. Should see:
   - ✅ Health score (should be LOW due to bad clauses)
   - ✅ Red flags detected (perpetual license, exclusivity, etc.)
   - ✅ FTC compliance check
   - ✅ Claude AI analysis (if API key configured)
   - ✅ Recommendations

**Data flow:**
React Form → FastAPI → RAG Search (ChromaDB) → Claude API → n8n Webhook → FastAPI → SQLite → React Result

---

### Test 3: Campaign Generator (O1)

1. Go to http://localhost:3000 → **"Campaign Generator"**
2. Fill form:
   - Your Name: `TestCreator`
   - Product Name: `Fitness Masterclass`
   - Product Price: `97`
   - Product Type: `Course`
   - Niche: `Fitness`
   - Subscribers: `10000`
3. Click **"Generate 5-Email Sequence"**
4. Should see:
   - ✅ 5 email subjects (Day 0, 2, 6, 13, 29)
   - ✅ Value metrics (10 hours saved)
   - ✅ Early bird pricing

**Data flow:**
React Form → FastAPI → n8n Webhook → n8n Code Node (generates 5 emails) → FastAPI → SQLite → React Result

---

## 🗄️ Database Location

SQLite database created automatically at:
```
C:\CreatorIQ Project\backend\creatoriq.db
```

View data with SQLite browser or Python:
```python
import sqlite3
conn = sqlite3.connect('backend/creatoriq.db')
cursor = conn.cursor()

# View deals
cursor.execute("SELECT * FROM deals;")
for row in cursor.fetchall():
    print(row)
```

---

## 📊 RAG System (ChromaDB)

Automatically initializes on first backend startup with:
- ✅ FTC Endorsement Guides (from `ftc_guidelines.md`)
- ✅ Sample Contract Templates (from `sample_contracts.md`)
- ✅ Red Flag Library (from `red_flags.md`)

Location: `C:\CreatorIQ Project\rag_system\chromadb\`

To re-initialize (clear and rebuild):
```bash
rm -rf rag_system/chromadb
# Restart backend
python app.py
```

---

## 🔌 API Endpoints Reference

### Deals (O4)
```bash
POST /api/deals/analyze
{
  "creator_name": "Sarah",
  "niche": "fitness",
  "platform": "instagram",
  "followers": 50000,
  "offered_rate_usd": 3000,
  "format": "post"
}

Response: { deal_id, verdict, market_rate, gap_usd, counter_offer, talking_points }
```

### Contracts (O3)
```bash
POST /api/contracts/analyze
{
  "creator_name": "Sarah",
  "brand_name": "FitnessCo",
  "contract_text": "...",
  "creator_niche": "fitness",
  "deal_value": 5000
}

Response: { contract_id, verdict, health_score, red_flags[], recommendations[] }
```

### Campaigns (O1)
```bash
POST /api/campaigns/generate
{
  "creator_name": "Sarah",
  "product_name": "Fitness Masterclass",
  "product_price": 97,
  "product_type": "course",
  "creator_niche": "fitness",
  "subscriber_count": 10000
}

Response: { campaign_id, emails_queued, email_subjects[], value_metrics }
```

### History
```bash
GET /api/history?creator_name=Sarah

Response: {
  "deals": [...],
  "contracts": [...],
  "campaigns": [...],
  "summary": { total_deals_analyzed, total_contracts_reviewed, total_campaigns_created }
}
```

---

## 🐛 Troubleshooting

### Backend Issues

**Error: "ANTHROPIC_API_KEY not set"**
- Add API key to `.env` file
- Restart backend: `python app.py`

**Error: "Connection refused" (n8n webhook)**
- Ensure n8n is running on http://localhost:5678
- Check firewall allows localhost connections

**Error: "Database locked"**
- Close any other database viewers
- Delete `backend/creatoriq.db` and restart

### Frontend Issues

**Error: "API is offline"**
- Ensure backend is running: http://localhost:8000/health
- Check CORS is enabled (should be in `app.py`)

**Blank page or 404**
- Run `npm install` in frontend folder
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server: `npm run dev`

### n8n Issues

**Workflows not running**
- Check n8n is active: http://localhost:5678
- Ensure workflows are ACTIVATED (toggle on in each workflow)
- Check webhook paths match: `/webhook/brand-deal-check`, `/webhook/analyse-contract`, `/webhook/product-launch`

---

## 📈 Performance Tips

1. **Database Optimization**
   - For production, switch from SQLite to PostgreSQL
   - Update `.env`: `DATABASE_URL=postgresql://user:pass@localhost/creatoriq`

2. **RAG Optimization**
   - Add more documents to `rag_system/knowledge_base/` to improve search quality
   - Update embeddings model in `config.py` if needed

3. **API Rate Limiting**
   - Add rate limiting middleware to `app.py` for production
   - Use Redis for distributed caching

---

## 🚀 Deployment (Production)

### Docker Deployment

Create `Dockerfile` for backend:
```dockerfile
FROM python:3.11
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend .
CMD ["python", "app.py"]
```

Create `Dockerfile` for frontend:
```dockerfile
FROM node:18
WORKDIR /app
COPY frontend/package.json .
RUN npm install
COPY frontend .
RUN npm run build
CMD ["npm", "run", "preview"]
```

Run with Docker Compose:
```bash
docker-compose up -d
```

### Cloud Deployment Options

- **Backend**: Deploy FastAPI to Heroku, Railway, or Render
- **Frontend**: Deploy React to Vercel, Netlify, or AWS S3
- **Database**: PostgreSQL on AWS RDS or Supabase
- **RAG**: ChromaDB on persistent storage

---

## 📚 Additional Resources

- **FastAPI Docs**: http://localhost:8000/docs (automatic Swagger UI)
- **n8n Docs**: https://docs.n8n.io
- **Claude API**: https://docs.anthropic.com
- **ChromaDB Docs**: https://docs.trychroma.com

---

## ✅ Checklist for Production

- [ ] ANTHROPIC_API_KEY configured in `.env`
- [ ] n8n workflows all active and tested
- [ ] SQLite database created and initialized
- [ ] RAG knowledge base loaded (FTC guides + sample contracts)
- [ ] All 3 endpoints tested (deals, contracts, campaigns)
- [ ] Frontend connects to backend (no CORS errors)
- [ ] Historical data saving to database
- [ ] Error handling working (try with missing fields)
- [ ] Rate limiting configured (optional)
- [ ] Monitoring/logging set up (optional)

---

## 💬 Support

For issues, check:
1. Terminal logs for errors
2. Backend health: http://localhost:8000/health
3. n8n workflow logs: http://localhost:5678
4. Browser console (F12) for frontend errors
5. SQLite database for data persistence

---

**You're all set! Happy creator monetizing! 🚀**
