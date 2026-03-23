# 🚀 CreatorIQ — AI-Powered Creator Monetization Platform

**Full-stack production-ready application for optimizing creator earnings through data-driven deal analysis, contract review, and campaign automation.**

---

## 📊 What CreatorIQ Does

### 1. **Brand Deal Analyzer (O4)**
Analyzes brand sponsorship offers against real market data:
- Benchmarks against 52,000+ creator deals
- Identifies underpriced offers instantly
- Suggests counter-offer price
- Provides negotiation talking points

**Example**: "This $3,000 offer is 12% below market rate for your tier. Counter at $3,850."

### 2. **Contract Analyzer (O3)**
Red-flag detection + FTC compliance check:
- Scans for dangerous contract clauses
- RAG-powered similar contract retrieval
- Claude AI deep analysis
- FTC endorsement guideline compliance

**Red flags detected**:
- Perpetual content licenses
- Overly broad exclusivity clauses
- Unlimited revision requests
- Non-disparagement restrictions

### 3. **Campaign Generator (O1)**
Auto-generates 5-email product launch sequences:
- Day 0: Launch announcement + early bird
- Day 2: Social proof from early adopters
- Day 6: Value deep-dive breakdown
- Day 13: Transformation/results stories
- Day 29: Final 24-hour close

**Saves 10+ hours** of email copywriting per launch.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  React Web Application (http://localhost:3000)  │
│  • Beautiful, responsive UI                     │
│  • Real-time analysis results                   │
│  • Historical data dashboard                    │
└──────────────────┬──────────────────────────────┘
                   │ API calls
                   ↓
┌──────────────────────────────────────────────────┐
│  FastAPI Backend (http://localhost:8000)        │
│  • RESTful API endpoints                        │
│  • n8n workflow orchestration                   │
│  • SQLite database persistence                  │
│  • RAG service integration                      │
│  • Claude API integration                       │
└──────┬─────────────────────────────────────────┘
       │
       ├─→ n8n Workflows (:5678)
       │   • O4: Market rate benchmark
       │   • O3: Contract analysis
       │   • O1: Campaign generation
       │
       ├─→ ChromaDB + RAG
       │   • FTC endorsement guides
       │   • Sample contracts
       │   • Red-flag library
       │
       ├─→ Claude API
       │   • Contract deep analysis
       │   • Insights generation
       │
       └─→ SQLite Database
           • Deal history
           • Contract records
           • Campaign archives
```

---

## 📁 Project Structure

```
C:\CreatorIQ Project\
├── frontend/                    # React web application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── DealAnalyzer.jsx
│   │   │   ├── ContractAnalyzer.jsx
│   │   │   ├── CampaignGenerator.jsx
│   │   │   └── Navigation.jsx
│   │   ├── pages/              # Pages
│   │   │   ├── Dashboard.jsx
│   │   │   └── History.jsx
│   │   ├── services/
│   │   │   └── api.js          # FastAPI client
│   │   ├── App.jsx
│   │   └── App.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # FastAPI server
│   ├── app.py                  # Main FastAPI app
│   ├── config.py               # Settings
│   ├── database.py             # SQLAlchemy setup
│   ├── models.py               # Database models
│   ├── services/
│   │   ├── n8n_client.py       # n8n orchestration
│   │   ├── rag_service.py      # ChromaDB integration
│   │   └── claude_service.py   # Claude API client
│   └── requirements.txt        # Python dependencies
│
├── rag_system/                  # RAG knowledge base
│   └── knowledge_base/
│       ├── ftc_guidelines.md   # FTC compliance docs
│       ├── sample_contracts.md # Contract templates
│       └── red_flags.md        # Red-flag library
│
├── n8n/                         # n8n workflows (JSON exports)
│   ├── workflow.json
│   ├── workflow_O1_product_launch_sequence.json
│   ├── workflow_O3_contract_analysis.json
│   └── workflow_documentation.md
│
├── data/                        # Data processing
├── research/                    # Research documents
├── cost_estimation/             # ROI analysis
├── .env                         # Environment variables
├── ARCHITECTURE.md              # System design
├── SETUP.md                     # Installation guide
└── README.md                    # This file
```

---

## 🌐 Live Application

| Service | URL | Status |
|---------|-----|--------|
| **React Web App** | http://localhost:3000 | ✅ Live |
| **Market Dashboard** | http://localhost:8765/CreatorIQ_Dashboard.html | ✅ Live |
| **FastAPI Backend** | http://localhost:8000 | ✅ Live |
| **API Docs (Swagger)** | http://localhost:8000/docs | ✅ Live |
| **n8n Workflows** | http://localhost:5678 | ✅ Live |

---

## ⚡ Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker (for n8n)
- Anthropic API key → https://console.anthropic.com
- OpenAI API key → https://platform.openai.com

### 1. Configure Environment
```bash
cd "C:\CreatorIQ Project"
cp .env.example .env
# Open .env and fill in: ANTHROPIC_API_KEY, OPENAI_API_KEY, LANGCHAIN_API_KEY
```

### 2. Start n8n (Docker)
```bash
docker run -d --name n8n -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
# Open http://localhost:5678 and import n8n/workflow.json
```

### 3. Start Backend (Terminal 1)
```bash
cd "C:\CreatorIQ Project\backend"
pip install -r requirements.txt
python app.py
# Backend running at http://localhost:8000
```

### 4. Start Website / Frontend (Terminal 2)
```bash
cd "C:\CreatorIQ Project\frontend"
npm install
npm run dev
# Website running at http://localhost:3000
```

### 5. View Market Dashboard
```bash
cd "C:\CreatorIQ Project\dashboard"
python -m http.server 8765
# Open http://localhost:8765/CreatorIQ_Dashboard.html
```

✅ All services running. Open http://localhost:3000 to use the platform.

---

## 📁 Project Structure

```
C:\CreatorIQ Project\
├── frontend/                    # React web application (localhost:3000)
│   ├── src/
│   │   ├── components/          # Layout, Sidebar, shared UI
│   │   ├── pages/               # DashboardHome, History
│   │   └── services/api.js      # FastAPI client
│   └── package.json
│
├── backend/                     # FastAPI server (localhost:8000)
│   ├── app.py                   # All API endpoints
│   ├── config.py                # Settings from .env
│   ├── database.py              # SQLAlchemy + SQLite setup
│   ├── models.py                # Deal, Contract, Campaign models
│   ├── services/
│   │   ├── n8n_client.py        # n8n webhook calls + fallback
│   │   ├── deal_benchmark.py    # Local 52K-deal benchmark engine
│   │   ├── rag_service.py       # ChromaDB vector search
│   │   ├── claude_service.py    # Anthropic Claude API
│   │   └── langsmith_service.py # LangSmith tracing
│   └── requirements.txt
│
├── dashboard/                   # Market Intelligence Dashboard
│   ├── CreatorIQ_Dashboard.html # Live Plotly dashboard (localhost:8765)
│   ├── build_dashboard.py       # Regenerate dashboard from data
│   └── dashboard_documentation.md
│
├── n8n/                         # AI Workflow definitions
│   ├── workflow.json            # O4 Brand Deal Checker (LIVE)
│   ├── workflow_O1_*.json       # Campaign Generator
│   ├── workflow_O3_*.json       # Contract Analyzer
│   └── workflow_documentation.md
│
├── data/
│   ├── processed/               # brand_deal_intelligence.csv (52K deals)
│   └── raw/                     # Original Kaggle dataset
│
├── evaluation/                  # LLM-as-judge evaluation
│   ├── evaluation_report.md     # Full evaluation with bias discussion
│   └── evaluation_results.json  # Scores for 8 insights
│
├── langsmith/                   # LangSmith tracing
│   ├── langsmith_evaluation.md  # Dataset + experiment documentation
│   └── monitoring_results/      # Local trace JSON files
│
├── rag_system/                  # ChromaDB knowledge base
│   └── knowledge_base/          # FTC guides, contract templates
│
├── research/                    # Market research documents
├── cost_estimation/             # ROI and cost analysis
├── .env.example                 # Environment template (copy to .env)
├── project_documentation.md    # Complete technical documentation
├── README.md                    # This file
└── SETUP.md                     # Detailed setup guide
```

---

## 🧪 Running Evaluations

```bash
# View evaluation report
cat "evaluation/evaluation_report.md"

# View raw scores
cat "evaluation/evaluation_results.json"

# View LangSmith traces (local)
ls "langsmith/monitoring_results/"

# View LangSmith traces (online)
# https://eu.smith.langchain.com/o/96cec319-5050-4517-b772-baa2b740f46e/projects/p/5eb45e3a-b575-4325-988e-86a59577290f
```

---

## 🧪 Testing

### Test Deal Analyzer:
1. Go to http://localhost:3000 → "Brand Deal Analyzer"
2. Enter: Fitness creator, Instagram, 50K followers, $3,000 offer
3. See: Market rate $3,500, counter-offer $3,850, negotiation tips

### Test Contract Analyzer:
1. Go to http://localhost:3000 → "Contract Analyzer"
2. Paste any contract with problematic clauses
3. See: Red flags, health score, FTC compliance, recommendations

### Test Campaign Generator:
1. Go to http://localhost:3000 → "Campaign Generator"
2. Enter: Product $97, 10K subscribers
3. See: 5 email subjects, schedule (Day 0, 2, 6, 13, 29), value metrics

---

## 🔌 API Reference

All endpoints documented at: **http://localhost:8000/docs**

### Analyze a Brand Deal
```bash
curl -X POST http://localhost:8000/api/deals/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "creator_name": "Sarah",
    "niche": "fitness",
    "platform": "instagram",
    "followers": 50000,
    "offered_rate_usd": 3000,
    "format": "post"
  }'
```

### Analyze a Contract
```bash
curl -X POST http://localhost:8000/api/contracts/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "creator_name": "Sarah",
    "brand_name": "FitnessCo",
    "contract_text": "...",
    "creator_niche": "fitness",
    "deal_value": 5000
  }'
```

### Generate Email Campaign
```bash
curl -X POST http://localhost:8000/api/campaigns/generate \
  -H "Content-Type: application/json" \
  -d '{
    "creator_name": "Sarah",
    "product_name": "Fitness Masterclass",
    "product_price": 97,
    "product_type": "course",
    "creator_niche": "fitness",
    "subscriber_count": 10000
  }'
```

---

## 💾 Data Storage

- **Deals**: All analyzed brand offers → SQLite `deals` table
- **Contracts**: All reviewed contracts → SQLite `contracts` table
- **Campaigns**: All generated campaigns → SQLite `campaigns` table
- **Database**: `backend/creatoriq.db` (auto-created)

**View history** at: http://localhost:3000 → "History" or "Dashboard"

---

## 🧠 How n8n Integration Works

CreatorIQ calls n8n workflows via HTTP webhooks:

```
1. User submits deal form in React
2. FastAPI receives POST /api/deals/analyze
3. FastAPI calls → n8n POST /webhook/brand-deal-check
4. n8n runs "Code" node (market rate benchmark calculation)
5. n8n returns JSON response
6. FastAPI saves to SQLite
7. FastAPI returns to React
8. React displays results
```

**n8n workflows required:**
- ✅ `/webhook/brand-deal-check` → O4 workflow
- ✅ `/webhook/analyse-contract` → O3 workflow
- ✅ `/webhook/product-launch` → O1 workflow

All workflows already created and ready to import.

---

## 🤖 RAG System (ChromaDB)

Retrieval Augmented Generation for smarter contract analysis:

1. **Knowledge Base** (auto-embedded on first startup):
   - FTC Endorsement Guides (official compliance rules)
   - Sample Creator Contracts (100+ templates)
   - Red Flag Library (dangerous clause patterns)

2. **Retrieval Process**:
   - User submits contract → Embedding created
   - ChromaDB finds similar documents
   - Retrieved context sent to Claude API
   - Claude analyzes with knowledge context

3. **Result**: Better recommendations based on real precedent

---

## 🔐 Security & Privacy

- ✅ No user authentication required (MVP)
- ✅ SQLite local database (no external storage)
- ✅ All API keys in `.env` (git-ignored)
- ✅ CORS enabled for localhost only
- ✅ n8n webhooks unprotected (localhost only)

**For production:**
- Add JWT authentication
- Switch to PostgreSQL
- Deploy behind Cloudflare/Nginx
- Enable HTTPS

---

## 💰 ROI & Value Metrics

### Deal Analyzer (O4)
- **Time saved**: 30 minutes per deal analysis
- **Value**: $800-2,000 per deal recovered (better negotiation)
- **Creators**: Analyze unlimited deals

### Contract Analyzer (O3)
- **Time saved**: 2-3 hours per contract review
- **Value**: $5,200/year in avoided bad deals
- **Data**: FTC-compliant + red-flag detection

### Campaign Generator (O1)
- **Time saved**: 10 hours per launch
- **Cost**: Email copywriting ($500-1,000 saved)
- **Results**: Higher conversion due to optimized sequence

**Total ROI**: 3,233% - 5,417% (breaks even in < 2 weeks)

---

## 🚀 Production Deployment

### Heroku (Backend)
```bash
heroku create creatoriq-api
git push heroku main
```

### Vercel (Frontend)
```bash
npm run build
vercel deploy
```

### PostgreSQL (Database)
```bash
DATABASE_URL=postgresql://user:pass@host/creatoriq
```

See **SETUP.md** for detailed deployment instructions.

---

## 🛣️ Roadmap

### Phase 2 (v1.1)
- [ ] User authentication (email/password)
- [ ] Creator profile dashboard
- [ ] Real-time audience health alerts (O2)
- [ ] Abandoned checkout recovery (O5)
- [ ] Export reports to PDF

### Phase 3 (v2.0)
- [ ] Multi-user team accounts
- [ ] Custom rate benchmarking
- [ ] Discord/Slack integration
- [ ] Deal recommendation engine
- [ ] Mobile app

### Phase 4 (v3.0)
- [ ] Predictive revenue optimization
- [ ] Creator marketplace
- [ ] Brand/Creator matching
- [ ] Revenue split calculator

---

## 🤝 Contributing

This is an open MVP. Feel free to:
1. Fork the repository
2. Add features or improvements
3. Submit pull requests
4. Report issues

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Installation & troubleshooting
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design & data flow
- **[n8n Workflows](n8n/workflow_documentation.md)** - Workflow details
- **[API Docs](http://localhost:8000/docs)** - Live Swagger UI

---

## 💡 Key Features

✅ **Deal Analysis**
- Market rate benchmarking (52,000+ real deals)
- Niche multipliers (Finance 1.45×, Health 1.20×, etc.)
- Follower tier classification (nano to mega)
- Counter-offer suggestions

✅ **Contract Review**
- Red-flag clause detection (7+ patterns)
- FTC compliance checking
- RAG-powered knowledge retrieval
- Claude AI deep analysis

✅ **Campaign Generation**
- 5-email sequence templates
- Optimized send schedule (Days 0, 2, 6, 13, 29)
- Early bird pricing calculations
- Value metrics (hours saved, expected revenue)

✅ **Historical Data**
- SQLite persistence
- Dashboard with summary stats
- Full history browsing
- Creator-filtered views

✅ **RAG Integration**
- ChromaDB vector search
- FTC guideline embeddings
- Contract template similarity
- Context-aware analysis

---

## 🎯 Use Cases

### For Creators
- ✅ Negotiate fair brand deals
- ✅ Review contracts safely
- ✅ Generate launch campaigns in minutes
- ✅ Track deal history and trends

### For Agencies
- ✅ Vet client contracts
- ✅ Benchmark creator rates
- ✅ Generate campaign templates
- ✅ Train creators on fair deal practices

### For Managers
- ✅ Monitor creator earnings
- ✅ Flag risky contracts
- ✅ Optimize brand partnerships
- ✅ Scale creator coaching

---

## 📞 Support

**Issues?**
1. Check **SETUP.md** for troubleshooting
2. Verify all 3 services running: React (:3000), FastAPI (:8000), n8n (:5678)
3. Check browser console (F12) for errors
4. Check backend logs for API issues

**Help**
- FastAPI Docs: http://localhost:8000/docs
- n8n Docs: https://docs.n8n.io
- Claude API: https://docs.anthropic.com

---

## ⚖️ License

MIT License - Feel free to use for personal or commercial projects.

---

## 🙏 Credits

Built with:
- **FastAPI** - Modern Python web framework
- **React 18** - UI library
- **n8n** - Workflow automation
- **ChromaDB** - Vector database
- **Claude API** - AI analysis
- **SQLAlchemy** - ORM

---

## 🎉 Getting Started Now

```bash
# 1. Clone/navigate to project
cd C:\CreatorIQ Project

# 2. Configure .env
# Add your ANTHROPIC_API_KEY

# 3. Start backend
cd backend && python app.py

# 4. Start frontend (new terminal)
cd frontend && npm run dev

# 5. Open browser
# http://localhost:3000
```

**That's it! You're running a production-quality creator monetization platform.** 🚀

---

**Questions?** Check the detailed guides or reach out!

**Ready to help creators earn more fairly.** ✨
