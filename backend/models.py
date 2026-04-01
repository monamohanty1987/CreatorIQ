"""
SQLAlchemy ORM Models for CreatorIQ database
Defines tables for deals, contracts, and campaigns
"""

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.sql import func
from database import Base
from datetime import datetime

class Deal(Base):
    """Brand deal analysis record"""
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    creator_name = Column(String(255), index=True)
    niche = Column(String(100))
    platform = Column(String(50))
    followers = Column(Integer)
    offered_rate = Column(Float)
    market_rate = Column(Float)
    gap_usd = Column(Float)
    gap_pct = Column(Float)
    verdict = Column(String(50))  # "BELOW_MARKET", "AT_OR_ABOVE_MARKET"
    alert_level = Column(String(50))  # "WARNING", "GOOD"
    counter_offer = Column(Float)
    talking_points = Column(Text)
    full_analysis = Column(JSON)  # Store entire n8n response
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "creator_name": self.creator_name,
            "niche": self.niche,
            "platform": self.platform,
            "followers": self.followers,
            "offered_rate": self.offered_rate,
            "market_rate": self.market_rate,
            "gap_usd": self.gap_usd,
            "gap_pct": self.gap_pct,
            "verdict": self.verdict,
            "alert_level": self.alert_level,
            "counter_offer": self.counter_offer,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Contract(Base):
    """Contract analysis record"""
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    creator_name = Column(String(255), index=True)
    brand_name = Column(String(255))
    contract_text = Column(Text)
    health_score = Column(Float)
    verdict = Column(String(50))  # "PASS", "NEGOTIATE", "REJECT"
    red_flags_count = Column(Integer, default=0)
    critical_flags_count = Column(Integer, default=0)
    high_flags_count = Column(Integer, default=0)
    ftc_compliance = Column(String(100))  # "COMPLIANT", "NEEDS_REVIEW", "CRITICAL"
    analysis_json = Column(JSON)  # Full analysis from n8n + Claude
    rag_context = Column(JSON)  # Retrieved documents from ChromaDB
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "creator_name": self.creator_name,
            "brand_name": self.brand_name,
            "health_score": self.health_score,
            "verdict": self.verdict,
            "red_flags_count": self.red_flags_count,
            "critical_flags_count": self.critical_flags_count,
            "high_flags_count": self.high_flags_count,
            "ftc_compliance": self.ftc_compliance,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Campaign(Base):
    """Product launch email campaign record"""
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    creator_name = Column(String(255), index=True)
    product_name = Column(String(255))
    product_price = Column(Float)
    product_type = Column(String(100))
    campaign_id = Column(String(100), unique=True, index=True)  # From n8n

    # Email subjects (for quick preview)
    email_1_subject = Column(String(255))
    email_2_subject = Column(String(255))
    email_3_subject = Column(String(255))
    email_4_subject = Column(String(255))
    email_5_subject = Column(String(255))

    # Full sequence
    emails_json = Column(JSON)  # Complete 5-email sequence from n8n

    # Campaign metadata
    scheduled_send_dates = Column(JSON)  # [day0, day2, day6, day13, day29]
    early_bird_price = Column(Float)
    early_bird_end_date = Column(String(10))

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "creator_name": self.creator_name,
            "product_name": self.product_name,
            "product_price": self.product_price,
            "product_type": self.product_type,
            "campaign_id": self.campaign_id,
            "email_1_subject": self.email_1_subject,
            "email_2_subject": self.email_2_subject,
            "email_3_subject": self.email_3_subject,
            "email_4_subject": self.email_4_subject,
            "email_5_subject": self.email_5_subject,
            "early_bird_price": self.early_bird_price,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class ContentAnalysis(Base):
    """Content-to-Commerce analysis record"""
    __tablename__ = "content_analysis"

    id = Column(Integer, primary_key=True, index=True)

    # Content metadata
    title = Column(String(500), index=True)
    platform = Column(String(50))  # YouTube, TikTok, Instagram, etc.
    content_type = Column(String(50))  # Tutorial, Review, How-To, Q&A, Educational, Vlog, Entertainment
    topic = Column(String(100))  # Tech, Fitness, Finance, Productivity, Business, etc.

    # Metrics
    views = Column(Integer)
    engagement_rate = Column(Float)  # likes + comments / views
    duration_minutes = Column(Integer)

    # Commerce data
    estimated_sales = Column(Integer)
    estimated_revenue = Column(Float)

    # Manual entry override
    manual_sales = Column(Integer, nullable=True)
    manual_revenue = Column(Float, nullable=True)

    # Suggested commerce moments
    suggested_moments = Column(JSON)  # [{time: "0:30", type: "intro"}, ...]
    recommended_products = Column(JSON)  # List of product suggestions

    # Publishing metadata
    publish_date = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        # Use manual data if provided, otherwise estimated
        final_sales = self.manual_sales if self.manual_sales else self.estimated_sales
        final_revenue = self.manual_revenue if self.manual_revenue else self.estimated_revenue

        # Calculate ROI (assuming $100 production cost)
        roi = (final_revenue - 100) / 100 * 100 if final_revenue else 0

        return {
            "id": self.id,
            "title": self.title,
            "platform": self.platform,
            "content_type": self.content_type,
            "topic": self.topic,
            "views": self.views,
            "engagement_rate": self.engagement_rate,
            "duration_minutes": self.duration_minutes,
            "sales": final_sales,
            "revenue": final_revenue,
            "roi": round(roi, 1),
            "suggested_moments": self.suggested_moments,
            "recommended_products": self.recommended_products,
            "publish_date": self.publish_date.isoformat() if self.publish_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class ContentRepurpose(Base):
    """Content repurposing record - converts 1 piece into multiple formats"""
    __tablename__ = "content_repurpose"

    id = Column(Integer, primary_key=True, index=True)
    creator_name = Column(String(255), index=True)

    # Original content
    original_content = Column(Text)  # YouTube transcript, blog post, podcast transcript
    content_type = Column(String(50))  # "video", "blog", "podcast"
    content_title = Column(String(500))
    content_duration = Column(String(50), nullable=True)  # e.g., "10:30" for video

    # Metadata
    topic = Column(String(100))
    niche = Column(String(100))
    target_audience = Column(String(255))

    # Repurposed outputs (JSON format for flexibility)
    tiktok_scripts = Column(JSON)  # Array of 3 TikTok scripts
    instagram_captions = Column(JSON)  # Array of 5 Instagram captions
    twitter_thread = Column(JSON)  # Array of 5-10 tweets
    blog_post = Column(Text)  # Full 1500+ word blog post
    email_scripts = Column(JSON)  # Array of 3 email versions (short, medium, long)
    podcast_notes = Column(JSON)  # {intro, outro, show_notes, timestamps}
    linkedin_post = Column(JSON)  # {post, comment_hooks, hashtags}

    # Metadata
    hashtags = Column(JSON)  # Recommended hashtags per platform
    best_posting_times = Column(JSON)  # Recommended posting times per platform
    engagement_forecast = Column(JSON)  # Predicted metrics per platform

    # Processing info
    status = Column(String(50), default="processing")  # "processing", "completed", "failed"
    error_message = Column(Text, nullable=True)
    processing_time_seconds = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "creator_name": self.creator_name,
            "content_title": self.content_title,
            "content_type": self.content_type,
            "topic": self.topic,
            "niche": self.niche,
            "target_audience": self.target_audience,
            "status": self.status,
            "tiktok_scripts": self.tiktok_scripts,
            "instagram_captions": self.instagram_captions,
            "twitter_thread": self.twitter_thread,
            "email_scripts": self.email_scripts,
            "podcast_notes": self.podcast_notes,
            "linkedin_post": self.linkedin_post,
            "processing_time_seconds": self.processing_time_seconds,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
