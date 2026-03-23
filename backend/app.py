"""
CreatorIQ FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import logging
from datetime import datetime
from typing import Optional

# Import configuration and services
from config import settings
from database import init_db, get_db, SessionLocal
from models import Deal, Contract, Campaign, ContentAnalysis
from services.rag_service import rag_service
from services.n8n_client import n8n_client
from services.claude_service import claude_service
from services.langsmith_service import TRACING_ENABLED, RESULTS_DIR
from services.deal_benchmark import calculate_market_rate

# Import routes
try:
    from routes import content_commerce
except ImportError:
    logger_import = logging.getLogger(__name__)
    logger_import.warning("Could not import content_commerce routes")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# Startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup/shutdown
    """
    # Startup
    logger.info("=" * 60)
    logger.info("🚀 CreatorIQ API Starting Up")
    logger.info("=" * 60)

    # Initialize database
    try:
        init_db()
        logger.info("✅ Database initialized")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")

    # Initialize RAG knowledge base
    try:
        rag_service.initialize_knowledge_base()
        logger.info("✅ RAG knowledge base initialized")
    except Exception as e:
        logger.warning(f"⚠️ RAG initialization failed: {str(e)}")

    # Check Claude API
    if settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_API_KEY != "your_anthropic_api_key_here":
        logger.info("✅ Claude API key configured")
    else:
        logger.warning("⚠️ ANTHROPIC_API_KEY not set - contract analysis may be limited")

    # Check LangSmith
    if TRACING_ENABLED:
        logger.info("✅ LangSmith tracing ENABLED → https://eu.smith.langchain.com")
    else:
        logger.warning("⚠️ LangSmith tracing DISABLED — set LANGCHAIN_API_KEY to enable")
    logger.info(f"📁 Local trace logs → {RESULTS_DIR}")

    logger.info("✅ CreatorIQ API ready to serve requests")
    logger.info("=" * 60)

    yield  # App runs here

    # Shutdown
    logger.info("🛑 CreatorIQ API shutting down")


# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== ROOT ENDPOINTS ====================

@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "service": "CreatorIQ API",
        "version": settings.API_VERSION,
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "deals": "/api/deals",
            "contracts": "/api/contracts",
            "campaigns": "/api/campaigns",
            "history": "/api/history"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "n8n": f"http://localhost:5678",
            "chromadb": "initialized",
            "database": "sqlite3"
        }
    }


# ==================== LANGSMITH MONITORING ENDPOINTS ====================

@app.get("/api/monitoring/status")
async def monitoring_status():
    """LangSmith monitoring status and configuration"""
    import os
    return {
        "langsmith_enabled":  TRACING_ENABLED,
        "project":            os.environ.get("LANGCHAIN_PROJECT", "CreatorIQ"),
        "endpoint":           os.environ.get("LANGCHAIN_ENDPOINT", "https://eu.api.smith.langchain.com"),
        "dashboard_url":      "https://eu.smith.langchain.com/o/96cec319-5050-4517-b772-baa2b740f46e/projects/p/5eb45e3a-b575-4325-988e-86a59577290f",
        "local_traces_dir":   str(RESULTS_DIR),
        "local_traces_count": len(list(RESULTS_DIR.glob("*.json"))),
    }


@app.get("/api/monitoring/traces")
async def get_local_traces(limit: int = 20, trace_type: Optional[str] = None):
    """
    Return recent local trace logs from monitoring_results/.
    Filter by type: claude_call | rag_retrieval | n8n_call
    """
    import json as _json
    files = sorted(RESULTS_DIR.glob("*.json"), reverse=True)
    results = []
    for f in files:
        if trace_type and not f.name.startswith(trace_type):
            continue
        try:
            with open(f, encoding="utf-8") as fp:
                results.append(_json.load(fp))
        except Exception:
            pass
        if len(results) >= limit:
            break
    return {"traces": results, "total": len(results)}


@app.get("/api/monitoring/summary")
async def monitoring_summary():
    """
    Aggregated stats: total calls, total tokens, total cost, avg latency
    per operation type from local trace files.
    """
    import json as _json
    from collections import defaultdict

    stats = defaultdict(lambda: {
        "calls": 0, "errors": 0,
        "total_tokens": 0, "total_cost_usd": 0.0,
        "total_latency_ms": 0.0,
    })

    for f in RESULTS_DIR.glob("*.json"):
        try:
            with open(f, encoding="utf-8") as fp:
                t = _json.load(fp)
            key = t.get("operation") or t.get("workflow") or t.get("type", "unknown")
            s   = stats[key]
            s["calls"] += 1
            if t.get("error"):
                s["errors"] += 1
            s["total_tokens"]   += t.get("total_tokens", 0)
            s["total_cost_usd"] += t.get("cost_usd", 0.0)
            s["total_latency_ms"] += t.get("latency_ms", 0.0)
        except Exception:
            pass

    summary = []
    for op, s in stats.items():
        summary.append({
            "operation":       op,
            "calls":           s["calls"],
            "errors":          s["errors"],
            "success_rate":    f"{((s['calls']-s['errors'])/max(s['calls'],1))*100:.1f}%",
            "total_tokens":    s["total_tokens"],
            "total_cost_usd":  round(s["total_cost_usd"], 6),
            "avg_latency_ms":  round(s["total_latency_ms"] / max(s["calls"], 1), 2),
        })

    total_cost = sum(x["total_cost_usd"] for x in summary)
    return {
        "by_operation":    sorted(summary, key=lambda x: x["calls"], reverse=True),
        "totals": {
            "total_traces":    sum(x["calls"] for x in summary),
            "total_cost_usd":  round(total_cost, 6),
            "total_tokens":    sum(x["total_tokens"] for x in summary),
        },
        "langsmith_url": "https://eu.smith.langchain.com/o/96cec319-5050-4517-b772-baa2b740f46e/projects/p/5eb45e3a-b575-4325-988e-86a59577290f",
    }


# ==================== DEAL ANALYSIS ENDPOINTS ====================

@app.post("/api/deals/analyze")
async def analyze_deal(
    creator_name: str,
    niche: str,
    platform: str,
    followers: int,
    offered_rate_usd: float,
    format: str = "post",
    db: Session = Depends(get_db)
):
    """
    Analyze a brand deal against market rates (O4 workflow)

    Request:
        POST /api/deals/analyze
        {
            "creator_name": "Sarah",
            "niche": "fitness",
            "platform": "instagram",
            "followers": 50000,
            "offered_rate_usd": 3000,
            "format": "post"
        }

    Returns:
        {
            "deal_id": 1,
            "verdict": "BELOW_MARKET",
            "market_rate": 3500,
            "offered_rate": 3000,
            "gap_usd": -500,
            "counter_offer": 3850,
            "talking_points": [...]
        }
    """
    def _parse_usd(val) -> float:
        """Convert '$3,500' or 3500 or '$3,850' → float"""
        if isinstance(val, (int, float)):
            return float(val)
        if isinstance(val, str):
            try:
                return float(val.replace('$', '').replace(',', '').split()[0])
            except Exception:
                return 0.0
        return 0.0

    def _parse_pct(val) -> float:
        """Convert '-14.3%' or -14.3 → float"""
        if isinstance(val, (int, float)):
            return float(val)
        if isinstance(val, str):
            try:
                return float(val.replace('%', '').strip())
            except Exception:
                return 0.0
        return 0.0

    try:
        logger.info(f"Analyzing deal for {creator_name} on {platform}")

        # Call n8n O4 Brand Deal Rate Checker
        n8n_response = await n8n_client.analyze_brand_deal(
            niche=niche,
            platform=platform,
            followers=followers,
            offered_rate_usd=offered_rate_usd,
            format=format
        )

        # If n8n returned empty / no data, fall back to local benchmark calculator
        if not n8n_response:
            logger.warning("n8n returned no data — using local benchmark fallback")
            n8n_response = calculate_market_rate(
                niche=niche,
                platform=platform,
                followers=followers,
                offered_rate_usd=offered_rate_usd,
                format=format,
            )

        # n8n O4 returns nested structure:
        # { verdict: {status, alert_level, headline, recommendation, counter_offer, talking_points},
        #   rate_analysis: {offered_rate, market_rate, market_range, offer_percentile, gap_amount, gap_pct},
        #   deal_summary: {platform, niche, format, follower_count, follower_tier} }
        verdict_obj      = n8n_response.get("verdict",      {})
        rate_analysis    = n8n_response.get("rate_analysis", {})
        deal_summary_obj = n8n_response.get("deal_summary",  {})

        market_rate_val  = _parse_usd(rate_analysis.get("market_rate",  0))
        counter_offer_val = _parse_usd(verdict_obj.get("counter_offer", 0))
        gap_pct_val      = _parse_pct(rate_analysis.get("gap_pct",      0))
        gap_usd_val      = round(offered_rate_usd - market_rate_val, 2)
        status_val       = verdict_obj.get("status",      "AT_OR_ABOVE_MARKET")
        alert_level_val  = verdict_obj.get("alert_level", "GOOD")
        talking_pts      = verdict_obj.get("talking_points", [])

        # Save to database
        deal = Deal(
            creator_name=creator_name,
            niche=niche,
            platform=platform,
            followers=followers,
            offered_rate=offered_rate_usd,
            market_rate=market_rate_val,
            gap_usd=gap_usd_val,
            gap_pct=gap_pct_val,
            verdict=status_val,
            alert_level=alert_level_val,
            counter_offer=counter_offer_val,
            talking_points="|".join(talking_pts) if isinstance(talking_pts, list) else str(talking_pts),
            full_analysis=n8n_response
        )
        db.add(deal)
        db.commit()
        db.refresh(deal)

        logger.info(f"Deal analysis saved to DB (ID: {deal.id})")

        return {
            "deal_id":       deal.id,
            "creator_name":  creator_name,
            "verdict":       status_val,
            "alert_level":   alert_level_val,
            "headline":      verdict_obj.get("headline",       ""),
            "recommendation":verdict_obj.get("recommendation", ""),
            "market_rate":   market_rate_val,
            "offered_rate":  offered_rate_usd,
            "market_range":  rate_analysis.get("market_range", ""),
            "offer_percentile": rate_analysis.get("offer_percentile", ""),
            "gap_usd":       gap_usd_val,
            "gap_pct":       gap_pct_val,
            "counter_offer": counter_offer_val,
            "follower_tier": deal_summary_obj.get("follower_tier", ""),
            "talking_points": talking_pts if isinstance(talking_pts, list) else [talking_pts],
            "created_at":    deal.created_at.isoformat()
        }

    except Exception as e:
        logger.error(f"Error analyzing deal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/deals/history")
async def get_deals_history(creator_name: Optional[str] = None, db: Session = Depends(get_db)):
    """Get deal analysis history"""
    try:
        query = db.query(Deal)
        if creator_name:
            query = query.filter(Deal.creator_name == creator_name)

        deals = query.order_by(Deal.created_at.desc()).limit(50).all()
        return [deal.to_dict() for deal in deals]

    except Exception as e:
        logger.error(f"Error fetching deals history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== CONTRACT ANALYSIS ENDPOINTS ====================

@app.post("/api/contracts/analyze")
async def analyze_contract(
    creator_name: str,
    brand_name: str,
    contract_text: str,
    creator_niche: str = "lifestyle",
    deal_value: float = 0,
    db: Session = Depends(get_db)
):
    """
    Analyze a contract for red flags and FTC compliance (O3 workflow + RAG + Claude)

    Request:
        POST /api/contracts/analyze
        {
            "creator_name": "Sarah",
            "brand_name": "FitnessCo",
            "contract_text": "...",
            "creator_niche": "fitness",
            "deal_value": 5000
        }

    Returns:
        {
            "contract_id": 1,
            "verdict": "NEGOTIATE",
            "health_score": 65,
            "red_flags": [...],
            "recommendations": [...]
        }
    """
    try:
        logger.info(f"Analyzing contract from {brand_name} for {creator_name}")

        # Retrieve relevant documents from RAG
        rag_documents = rag_service.retrieve_relevant_documents(
            query=contract_text[:1000],  # Use first 1000 chars as query
            n_results=3
        )
        rag_context = [doc.get("content", "") for doc in rag_documents]

        # Call n8n O3 Contract Analysis
        n8n_response = await n8n_client.analyze_contract(
            contract_text=contract_text,
            creator_name=creator_name,
            creator_niche=creator_niche,
            deal_value=deal_value,
            brand_name=brand_name
        )

        analysis = n8n_response.get("analysis", {})
        health_score = analysis.get("contract_health", {}).get("score", 0)
        verdict = analysis.get("contract_health", {}).get("verdict", "UNKNOWN")
        red_flags = analysis.get("red_flags", [])

        # Use Claude for enhanced analysis if API key is available
        claude_analysis = None
        if settings.ANTHROPIC_API_KEY:
            try:
                claude_analysis = claude_service.analyze_contract_with_rag(
                    contract_text=contract_text,
                    creator_name=creator_name,
                    brand_name=brand_name,
                    retrieved_documents=rag_context
                )
                logger.info(f"Claude analysis completed for {brand_name}")
            except Exception as e:
                logger.warning(f"Claude analysis failed: {str(e)}")

        # Save to database
        contract = Contract(
            creator_name=creator_name,
            brand_name=brand_name,
            contract_text=contract_text[:5000],  # Store first 5000 chars
            health_score=health_score,
            verdict=verdict,
            red_flags_count=len(red_flags),
            critical_flags_count=len([f for f in red_flags if f.get("severity") == "CRITICAL"]),
            high_flags_count=len([f for f in red_flags if f.get("severity") == "HIGH"]),
            ftc_compliance=analysis.get("ftc_compliance", {}).get("risk_level", "UNKNOWN"),
            analysis_json=n8n_response,
            rag_context={"documents": rag_documents, "claude_analysis": claude_analysis}
        )
        db.add(contract)
        db.commit()
        db.refresh(contract)

        logger.info(f"Contract analysis saved to DB (ID: {contract.id})")

        return {
            "contract_id": contract.id,
            "creator_name": creator_name,
            "brand_name": brand_name,
            "verdict": verdict,
            "health_score": health_score,
            "red_flags_count": len(red_flags),
            "critical_flags": len([f for f in red_flags if f.get("severity") == "CRITICAL"]),
            "ftc_compliance": analysis.get("ftc_compliance", {}).get("risk_level", "UNKNOWN"),
            "red_flags": red_flags[:5],  # Return top 5 red flags
            "recommendations": analysis.get("recommendations", []),
            "claude_analysis": claude_analysis,
            "created_at": contract.created_at.isoformat()
        }

    except Exception as e:
        logger.error(f"Error analyzing contract: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/contracts/history")
async def get_contracts_history(creator_name: Optional[str] = None, db: Session = Depends(get_db)):
    """Get contract analysis history"""
    try:
        query = db.query(Contract)
        if creator_name:
            query = query.filter(Contract.creator_name == creator_name)

        contracts = query.order_by(Contract.created_at.desc()).limit(50).all()
        return [contract.to_dict() for contract in contracts]

    except Exception as e:
        logger.error(f"Error fetching contracts history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== CAMPAIGN GENERATION ENDPOINTS ====================

@app.post("/api/campaigns/generate")
async def generate_campaign(
    creator_name: str,
    product_name: str,
    product_price: float,
    product_type: str = "course",
    creator_niche: str = "lifestyle",
    launch_date: str = None,
    subscriber_count: int = 5000,
    db: Session = Depends(get_db)
):
    """
    Generate a 5-email product launch sequence (O1 workflow)

    Request:
        POST /api/campaigns/generate
        {
            "creator_name": "Sarah",
            "product_name": "Fitness Masterclass",
            "product_price": 97,
            "product_type": "course",
            "subscriber_count": 10000
        }

    Returns:
        {
            "campaign_id": 1,
            "campaign_n8n_id": "LAUNCH-...",
            "emails_queued": 5,
            "email_subjects": [...],
            "value_saved_hours": 10
        }
    """
    try:
        from datetime import datetime
        if not launch_date:
            launch_date = datetime.now().strftime("%Y-%m-%d")

        logger.info(f"Generating campaign for {creator_name}: {product_name}")

        # Call n8n O1 Product Launch Email Sequence
        n8n_response = await n8n_client.generate_campaign(
            product_name=product_name,
            product_price=product_price,
            product_type=product_type,
            creator_name=creator_name,
            creator_niche=creator_niche,
            launch_date=launch_date,
            subscriber_count=subscriber_count
        )

        # The n8n response is an array of email objects
        emails = n8n_response if isinstance(n8n_response, list) else [n8n_response]

        # Extract campaign info
        campaign_id = emails[0].get("campaign_id", f"CAMP-{datetime.now().timestamp()}") if emails else ""
        email_subjects = [email.get("subject", "") for email in emails]

        # Save to database
        campaign = Campaign(
            creator_name=creator_name,
            product_name=product_name,
            product_price=product_price,
            product_type=product_type,
            campaign_id=campaign_id,
            email_1_subject=email_subjects[0] if len(email_subjects) > 0 else "",
            email_2_subject=email_subjects[1] if len(email_subjects) > 1 else "",
            email_3_subject=email_subjects[2] if len(email_subjects) > 2 else "",
            email_4_subject=email_subjects[3] if len(email_subjects) > 3 else "",
            email_5_subject=email_subjects[4] if len(email_subjects) > 4 else "",
            emails_json=n8n_response,
            scheduled_send_dates=[0, 2, 6, 13, 29],
            early_bird_price=round(product_price * 0.75, 2) if product_price else 0
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)

        logger.info(f"Campaign saved to DB (ID: {campaign.id})")

        return {
            "campaign_id": campaign.id,
            "campaign_n8n_id": campaign_id,
            "creator_name": creator_name,
            "product_name": product_name,
            "product_price": product_price,
            "emails_queued": len(emails),
            "email_subjects": email_subjects,
            "send_schedule_days": [0, 2, 6, 13, 29],
            "value_metrics": {
                "hours_saved": 10,
                "early_bird_price": campaign.early_bird_price,
                "expected_revenue": product_price * int(subscriber_count * 0.05)  # Assume 5% conversion
            },
            "created_at": campaign.created_at.isoformat()
        }

    except Exception as e:
        logger.error(f"Error generating campaign: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/campaigns/history")
async def get_campaigns_history(creator_name: Optional[str] = None, db: Session = Depends(get_db)):
    """Get campaign history"""
    try:
        query = db.query(Campaign)
        if creator_name:
            query = query.filter(Campaign.creator_name == creator_name)

        campaigns = query.order_by(Campaign.created_at.desc()).limit(50).all()
        return [campaign.to_dict() for campaign in campaigns]

    except Exception as e:
        logger.error(f"Error fetching campaigns history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== HISTORY ENDPOINTS ====================

@app.get("/api/history")
async def get_all_history(creator_name: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Get complete history across all analysis types
    """
    try:
        deals = []
        contracts = []
        campaigns = []

        deal_query = db.query(Deal)
        contract_query = db.query(Contract)
        campaign_query = db.query(Campaign)

        if creator_name:
            deal_query = deal_query.filter(Deal.creator_name == creator_name)
            contract_query = contract_query.filter(Contract.creator_name == creator_name)
            campaign_query = campaign_query.filter(Campaign.creator_name == creator_name)

        deals = [deal.to_dict() for deal in deal_query.order_by(Deal.created_at.desc()).limit(10).all()]
        contracts = [contract.to_dict() for contract in contract_query.order_by(Contract.created_at.desc()).limit(10).all()]
        campaigns = [campaign.to_dict() for campaign in campaign_query.order_by(Campaign.created_at.desc()).limit(10).all()]

        return {
            "deals": deals,
            "contracts": contracts,
            "campaigns": campaigns,
            "summary": {
                "total_deals_analyzed": db.query(Deal).count(),
                "total_contracts_reviewed": db.query(Contract).count(),
                "total_campaigns_created": db.query(Campaign).count()
            }
        }

    except Exception as e:
        logger.error(f"Error fetching history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== CONTENT-TO-COMMERCE ====================

@app.get("/api/content/performance")
async def get_content_performance(db: Session = Depends(get_db)):
    """Get all content with performance metrics"""
    try:
        content = db.query(ContentAnalysis).order_by(ContentAnalysis.estimated_revenue.desc()).all()
        return {
            "content": [c.to_dict() for c in content],
            "count": len(content),
            "total_revenue": sum(c.estimated_revenue or 0 for c in content)
        }
    except Exception as e:
        logger.error(f"Error fetching content performance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/content/by-type")
async def get_content_by_type(db: Session = Depends(get_db)):
    """Get content grouped by type with analytics"""
    try:
        from sqlalchemy import func
        stats = db.query(
            ContentAnalysis.content_type,
            func.count(ContentAnalysis.id).label('count'),
            func.round(func.avg(ContentAnalysis.views), 0).label('avg_views'),
            func.round(func.avg(ContentAnalysis.estimated_sales), 0).label('avg_sales'),
            func.round(func.avg(ContentAnalysis.estimated_revenue), 0).label('avg_revenue')
        ).group_by(ContentAnalysis.content_type).all()

        return {
            "by_type": [
                {
                    "content_type": s[0],
                    "count": s[1],
                    "avg_views": s[2],
                    "avg_sales": s[3],
                    "avg_revenue": s[4]
                } for s in stats
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching content by type: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/content/by-topic")
async def get_content_by_topic(db: Session = Depends(get_db)):
    """Get content grouped by topic with analytics"""
    try:
        from sqlalchemy import func
        stats = db.query(
            ContentAnalysis.topic,
            func.count(ContentAnalysis.id).label('count'),
            func.round(func.avg(ContentAnalysis.estimated_revenue), 0).label('avg_revenue')
        ).group_by(ContentAnalysis.topic).all()

        return {
            "by_topic": [
                {
                    "topic": s[0],
                    "count": s[1],
                    "avg_revenue": s[2]
                } for s in stats
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching content by topic: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/content/suggestions/{content_id}")
async def get_content_suggestions(content_id: int, db: Session = Depends(get_db)):
    """Get commerce suggestions for specific content"""
    try:
        content = db.query(ContentAnalysis).filter(ContentAnalysis.id == content_id).first()
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")

        return {
            "content_id": content_id,
            "suggestions": {
                "timing": ["0-10% (Intro)", "40-60% (MidPoint)", "90-100% (Outro)"],
                "products": [f"Products for {content.topic} niche"],
                "templates": ["Commerce script templates available"]
            }
        }
    except Exception as e:
        logger.error(f"Error fetching content suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/content/update-sales/{content_id}")
async def update_content_sales(content_id: int, sales_data: dict, db: Session = Depends(get_db)):
    """Update manual sales data for content"""
    try:
        content = db.query(ContentAnalysis).filter(ContentAnalysis.id == content_id).first()
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")

        content.manual_sales = sales_data.get("manual_sales")
        content.manual_revenue = sales_data.get("manual_revenue")
        db.commit()

        return {"status": "updated", "content_id": content_id}
    except Exception as e:
        logger.error(f"Error updating sales: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/content/calendar")
async def get_content_calendar(db: Session = Depends(get_db)):
    """Get weekly calendar with commerce recommendations"""
    try:
        content = db.query(ContentAnalysis).order_by(ContentAnalysis.publish_date.desc()).limit(7).all()
        return {
            "calendar": [
                {
                    "title": c.title,
                    "content_type": c.content_type,
                    "topic": c.topic,
                    "commerce_recommendation": "Add 2-3 links" if c.estimated_revenue > 500000 else "Add 1 link",
                    "suggested_products": [f"Products for {c.topic}"],
                    "suggested_moments": [{"time": "0:30", "type": "intro"}],
                    "expected_revenue": c.estimated_revenue
                } for c in content
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching calendar: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/content/insights")
async def get_content_insights(db: Session = Depends(get_db)):
    """Get strategic insights and recommendations"""
    try:
        from sqlalchemy import func

        content = db.query(ContentAnalysis).all()
        total = len(content)

        # Best performing type
        best_type = db.query(
            ContentAnalysis.content_type,
            func.avg(ContentAnalysis.estimated_revenue).label('avg_rev')
        ).group_by(ContentAnalysis.content_type).order_by(func.avg(ContentAnalysis.estimated_revenue).desc()).first()

        # Best topic
        best_topic = db.query(
            ContentAnalysis.topic,
            func.avg(ContentAnalysis.estimated_revenue).label('avg_rev')
        ).group_by(ContentAnalysis.topic).order_by(func.avg(ContentAnalysis.estimated_revenue).desc()).first()

        total_rev = sum(c.estimated_revenue or 0 for c in content)

        return {
            "summary": {
                "total_content": total,
                "total_revenue": total_rev,
                "best_content_type": best_type[0] if best_type else "N/A",
                "best_topic": best_topic[0] if best_topic else "N/A"
            },
            "insights": [
                {
                    "title": f"Create more {best_type[0] if best_type else 'content'} videos",
                    "description": f"{best_type[0]} content generates the highest revenue",
                    "priority": "High",
                    "action": f"Plan next 5 videos as {best_type[0]} format"
                }
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== STARTUP ====================

if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting CreatorIQ API on {settings.HOST}:{settings.PORT}")
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
