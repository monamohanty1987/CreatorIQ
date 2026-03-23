"""
Load YouTube data from Kaggle and transform for Content-to-Commerce
Creates realistic dataset with content + sales mapping
"""

import pandas as pd
import numpy as np
import sqlite3
from datetime import datetime, timedelta
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import engine
from models import Base

# ==================== KAGGLE DATA LOADING ====================

def load_youtube_data():
    """
    Load YouTube dataset from Kaggle
    Download from: https://www.kaggle.com/datasnaek/youtube-new

    If you don't have it, we'll create synthetic realistic data instead
    """

    # Try to load actual Kaggle data
    kaggle_paths = [
        'C:/kaggle/youtube-new/USvideos.csv',
        './data/USvideos.csv',
        '../data/USvideos.csv',
    ]

    df = None
    for path in kaggle_paths:
        if os.path.exists(path):
            try:
                print(f"Loading Kaggle data from {path}")
                df = pd.read_csv(path)
                print(f"✅ Loaded {len(df)} videos from Kaggle")
                return df
            except Exception as e:
                print(f"⚠️ Error loading {path}: {e}")

    # If no Kaggle data, create synthetic realistic data
    print("⚠️ Kaggle data not found. Creating synthetic realistic dataset...")
    return create_synthetic_data()


def create_synthetic_data():
    """
    Create realistic YouTube-like data for testing
    """
    np.random.seed(42)

    titles = [
        "10 Productivity Tips That Changed My Life",
        "How to Learn Python in 30 Days",
        "Complete Web Development Tutorial 2024",
        "Crypto Trading for Beginners",
        "Fitness Transformation: 90 Day Challenge",
        "Digital Marketing Strategy Guide",
        "AI Tools You Need to Know About",
        "Product Review: Best Laptops 2024",
        "Q&A: Your Questions Answered",
        "Day in My Life as a Developer",
        "Stock Market Investing 101",
        "UI/UX Design Process Explained",
        "Passive Income Ideas",
        "Freelance Writing Guide",
        "Email Marketing Secrets",
    ]

    categories = [
        "Tutorial", "Tutorial", "Tutorial", "Tutorial",
        "Tutorial", "Tutorial", "Tutorial",
        "Review", "Review", "Review",
        "Vlog", "Vlog", "Vlog",
        "Q&A", "Educational"
    ]

    data = []
    for i in range(150):  # Create 150 videos
        title = f"{titles[i % len(titles)]} #{i//len(titles) + 1}" if i >= len(titles) else titles[i]
        category = categories[i % len(categories)]

        views = np.random.randint(5000, 500000)
        likes = int(views * np.random.uniform(0.01, 0.1))
        comments = int(likes * np.random.uniform(0.1, 0.5))
        duration = np.random.randint(5, 120)  # 5-120 minutes

        # Engagement rate
        engagement = (likes + comments) / views if views > 0 else 0

        # Upload date (spread over last 6 months)
        days_ago = np.random.randint(1, 180)
        publish_time = datetime.now() - timedelta(days=days_ago)

        data.append({
            'title': title,
            'category': category,
            'views': views,
            'likes': likes,
            'comments': comments,
            'duration_minutes': duration,
            'engagement_rate': engagement,
            'publish_date': publish_time,
        })

    df = pd.DataFrame(data)
    print(f"✅ Created synthetic dataset with {len(df)} videos")
    return df


# ==================== CONTENT TYPE CLASSIFICATION ====================

def classify_content_type(title, category):
    """
    Classify content into: Tutorial, Review, How-To, Q&A, Entertainment, Vlog
    """
    title_lower = title.lower()

    if any(word in title_lower for word in ['tutorial', 'learn', 'how to', 'guide', 'course', 'lesson', 'step by step']):
        return 'Tutorial'
    elif any(word in title_lower for word in ['review', 'unboxing', 'test', 'comparison']):
        return 'Review'
    elif any(word in title_lower for word in ['how to', 'setup', 'install', 'configure', 'hack']):
        return 'How-To'
    elif any(word in title_lower for word in ['q&a', 'questions answered', 'ask me', 'faq']):
        return 'Q&A'
    elif any(word in title_lower for word in ['day in my life', 'vlog', 'day vlog', 'daily', 'routine']):
        return 'Vlog'
    elif category in ['Entertainment', 'Comedy', 'Music']:
        return 'Entertainment'
    else:
        return 'Educational'


def classify_topic(title):
    """
    Classify content topic: Tech, Fitness, Finance, Productivity, Business, Lifestyle, etc.
    """
    title_lower = title.lower()

    topic_keywords = {
        'Tech': ['python', 'programming', 'code', 'software', 'web', 'app', 'javascript', 'react', 'ai', 'machine learning', 'tech', 'computer'],
        'Fitness': ['fitness', 'workout', 'exercise', 'gym', 'transformation', 'training', 'yoga', 'health'],
        'Finance': ['crypto', 'bitcoin', 'stock', 'investing', 'trading', 'money', 'financial', 'passive income'],
        'Productivity': ['productivity', 'habit', 'organization', 'time management', 'efficiency'],
        'Business': ['business', 'entrepreneurship', 'startup', 'marketing', 'sales', 'freelance'],
        'Education': ['learn', 'course', 'tutorial', 'skill', 'education'],
        'Lifestyle': ['vlog', 'daily', 'lifestyle', 'day in my life', 'routine', 'fashion', 'lifestyle'],
    }

    for topic, keywords in topic_keywords.items():
        if any(keyword in title_lower for keyword in keywords):
            return topic

    return 'General'


# ==================== REVENUE ESTIMATION ====================

def estimate_sales_from_views(views, engagement_rate, content_type, topic):
    """
    Estimate sales based on:
    - Views
    - Engagement rate
    - Content type conversion rates
    - Topic conversion rates
    """

    # Content type conversion rates (%)
    type_conversion = {
        'Tutorial': 0.70,      # 70% conversion
        'Review': 0.75,        # 75% conversion
        'How-To': 0.55,        # 55% conversion
        'Q&A': 0.30,           # 30% conversion
        'Educational': 0.60,   # 60% conversion
        'Vlog': 0.15,          # 15% conversion
        'Entertainment': 0.10, # 10% conversion
    }

    # Topic multipliers
    topic_multiplier = {
        'Tech': 1.3,
        'Finance': 1.45,
        'Business': 1.38,
        'Fitness': 1.20,
        'Productivity': 1.25,
        'Education': 1.15,
        'Lifestyle': 1.0,
        'General': 1.0,
    }

    # Calculate engaged viewers (people who would click/buy)
    engaged_viewers = views * engagement_rate

    # Apply content type conversion
    conversion_rate = type_conversion.get(content_type, 0.50)
    potential_buyers = engaged_viewers * conversion_rate

    # Apply topic multiplier
    multiplier = topic_multiplier.get(topic, 1.0)
    estimated_sales = int(potential_buyers * multiplier)

    return estimated_sales


def estimate_revenue(sales, content_type):
    """
    Estimate revenue per sale based on content type

    Tutorial courses: $47-97
    Review affiliate: $20-50
    How-To products: $30-100
    Q&A: $0-20 (optional)
    Educational: $20-50
    Vlog: $0-10
    """

    price_ranges = {
        'Tutorial': (47, 97),
        'Review': (20, 50),
        'How-To': (30, 100),
        'Q&A': (0, 20),
        'Educational': (20, 50),
        'Vlog': (0, 10),
        'Entertainment': (0, 5),
    }

    price_range = price_ranges.get(content_type, (20, 50))
    avg_price = np.mean(price_range)

    return int(sales * avg_price)


# ==================== DATABASE INSERTION ====================

def insert_content_data(df):
    """
    Transform YouTube data and insert into SQLite database using SQLAlchemy ORM
    """

    from models import ContentAnalysis
    from database import SessionLocal

    # Create tables first
    try:
        Base.metadata.create_all(bind=engine)
        print("  ✅ Database tables created")
    except Exception as e:
        print(f"  ⚠️ Table creation: {e}")

    # Get database session
    db = SessionLocal()

    try:
        # Clear existing data
        db.query(ContentAnalysis).delete()
        db.commit()
        print("  ✅ Cleared existing content data")
    except Exception as e:
        print(f"  ℹ️ No existing data to clear: {e}")
        db.rollback()

    inserted = 0

    for idx, row in df.iterrows():
        try:
            # Classify content
            content_type = classify_content_type(row['title'], row.get('category', 'General'))
            topic = classify_topic(row['title'])

            # Estimate sales and revenue
            estimated_sales = estimate_sales_from_views(
                row['views'],
                row['engagement_rate'],
                content_type,
                topic
            )

            estimated_revenue = estimate_revenue(estimated_sales, content_type)

            # Create ContentAnalysis object
            content = ContentAnalysis(
                title=row['title'],
                platform='YouTube',
                content_type=content_type,
                topic=topic,
                views=int(row['views']),
                engagement_rate=float(row['engagement_rate']),
                duration_minutes=int(row['duration_minutes']),
                estimated_sales=estimated_sales,
                estimated_revenue=estimated_revenue,
                publish_date=row['publish_date']
            )

            db.add(content)
            inserted += 1

            if inserted % 20 == 0:
                db.commit()
                print(f"  ✅ Inserted {inserted} content pieces...")

        except Exception as e:
            print(f"⚠️ Error inserting row {idx}: {e}")
            db.rollback()
            continue

    # Final commit
    db.commit()
    db.close()

    print(f"\n✅ Successfully inserted {inserted} content pieces into database")
    return inserted


# ==================== VERIFICATION ====================

def verify_data():
    """
    Display sample data and statistics
    """
    from models import ContentAnalysis
    from database import SessionLocal
    from sqlalchemy import func

    db = SessionLocal()

    # Sample data
    print("\n" + "="*80)
    print("SAMPLE CONTENT DATA")
    print("="*80)

    samples = db.query(ContentAnalysis).limit(10).all()
    print(f"\n{'Title':<40} {'Type':<15} {'Topic':<12} {'Views':>10} {'Sales':>8} {'Revenue':>10}")
    print("-" * 95)
    for content in samples:
        print(f"{content.title[:39]:<40} {content.content_type:<15} {content.topic:<12} {content.views:>10,} {content.estimated_sales:>8} ${content.estimated_revenue:>9,}")

    # Statistics by content type
    print("\n" + "="*80)
    print("STATISTICS BY CONTENT TYPE")
    print("="*80)

    type_stats = db.query(
        ContentAnalysis.content_type,
        func.count(ContentAnalysis.id).label('count'),
        func.round(func.avg(ContentAnalysis.views), 0).label('avg_views'),
        func.round(func.avg(ContentAnalysis.estimated_sales), 0).label('avg_sales'),
        func.round(func.avg(ContentAnalysis.estimated_revenue), 0).label('avg_revenue')
    ).group_by(ContentAnalysis.content_type).order_by(func.round(func.avg(ContentAnalysis.estimated_revenue), 0).desc()).all()

    print(f"\n{'Content Type':<15} {'Count':>8} {'Avg Views':>12} {'Avg Sales':>12} {'Avg Revenue':>12}")
    print("-" * 60)
    for stat in type_stats:
        print(f"{stat[0]:<15} {stat[1]:>8} {int(stat[2]):>12,} {int(stat[3]):>12} ${int(stat[4]):>11,}")

    # Topic breakdown
    print("\n" + "="*80)
    print("STATISTICS BY TOPIC")
    print("="*80)

    topic_stats = db.query(
        ContentAnalysis.topic,
        func.count(ContentAnalysis.id).label('count'),
        func.round(func.avg(ContentAnalysis.estimated_revenue), 0).label('avg_revenue')
    ).group_by(ContentAnalysis.topic).order_by(func.round(func.avg(ContentAnalysis.estimated_revenue), 0).desc()).all()

    print(f"\n{'Topic':<15} {'Count':>8} {'Avg Revenue':>12}")
    print("-" * 37)
    for stat in topic_stats:
        print(f"{stat[0]:<15} {stat[1]:>8} ${int(stat[2]):>11,}")

    # Total metrics
    total = db.query(
        func.count(ContentAnalysis.id).label('total_content'),
        func.sum(ContentAnalysis.estimated_sales).label('total_sales'),
        func.sum(ContentAnalysis.estimated_revenue).label('total_revenue')
    ).first()

    print("\n" + "="*80)
    print("TOTAL POTENTIAL REVENUE")
    print("="*80)
    print(f"Total content pieces: {total[0]:,}")
    print(f"Total estimated sales: {int(total[1]) if total[1] else 0:,}")
    print(f"Total potential revenue: ${int(total[2]) if total[2] else 0:,}")

    db.close()


# ==================== MAIN ====================

def main():
    print("\n" + "="*80)
    print("CREATORIQ - CONTENT-TO-COMMERCE DATA PIPELINE")
    print("="*80)

    # Step 1: Load data
    print("\n[1] Loading YouTube data...")
    df = load_youtube_data()

    # Step 2: Transform
    print("\n[2] Transforming data...")
    print(f"   Total videos: {len(df)}")

    # Step 3: Insert
    print("\n[3] Inserting into database...")
    inserted = insert_content_data(df)

    # Step 4: Verify
    print("\n[4] Verifying data...")
    verify_data()

    print("\n" + "="*80)
    print("✅ DATA PIPELINE COMPLETE")
    print("="*80)
    print("\nNext step: Start FastAPI backend and dashboard will show real data!")
    print("\nTo run dashboard:")
    print("  1. Backend: python backend/app.py")
    print("  2. Frontend: npm run dev")
    print("  3. Open: http://localhost:3000")


if __name__ == "__main__":
    main()
