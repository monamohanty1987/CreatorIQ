"""
Content Repurposing Routes
API endpoints for converting content into multiple formats
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
import logging
import re
import yt_dlp
import requests

from database import get_db
from models import ContentRepurpose
from services.content_repurpose_service import repurpose_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/repurpose", tags=["content-repurpose"])


class RepurposeRequest(BaseModel):
    creator_name: str
    content_title: str
    original_content: str
    content_type: str = "blog"
    topic: str
    niche: str
    target_audience: str = "General audience"


class YouTubeExtractionRequest(BaseModel):
    youtube_url: str
    content_title: str = None
    topic: str = None
    niche: str = None
    target_audience: str = "General audience"
    creator_name: str = "User"


@router.post("/generate")
async def generate_repurposed_content(
    request: RepurposeRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Generate repurposed content in 7 formats

    Request:
        POST /api/repurpose/generate
        {
            "creator_name": "Sarah",
            "content_title": "10 Minute Workout",
            "original_content": "transcript or blog text here...",
            "content_type": "video",
            "topic": "Fitness",
            "niche": "Weight Loss",
            "target_audience": "Women 25-40"
        }

    Returns:
        {
            "repurpose_id": 1,
            "status": "completed",
            "tiktok_scripts": [...],
            "instagram_captions": [...],
            "twitter_thread": [...],
            ...
        }
    """
    try:
        logger.info(f"Repurposing content for {request.creator_name}: {request.content_title}")

        # Create database record (initially processing)
        content_repurpose = ContentRepurpose(
            creator_name=request.creator_name,
            content_title=request.content_title,
            original_content=request.original_content,
            content_type=request.content_type,
            topic=request.topic,
            niche=request.niche,
            target_audience=request.target_audience,
            status="processing"
        )
        db.add(content_repurpose)
        db.commit()
        db.refresh(content_repurpose)

        logger.info(f"Database record created (ID: {content_repurpose.id})")

        # Call repurposing service
        repurposed_data = await repurpose_service.repurpose_content(
            original_content=request.original_content,
            content_type=request.content_type,
            content_title=request.content_title,
            topic=request.topic,
            niche=request.niche,
            target_audience=request.target_audience
        )

        # Update database with results
        content_repurpose.status = repurposed_data.get("status", "completed")
        content_repurpose.tiktok_scripts = repurposed_data.get("tiktok_scripts")
        content_repurpose.instagram_captions = repurposed_data.get("instagram_captions")
        content_repurpose.twitter_thread = repurposed_data.get("twitter_thread")
        content_repurpose.blog_post = repurposed_data.get("blog_post")
        content_repurpose.email_scripts = repurposed_data.get("email_scripts")
        content_repurpose.podcast_notes = repurposed_data.get("podcast_notes")
        content_repurpose.linkedin_post = repurposed_data.get("linkedin_post")
        content_repurpose.hashtags = repurposed_data.get("hashtags")
        content_repurpose.best_posting_times = repurposed_data.get("best_posting_times")
        content_repurpose.engagement_forecast = repurposed_data.get("engagement_forecast")
        content_repurpose.processing_time_seconds = repurposed_data.get("processing_time_seconds")
        content_repurpose.error_message = repurposed_data.get("error")

        db.commit()
        db.refresh(content_repurpose)

        logger.info(f"Content repurposing completed (ID: {content_repurpose.id})")

        return {
            "repurpose_id": content_repurpose.id,
            "status": content_repurpose.status,
            "creator_name": request.creator_name,
            "content_title": request.content_title,
            "processing_time_seconds": content_repurpose.processing_time_seconds,
            "formats_generated": 7,
            "summary": {
                "tiktok_scripts": len(content_repurpose.tiktok_scripts) if content_repurpose.tiktok_scripts else 0,
                "instagram_captions": len(content_repurpose.instagram_captions) if content_repurpose.instagram_captions else 0,
                "twitter_tweets": len(content_repurpose.twitter_thread) if content_repurpose.twitter_thread else 0,
                "blog_post": "generated" if content_repurpose.blog_post else "failed",
                "email_versions": len(content_repurpose.email_scripts) if isinstance(content_repurpose.email_scripts, dict) else 0,
                "podcast_elements": "generated" if content_repurpose.podcast_notes else "failed",
                "linkedin_post": "generated" if content_repurpose.linkedin_post else "failed"
            },
            "tiktok_scripts": content_repurpose.tiktok_scripts,
            "instagram_captions": content_repurpose.instagram_captions,
            "twitter_thread": content_repurpose.twitter_thread,
            "blog_post": content_repurpose.blog_post,
            "email_scripts": content_repurpose.email_scripts,
            "podcast_notes": content_repurpose.podcast_notes,
            "linkedin_post": content_repurpose.linkedin_post,
            "hashtags": content_repurpose.hashtags,
            "best_posting_times": content_repurpose.best_posting_times,
            "engagement_forecast": content_repurpose.engagement_forecast,
            "created_at": content_repurpose.created_at.isoformat()
        }

    except Exception as e:
        logger.error(f"Error generating repurposed content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def extract_youtube_video_id(url: str) -> str:
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
        r'youtube\.com\/embed\/([^&\n?#]+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    raise ValueError("Invalid YouTube URL")


@router.post("/extract-youtube")
async def extract_youtube_transcript(
    request: YouTubeExtractionRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Extract transcript from YouTube video and prepare for repurposing

    Request:
        POST /api/repurpose/extract-youtube
        {
            "youtube_url": "https://www.youtube.com/watch?v=xyz...",
            "content_title": "Video Title (optional, will use video title if not provided)",
            "topic": "Marketing",
            "niche": "Digital Marketing",
            "target_audience": "Entrepreneurs",
            "creator_name": "Sarah"
        }

    Returns:
        {
            "video_id": "xyz...",
            "video_title": "Extracted from video",
            "transcript": "Full transcript text...",
            "original_content": "Processed transcript...",
            "ready_for_repurposing": true
        }
    """
    try:
        # Extract video ID
        video_id = extract_youtube_video_id(request.youtube_url)
        logger.info(f"Extracted YouTube video ID: {video_id}")

        # Get transcript using yt-dlp (supports both manual and automatic captions)
        ydl_opts = {
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['en'],
            'skip_download': True,  # Only download subtitles, not the video
            'quiet': True,
        }

        transcript_text = None
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(request.youtube_url, download=False)

                # Try manual subtitles first, then automatic captions
                subtitles = info.get('subtitles', {}).get('en') or info.get('automatic_captions', {}).get('en')

                if not subtitles:
                    raise ValueError("No English subtitles found for this video")

                # Get subtitle URL and fetch the content
                sub_url = subtitles[0]['url']
                sub_data = requests.get(sub_url).text

                # Try to parse as JSON first (YouTube's newer format)
                try:
                    import json
                    json_data = json.loads(sub_data)
                    # Handle YouTube's JSON subtitle format
                    if 'events' in json_data:
                        lines = []
                        for event in json_data['events']:
                            if 'segs' in event:
                                for seg in event['segs']:
                                    if 'utf8' in seg and seg['utf8'].strip():
                                        lines.append(seg['utf8'].strip())
                        transcript_text = ' '.join(lines)
                    else:
                        # Generic JSON format, try to extract text
                        transcript_text = json.dumps(json_data)
                except json.JSONDecodeError:
                    # Not JSON, try VTT format
                    lines = []
                    for line in sub_data.split('\n'):
                        # Skip VTT header and timestamp lines
                        if line.startswith('WEBVTT') or '-->' in line or line.strip() == '':
                            continue
                        if line.strip():
                            lines.append(line.strip())
                    transcript_text = ' '.join(lines)

                # If still no transcript, raise error
                if not transcript_text or transcript_text.startswith('{'):
                    raise ValueError("Could not parse subtitle format")

        except Exception as yt_error:
            logger.error(f"yt-dlp extraction failed: {str(yt_error)}")
            raise ValueError(f"Could not extract transcript: {str(yt_error)}")

        logger.info(f"Successfully extracted transcript from video: {video_id} using yt-dlp")

        # Use provided title or default
        content_title = request.content_title or f"YouTube Video: {video_id}"

        # Process transcript (clean up and prepare)
        # Ensure minimum 50 characters for backend validation
        processed_content = transcript_text.strip()

        if not processed_content:
            raise HTTPException(
                status_code=400,
                detail="Transcript is empty. YouTube video must have valid transcript."
            )

        return {
            "video_id": video_id,
            "video_title": content_title,
            "transcript_length": len(processed_content),
            "transcript_preview": processed_content[:200] + "...",
            "original_content": processed_content,
            "ready_for_repurposing": True,
            "message": "YouTube transcript extracted successfully! You can now repurpose this content."
        }

    except ValueError as e:
        logger.error(f"Invalid YouTube URL: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid YouTube URL format")
    except Exception as e:
        logger.error(f"Error extracting YouTube transcript: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract transcript: {str(e)}. The video may be private, have no captions, or the URL may be invalid."
        )


@router.get("/history")
async def get_repurpose_history(
    creator_name: str = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get repurposing history for a creator"""
    try:
        query = db.query(ContentRepurpose)

        if creator_name:
            query = query.filter(ContentRepurpose.creator_name == creator_name)

        repurposes = query.order_by(ContentRepurpose.created_at.desc()).limit(limit).all()

        return {
            "total": len(repurposes),
            "history": [repurpose.to_dict() for repurpose in repurposes]
        }

    except Exception as e:
        logger.error(f"Error fetching repurpose history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{repurpose_id}")
async def get_repurposed_content(
    repurpose_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed repurposed content by ID"""
    try:
        repurpose = db.query(ContentRepurpose).filter(
            ContentRepurpose.id == repurpose_id
        ).first()

        if not repurpose:
            raise HTTPException(status_code=404, detail="Repurposed content not found")

        return {
            "id": repurpose.id,
            "creator_name": repurpose.creator_name,
            "content_title": repurpose.content_title,
            "content_type": repurpose.content_type,
            "topic": repurpose.topic,
            "niche": repurpose.niche,
            "target_audience": repurpose.target_audience,
            "status": repurpose.status,
            "formats": {
                "tiktok": {
                    "count": len(repurpose.tiktok_scripts) if repurpose.tiktok_scripts else 0,
                    "scripts": repurpose.tiktok_scripts
                },
                "instagram": {
                    "count": len(repurpose.instagram_captions) if repurpose.instagram_captions else 0,
                    "captions": repurpose.instagram_captions
                },
                "twitter": {
                    "count": len(repurpose.twitter_thread) if repurpose.twitter_thread else 0,
                    "thread": repurpose.twitter_thread
                },
                "blog": {
                    "post": repurpose.blog_post[:500] + "..." if repurpose.blog_post else None,
                    "full_post": repurpose.blog_post
                },
                "email": {
                    "versions": repurpose.email_scripts
                },
                "podcast": {
                    "notes": repurpose.podcast_notes
                },
                "linkedin": {
                    "post": repurpose.linkedin_post
                }
            },
            "metadata": {
                "hashtags": repurpose.hashtags,
                "best_posting_times": repurpose.best_posting_times,
                "engagement_forecast": repurpose.engagement_forecast,
                "processing_time_seconds": repurpose.processing_time_seconds
            },
            "created_at": repurpose.created_at.isoformat(),
            "updated_at": repurpose.updated_at.isoformat() if repurpose.updated_at else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching repurposed content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/{repurpose_id}/{format_type}")
async def export_format(
    repurpose_id: int,
    format_type: str,  # "tiktok", "instagram", "twitter", "blog", "email", "podcast", "linkedin"
    db: Session = Depends(get_db)
):
    """Export specific format as JSON or text"""
    try:
        repurpose = db.query(ContentRepurpose).filter(
            ContentRepurpose.id == repurpose_id
        ).first()

        if not repurpose:
            raise HTTPException(status_code=404, detail="Repurposed content not found")

        format_map = {
            "tiktok": repurpose.tiktok_scripts,
            "instagram": repurpose.instagram_captions,
            "twitter": repurpose.twitter_thread,
            "blog": repurpose.blog_post,
            "email": repurpose.email_scripts,
            "podcast": repurpose.podcast_notes,
            "linkedin": repurpose.linkedin_post
        }

        content = format_map.get(format_type)

        if not content:
            raise HTTPException(status_code=404, detail=f"Format {format_type} not found")

        return {
            "format": format_type,
            "content_title": repurpose.content_title,
            "content": content,
            "hashtags": repurpose.hashtags.get(format_type, []) if repurpose.hashtags else [],
            "best_posting_time": repurpose.best_posting_times.get(format_type) if repurpose.best_posting_times else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting format: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/{creator_name}")
async def get_repurposing_stats(
    creator_name: str,
    db: Session = Depends(get_db)
):
    """Get repurposing statistics for a creator"""
    try:
        repurposes = db.query(ContentRepurpose).filter(
            ContentRepurpose.creator_name == creator_name
        ).all()

        if not repurposes:
            return {
                "creator_name": creator_name,
                "total_repurposes": 0,
                "stats": {}
            }

        total = len(repurposes)
        successful = len([r for r in repurposes if r.status == "completed"])
        avg_processing_time = sum(r.processing_time_seconds for r in repurposes if r.processing_time_seconds) / max(1, len([r for r in repurposes if r.processing_time_seconds]))

        # Count generated formats
        tiktok_count = len([r for r in repurposes if r.tiktok_scripts])
        instagram_count = len([r for r in repurposes if r.instagram_captions])
        twitter_count = len([r for r in repurposes if r.twitter_thread])
        blog_count = len([r for r in repurposes if r.blog_post])
        email_count = len([r for r in repurposes if r.email_scripts])
        podcast_count = len([r for r in repurposes if r.podcast_notes])
        linkedin_count = len([r for r in repurposes if r.linkedin_post])

        return {
            "creator_name": creator_name,
            "total_repurposes": total,
            "successful": successful,
            "success_rate": f"{(successful/total)*100:.1f}%" if total > 0 else "0%",
            "avg_processing_time_seconds": round(avg_processing_time, 2),
            "formats_generated": {
                "tiktok": tiktok_count,
                "instagram": instagram_count,
                "twitter": twitter_count,
                "blog": blog_count,
                "email": email_count,
                "podcast": podcast_count,
                "linkedin": linkedin_count
            },
            "total_formats_generated": tiktok_count + instagram_count + twitter_count + blog_count + email_count + podcast_count + linkedin_count
        }

    except Exception as e:
        logger.error(f"Error fetching repurposing stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
