"""
Content-to-Commerce API Routes
Handles content analysis, revenue tracking, and commerce suggestions
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from database import get_db
from models import ContentAnalysis

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/content", tags=["content-commerce"])


# ==================== CONTENT PERFORMANCE ====================

@router.get("/performance")
async def get_content_performance(db: Session = Depends(get_db)):
    """
    Get overall content performance dashboard
    Shows: all content, sorted by revenue
    """
    try:
        contents = db.query(ContentAnalysis).order_by(
            ContentAnalysis.estimated_revenue.desc()
        ).all()

        return {
            "total_content": len(contents),
            "content": [content.to_dict() for content in contents],
            "summary": {
                "total_views": sum([c.views for c in contents]),
                "total_revenue": sum([c.manual_revenue or c.estimated_revenue for c in contents]),
                "avg_revenue": sum([c.manual_revenue or c.estimated_revenue for c in contents]) / len(contents) if contents else 0
            }
        }
    except Exception as e:
        logger.error(f"Error fetching content performance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-type")
async def get_content_by_type(db: Session = Depends(get_db)):
    """
    Get content performance grouped by content type
    Shows: Tutorial, Review, How-To, Q&A, etc.
    """
    try:
        results = db.query(
            ContentAnalysis.content_type,
            func.count(ContentAnalysis.id).label('count'),
            func.avg(ContentAnalysis.views).label('avg_views'),
            func.avg(ContentAnalysis.estimated_sales).label('avg_sales'),
            func.avg(ContentAnalysis.estimated_revenue).label('avg_revenue')
        ).group_by(ContentAnalysis.content_type).all()

        data = []
        for result in results:
            data.append({
                "content_type": result.content_type,
                "count": result.count,
                "avg_views": int(result.avg_views) if result.avg_views else 0,
                "avg_sales": int(result.avg_sales) if result.avg_sales else 0,
                "avg_revenue": round(result.avg_revenue, 2) if result.avg_revenue else 0,
            })

        return data
    except Exception as e:
        logger.error(f"Error fetching content by type: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-topic")
async def get_content_by_topic(db: Session = Depends(get_db)):
    """
    Get content performance grouped by topic
    Shows: Tech, Fitness, Finance, Productivity, etc.
    """
    try:
        results = db.query(
            ContentAnalysis.topic,
            func.count(ContentAnalysis.id).label('count'),
            func.avg(ContentAnalysis.estimated_revenue).label('avg_revenue'),
            func.sum(ContentAnalysis.estimated_revenue).label('total_revenue')
        ).group_by(ContentAnalysis.topic).order_by(
            func.sum(ContentAnalysis.estimated_revenue).desc()
        ).all()

        data = []
        for result in results:
            data.append({
                "topic": result.topic,
                "count": result.count,
                "avg_revenue": round(result.avg_revenue, 2) if result.avg_revenue else 0,
                "total_revenue": round(result.total_revenue, 2) if result.total_revenue else 0,
            })

        return data
    except Exception as e:
        logger.error(f"Error fetching content by topic: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== REVENUE TRACKING ====================

@router.post("/update-sales/{content_id}")
async def update_sales_data(
    content_id: int,
    manual_sales: int,
    manual_revenue: float,
    db: Session = Depends(get_db)
):
    """
    Update actual sales data for a content piece
    Creator manually enters: "This video earned X sales, $Y revenue"
    """
    try:
        content = db.query(ContentAnalysis).filter(
            ContentAnalysis.id == content_id
        ).first()

        if not content:
            raise HTTPException(status_code=404, detail="Content not found")

        content.manual_sales = manual_sales
        content.manual_revenue = manual_revenue

        db.commit()
        db.refresh(content)

        logger.info(f"Updated sales for content {content_id}: {manual_sales} sales, ${manual_revenue}")

        return {
            "id": content.id,
            "title": content.title,
            "sales": manual_sales,
            "revenue": manual_revenue,
            "roi": ((manual_revenue - 100) / 100) * 100
        }

    except Exception as e:
        logger.error(f"Error updating sales: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== COMMERCE SUGGESTIONS ====================

@router.get("/suggestions/{content_id}")
async def get_commerce_suggestions(content_id: int, db: Session = Depends(get_db)):
    """
    Get commerce moment suggestions for a content piece
    Returns: where to add products, what to say, what products to promote
    """
    try:
        content = db.query(ContentAnalysis).filter(
            ContentAnalysis.id == content_id
        ).first()

        if not content:
            raise HTTPException(status_code=404, detail="Content not found")

        # Get timing suggestions based on content type and duration
        timing_suggestions = get_timing_suggestions(content.content_type, content.duration_minutes)

        # Get product suggestions based on topic
        product_suggestions = get_product_suggestions(content.topic)

        # Get script templates
        templates = get_commerce_templates(content.content_type)

        return {
            "content_id": content.id,
            "title": content.title,
            "content_type": content.content_type,
            "topic": content.topic,
            "timing": timing_suggestions,
            "products": product_suggestions,
            "templates": templates,
            "revenue_potential": {
                "estimated": content.estimated_revenue,
                "revenue_per_minute": round(content.estimated_revenue / content.duration_minutes, 2) if content.duration_minutes else 0
            }
        }

    except Exception as e:
        logger.error(f"Error getting suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def get_timing_suggestions(content_type, duration_minutes):
    """
    Suggest optimal timing to add commerce moments based on content type
    """
    suggestions = {
        'Tutorial': [
            {
                "time_mark": "0:30",
                "percentage": 5,
                "type": "intro",
                "message": "Quick mention of product upfront",
                "example": "I'll show you how to do X using my favorite tool..."
            },
            {
                "time_mark": f"{int(duration_minutes * 0.5)}:00",
                "percentage": 50,
                "type": "mid",
                "message": "Main deep dive on how product helps",
                "example": "This is exactly what [Product] does best..."
            },
            {
                "time_mark": f"{duration_minutes - 1}:00",
                "percentage": 95,
                "type": "outro",
                "message": "Final CTA with link",
                "example": "Grab [Product] with code YOURNAME10"
            }
        ],
        'Review': [
            {
                "time_mark": "0:15",
                "percentage": 10,
                "type": "intro",
                "message": "Name the product immediately",
                "example": "Today reviewing the new [Product]..."
            },
            {
                "time_mark": f"{int(duration_minutes * 0.3)}:00",
                "percentage": 30,
                "type": "mid",
                "message": "Detailed product breakdown",
                "example": "Let's open it up and see what's inside..."
            },
            {
                "time_mark": f"{duration_minutes - 2}:00",
                "percentage": 95,
                "type": "outro",
                "message": "Final verdict and link",
                "example": "Highly recommended. Buy link below."
            }
        ],
        'How-To': [
            {
                "time_mark": "1:00",
                "percentage": 15,
                "type": "intro",
                "message": "What tool/product you'll use",
                "example": "We'll be using [Product] for this..."
            },
            {
                "time_mark": f"{int(duration_minutes * 0.6)}:00",
                "percentage": 60,
                "type": "mid",
                "message": "Show product in action",
                "example": "As you can see, [Product] makes this easy..."
            }
        ],
        'Q&A': [
            {
                "time_mark": f"{duration_minutes - 2}:00",
                "percentage": 95,
                "type": "outro",
                "message": "End of video mention only",
                "example": "If you liked these answers, check out [Product]"
            }
        ],
        'Educational': [
            {
                "time_mark": "0:45",
                "percentage": 10,
                "type": "intro",
                "message": "Introduce the tool/product",
                "example": "I use [Product] to teach all of this..."
            },
            {
                "time_mark": f"{int(duration_minutes * 0.5)}:00",
                "percentage": 50,
                "type": "mid",
                "message": "Demonstrate product benefits",
                "example": "This is where [Product] shines..."
            }
        ],
    }

    return suggestions.get(content_type, suggestions['Tutorial'])


def get_product_suggestions(topic):
    """
    Suggest products to promote based on content topic
    """
    product_map = {
        'Tech': [
            {'name': 'Programming courses', 'category': 'Educational'},
            {'name': 'Cloud hosting (AWS, Vercel)', 'category': 'Tools'},
            {'name': 'Code editors (VS Code extensions)', 'category': 'Tools'},
            {'name': 'API services (Stripe, Auth0)', 'category': 'Services'},
        ],
        'Fitness': [
            {'name': 'Workout plans/courses', 'category': 'Products'},
            {'name': 'Supplements', 'category': 'Products'},
            {'name': 'Fitness equipment', 'category': 'Products'},
            {'name': 'Nutrition guides', 'category': 'Digital Products'},
        ],
        'Finance': [
            {'name': 'Investment courses', 'category': 'Educational'},
            {'name': 'Stock trading tools', 'category': 'Services'},
            {'name': 'Crypto exchange (affiliate)', 'category': 'Affiliate'},
            {'name': 'Financial planning templates', 'category': 'Digital Products'},
        ],
        'Productivity': [
            {'name': 'Productivity courses', 'category': 'Educational'},
            {'name': 'Note-taking tools (Notion, OneNote)', 'category': 'Tools'},
            {'name': 'Project management tools', 'category': 'Tools'},
            {'name': 'Time management templates', 'category': 'Digital Products'},
        ],
        'Business': [
            {'name': 'Business courses', 'category': 'Educational'},
            {'name': 'Marketing tools', 'category': 'Tools'},
            {'name': 'Business coaching', 'category': 'Services'},
            {'name': 'Automation tools (Zapier, Make)', 'category': 'Tools'},
        ],
        'Lifestyle': [
            {'name': 'Lifestyle courses', 'category': 'Educational'},
            {'name': 'Fashion/beauty products', 'category': 'Products'},
            {'name': 'Travel guides/courses', 'category': 'Educational'},
        ],
    }

    return product_map.get(topic, [])


def get_commerce_templates(content_type):
    """
    Get script templates for adding commerce moments
    """
    templates = {
        'Tutorial': [
            {
                "name": "INTRO",
                "script": "I'm going to show you how to [do X]. And I'll be using [Product] throughout this—it's my absolute favorite tool for this."
            },
            {
                "name": "MID-VIDEO",
                "script": "This is exactly what [Product] solves. It saves me hours every week, and honestly, I can't imagine doing this without it."
            },
            {
                "name": "OUTRO",
                "script": "If you want to implement this yourself, grab [Product] with my code YOURNAME10 for 10% off. Link in the description."
            }
        ],
        'Review': [
            {
                "name": "OPENING",
                "script": "Today we're reviewing [Product]. I've been using this for [time period], and I want to give you my honest take."
            },
            {
                "name": "MIDDLE",
                "script": "What really impressed me about [Product] is... If you've used [competitor], here's how [Product] is better..."
            },
            {
                "name": "CLOSING",
                "script": "Bottom line: [Product] is worth the investment. I highly recommend it. My exclusive link with discount is in the description."
            }
        ],
        'How-To': [
            {
                "name": "SETUP",
                "script": "For this, you'll need [Product]. Here's the quick setup process..."
            },
            {
                "name": "WALKTHROUGH",
                "script": "Watch how [Product] makes this step incredibly simple..."
            },
            {
                "name": "RESULT",
                "script": "And that's it! [Product] saves us tons of time here. Get it with my link below."
            }
        ],
    }

    return templates.get(content_type, templates.get('Tutorial', []))


# ==================== CALENDAR ====================

@router.get("/calendar")
async def get_content_calendar(db: Session = Depends(get_db)):
    """
    Get content calendar with commerce recommendations
    Shows: Week view with content pieces and where to add products
    """
    try:
        # Get content ordered by publish date
        contents = db.query(ContentAnalysis).order_by(
            ContentAnalysis.publish_date.desc()
        ).limit(50).all()

        # Group by week
        from datetime import datetime, timedelta

        calendar = {}
        for content in contents:
            if not content.publish_date:
                continue

            week_start = content.publish_date - timedelta(days=content.publish_date.weekday())
            week_key = week_start.strftime("%Y-W%W")

            if week_key not in calendar:
                calendar[week_key] = []

            day_name = content.publish_date.strftime("%A")

            # Determine commerce recommendation
            if content.content_type == 'Tutorial':
                recommendation = "✅ Add 2-3 links"
                expected_revenue = content.estimated_revenue
            elif content.content_type == 'Review':
                recommendation = "✅ Add 3-4 links"
                expected_revenue = content.estimated_revenue * 1.2
            elif content.content_type == 'How-To':
                recommendation = "✅ Add 1-2 links"
                expected_revenue = content.estimated_revenue
            elif content.content_type == 'Q&A':
                recommendation = "⚠️ Add 1 link (outro only)"
                expected_revenue = content.estimated_revenue * 0.5
            else:
                recommendation = "❌ Skip for now"
                expected_revenue = content.estimated_revenue * 0.1

            calendar[week_key].append({
                "day": day_name,
                "title": content.title,
                "type": content.content_type,
                "recommendation": recommendation,
                "expected_revenue": round(expected_revenue, 2)
            })

        return calendar

    except Exception as e:
        logger.error(f"Error fetching calendar: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== INSIGHTS ====================

@router.get("/insights")
async def get_insights(db: Session = Depends(get_db)):
    """
    Get actionable insights from content data
    """
    try:
        contents = db.query(ContentAnalysis).all()

        if not contents:
            return {"insights": [], "recommendations": []}

        # Find best performing content type
        type_stats = {}
        for content in contents:
            if content.content_type not in type_stats:
                type_stats[content.content_type] = {
                    "count": 0,
                    "total_revenue": 0,
                    "avg_revenue": 0
                }
            type_stats[content.content_type]["count"] += 1
            type_stats[content.content_type]["total_revenue"] += content.estimated_revenue

        for key in type_stats:
            type_stats[key]["avg_revenue"] = type_stats[key]["total_revenue"] / type_stats[key]["count"]

        best_type = max(type_stats.items(), key=lambda x: x[1]["avg_revenue"])

        # Find best topic
        topic_stats = {}
        for content in contents:
            if content.topic not in topic_stats:
                topic_stats[content.topic] = {"count": 0, "total_revenue": 0}
            topic_stats[content.topic]["count"] += 1
            topic_stats[content.topic]["total_revenue"] += content.estimated_revenue

        best_topic = max(topic_stats.items(), key=lambda x: x[1]["total_revenue"])

        insights = [
            {
                "title": "Top Content Type",
                "value": best_type[0],
                "detail": f"${best_type[1]['avg_revenue']:.0f} avg revenue per video"
            },
            {
                "title": "Top Topic",
                "value": best_topic[0],
                "detail": f"${best_topic[1]['total_revenue']:.0f} total revenue"
            },
            {
                "title": "Total Content",
                "value": len(contents),
                "detail": f"${sum([c.estimated_revenue for c in contents]):.0f} potential revenue"
            }
        ]

        recommendations = [
            f"✅ Create more {best_type[0]} videos—they earn {best_type[1]['avg_revenue']:.0f} on average",
            f"✅ Focus on {best_topic[0]} content—it's your highest earner",
            "✅ Add 2-3 product links to Tutorial videos (70% conversion rate)",
            "✅ Use discount codes to track which content drives sales",
        ]

        return {
            "insights": insights,
            "recommendations": recommendations,
            "type_stats": type_stats,
            "topic_stats": topic_stats
        }

    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
