# CreatorIQ — Full-Stack Architecture

**Status**: MVP (Minimum Viable Product) - Local Development
**Created**: 2026-03-19
**Tech Stack**: React + FastAPI + SQLite + ChromaDB + n8n

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│            http://localhost:3000                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ • Brand Deal Analyzer                                │  │
│  │ • Contract Analyzer (RAG + Red-flags)                │  │
│  │ • Product Launch Email Generator                     │  │
│  │ • Analysis History & Results                         │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ fetch() API calls
                             ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (FastAPI) on :8000                     │
│            http://localhost:8000                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /api/deals/analyze          (O4 workflow)            │  │
│  │ /api/contracts/analyze      (O3 + RAG)              │  │
│  │ /api/campaigns/generate     (O1 workflow)            │  │
│  │ /api/history                (Query DB)               │  │
│  │ /api/health                 (Status check)           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────┬───────────────────────────┬────────────────┘
                 │                           │
                 ↓                           ↓
        ┌─────────────────┐        ┌──────────────────┐
        │   n8n Webhooks  │        │  Claude API      │
        │  :5678/webhook  │        │  (Claude 3.5)    │
        │                 │        │                  │
        │ • /brand-deal   │        │ • Contract       │
        │ • /analyse-     │        │   analysis       │
        │   contract      │        │ • Insights gen   │
        │ • /product-     │        │                  │
        │   launch        │        └──────────────────┘
        └─────────────────┘
                 ↑
                 │
        ┌─────────────────┐        ┌──────────────────┐
        │ SQLite Database │        │  ChromaDB + RAG  │
        │                 │        │                  │
        │ • Deals         │        │ • FTC Docs       │
        │ • Contracts     │        │ • Sample Terms   │
        │ • Campaigns     │        │ • Red-flag lib   │
        │ • History       │        │ • Embeddings     │
        └─────────────────┘        └──────────────────┘
```

---

## 📁 Project Structure

```
C:\CreatorIQ Project\
├── frontend/                          # React web app
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DealAnalyzer.jsx
│   │   │   ├── ContractAnalyzer.jsx
│   │   │   ├── CampaignGenerator.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   └── Navigation.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── History.jsx
│   │   ├── services/
│   │   │   └── api.js              # Fetch calls to FastAPI
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # FastAPI server
│   ├── app.py                        # Main FastAPI app
│   ├── config.py                     # Settings (DB, RAG, API keys)
│   ├── database.py                   # SQLAlchemy setup
│   ├── models.py                     # Database models
│   ├── routes/
│   │   ├── deals.py                 # /api/deals endpoints
│   │   ├── contracts.py             # /api/contracts endpoints
│   │   ├── campaigns.py             # /api/campaigns endpoints
│   │   └── history.py               # /api/history endpoints
│   ├── services/
│   │   ├── n8n_client.py            # n8n webhook orchestration
│   │   ├── rag_service.py           # ChromaDB + RAG logic
│   │   └── claude_service.py        # Claude API calls
│   ├── rag/
│   │   ├── ftc_guidelines.txt       # FTC docs for embedding
│   │   └── sample_contracts.txt     # Sample contract templates
│   └── requirements.txt
│
├── rag_system/                        # Separate RAG setup
│   ├── embeddings.py                 # HuggingFace embeddings
│   ├── chromadb_setup.py            # Initialize ChromaDB
│   └── knowledge_base/
│       └── ftc_guidelines.md        # FTC endorsement guide
│
├── n8n/                              # n8n workflows (already created)
│   ├── workflow.json
│   ├── workflow_O1_product_launch_sequence.json
│   ├── workflow_O3_contract_analysis.json
│   ├── workflow_O4_brand_deal_checker.json
│   └── workflow_documentation.md
│
├── data/                             # Data scripts
├── research/                         # Research docs
├── cost_estimation/                  # ROI analysis
├── requirements.txt                  # Python deps (root)
├── .env                              # Environment variables
├── ARCHITECTURE.md                   # This file
├── SETUP.md                          # Setup instructions
└── README.md                         # Project overview
```

---

## 🔌 Integration Flow

### **1. Brand Deal Analyzer (O4)**
```
User submits deal in React form
    ↓
FastAPI receives POST /api/deals/analyze
    ↓
FastAPI calls n8n webhook: POST http://localhost:5678/webhook/brand-deal-check
    ↓
n8n runs: Market Rate Benchmark (code node)
    ↓
n8n returns JSON: {market_rate, gap_pct, verdict, counter_offer}
    ↓
FastAPI saves to SQLite + returns to React
    ↓
React displays: Rate comparison, counter-offer, talking points
```

### **2. Contract Analyzer (O3 + RAG)**
```
User uploads contract in React
    ↓
FastAPI receives POST /api/contracts/analyze
    ↓
FastAPI extracts text from contract
    ↓
RAG Service:
  1. Embed contract text (HuggingFace)
  2. Query ChromaDB: "Retrieve similar past contracts + red-flag patterns"
  3. Get top-3 retrieved documents from knowledge base
    ↓
FastAPI calls Claude API with context:
  {contract_text, retrieved_ftc_docs, red_flag_patterns}
    ↓
Claude analyzes: "Red flags detected: [list], FTC compliance: [status]"
    ↓
FastAPI also calls n8n webhook: POST http://localhost:5678/webhook/analyse-contract
    ↓
FastAPI saves analysis to SQLite + returns to React
    ↓
React displays: Health score, red flags, recommendations, FTC compliance
```

### **3. Campaign Generator (O1)**
```
User submits product details in React form
    ↓
FastAPI receives POST /api/campaigns/generate
    ↓
FastAPI calls n8n webhook: POST http://localhost:5678/webhook/product-launch
    ↓
n8n generates: 5-email sequence with subjects, content, send days
    ↓
n8n returns JSON: [{email_1}, {email_2}, ..., {email_5}]
    ↓
FastAPI saves campaign to SQLite + returns to React
    ↓
React displays: Email 1-5 with preview, send schedule, value metrics (10 hrs saved)
```

---

## 🗄️ Database Schema (SQLite)

### `deals` table
```sql
CREATE TABLE deals (
  id INTEGER PRIMARY KEY,
  creator_name TEXT,
  niche TEXT,
  platform TEXT,
  followers INTEGER,
  offered_rate REAL,
  market_rate REAL,
  gap_usd REAL,
  verdict TEXT,          -- "BELOW_MARKET", "AT_OR_ABOVE_MARKET"
  counter_offer REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `contracts` table
```sql
CREATE TABLE contracts (
  id INTEGER PRIMARY KEY,
  creator_name TEXT,
  brand_name TEXT,
  contract_text TEXT,
  health_score REAL,
  verdict TEXT,          -- "PASS", "NEGOTIATE", "REJECT"
  red_flags_count INTEGER,
  ftc_compliance TEXT,   -- "COMPLIANT", "NEEDS_REVIEW"
  analysis_json TEXT,    -- Full JSON result
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `campaigns` table
```sql
CREATE TABLE campaigns (
  id INTEGER PRIMARY KEY,
  creator_name TEXT,
  product_name TEXT,
  product_price REAL,
  email_1_subject TEXT,
  email_2_subject TEXT,
  email_3_subject TEXT,
  email_4_subject TEXT,
  email_5_subject TEXT,
  emails_json TEXT,      -- Full 5-email sequence
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎯 RAG Knowledge Base

**Free, no-subscription setup using:**
- **ChromaDB**: Local vector database (embedded in backend)
- **HuggingFace Embeddings**: Free sentence-transformers model
- **FTC Guidelines**: Public domain text from FTC.gov

**Embedded documents:**
1. FTC Endorsement Guides (16 CFR § 255)
2. Creator contract template (anonymized)
3. Red-flag clause library (from research/)

---

## 🚀 Running the System Locally

### Terminal 1: FastAPI Backend
```bash
cd C:\CreatorIQ Project\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Server runs on http://localhost:8000
```

### Terminal 2: React Frontend
```bash
cd C:\CreatorIQ Project\frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

### Terminal 3: n8n (already running)
```
http://localhost:5678
```

---

## 🔐 Environment Variables (.env)

```
ANTHROPIC_API_KEY=your_key_here
N8N_WEBHOOK_BASE=http://localhost:5678
FRONTEND_URL=http://localhost:3000
DATABASE_URL=sqlite:///./creatoriq.db
CHROMADB_PATH=./rag_system/chromadb
```

---

## ✅ MVP Checklist

- [ ] React frontend (3 main pages)
- [ ] FastAPI backend with CORS
- [ ] SQLite database + SQLAlchemy models
- [ ] ChromaDB RAG system initialized
- [ ] FTC guidelines embedded
- [ ] n8n webhook integration (O1, O3, O4)
- [ ] Claude API integration for contract analysis
- [ ] History page to display past analyses
- [ ] Error handling & validation
- [ ] Local HTTPS setup (optional)
- [ ] README with setup instructions

---

## 📊 Tech Stack Summary

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend | React 18 + Vite | Fast, modern, component-based |
| Backend | FastAPI + Uvicorn | Fast, async, built-in docs |
| Database | SQLite + SQLAlchemy | Zero setup, file-based, scalable to Postgres |
| RAG | ChromaDB + HuggingFace | Free, no API keys needed, local |
| Embeddings | sentence-transformers | Free, open-source, good quality |
| API Orchestration | n8n webhooks | Already set up, reliable |
| LLM Integration | Claude 3.5 Sonnet | Via Anthropic API |
| Styling | Tailwind CSS | Fast, utility-first, professional |

---

## 🎓 Next Steps

1. Create FastAPI backend structure
2. Create React frontend with components
3. Initialize ChromaDB with FTC guidelines
4. Set up database models
5. Create API routes (deals, contracts, campaigns)
6. Integrate n8n webhooks
7. Integrate Claude API
8. Create SETUP.md for easy onboarding
