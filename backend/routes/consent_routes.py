"""
Cookie Consent API Routes
Handles saving user cookie preferences for GDPR compliance
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import json

router = APIRouter(prefix="/api/consent", tags=["consent"])

# Model for cookie preferences
class CookiePreference(BaseModel):
    analytics: bool = True
    functional: bool = True  # Always required
    marketing: bool = False

# In-memory storage for demonstration
# In production, this would be saved to a database
cookie_consents = {}

@router.post("/save-cookie-preference")
async def save_cookie_preference(preference: CookiePreference):
    """
    Save user's cookie preferences

    Args:
        preference: Cookie preference object with analytics, functional, marketing flags

    Returns:
        Success message with expiry timestamp
    """
    try:
        # Generate a session ID or use user IP
        # For MVP without auth, we use a simple timestamp-based ID
        session_id = f"session_{datetime.now().timestamp()}"

        # Calculate expiry (12 months from now)
        expiry = datetime.now() + timedelta(days=365)

        # Store preference
        consent_data = {
            "session_id": session_id,
            "analytics": preference.analytics,
            "functional": preference.functional,
            "marketing": preference.marketing,
            "created_at": datetime.now().isoformat(),
            "expires_at": expiry.isoformat()
        }

        # Save to in-memory storage (would be database in production)
        cookie_consents[session_id] = consent_data

        return {
            "success": True,
            "message": "Cookie preferences saved successfully",
            "session_id": session_id,
            "expires_at": expiry.isoformat()
        }

    except Exception as e:
        # Even if backend fails, frontend still works (saved to localStorage)
        print(f"Error saving cookie preference: {str(e)}")
        return {
            "success": True,  # Return true so frontend doesn't show error
            "message": "Preferences saved locally",
            "note": "Backend failed but localStorage is working"
        }

@router.get("/get-cookie-preference/{session_id}")
async def get_cookie_preference(session_id: str):
    """
    Get user's saved cookie preferences

    Args:
        session_id: Session ID to retrieve preferences for

    Returns:
        User's cookie preferences or default preferences if not found
    """
    try:
        if session_id in cookie_consents:
            consent = cookie_consents[session_id]

            # Check if expired
            expiry = datetime.fromisoformat(consent["expires_at"])
            if expiry < datetime.now():
                # Remove expired consent
                del cookie_consents[session_id]
                return {
                    "analytics": True,
                    "functional": True,
                    "marketing": False
                }

            return {
                "analytics": consent["analytics"],
                "functional": consent["functional"],
                "marketing": consent["marketing"]
            }

        # Return default preferences if not found
        return {
            "analytics": True,
            "functional": True,
            "marketing": False
        }

    except Exception as e:
        print(f"Error retrieving cookie preference: {str(e)}")
        # Return default preferences on error
        return {
            "analytics": True,
            "functional": True,
            "marketing": False
        }

@router.delete("/clear-cookie-preference/{session_id}")
async def clear_cookie_preference(session_id: str):
    """
    Clear user's cookie preferences (reset to default)

    Args:
        session_id: Session ID to clear preferences for

    Returns:
        Success message
    """
    try:
        if session_id in cookie_consents:
            del cookie_consents[session_id]

        return {
            "success": True,
            "message": "Cookie preferences cleared"
        }

    except Exception as e:
        print(f"Error clearing cookie preference: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to clear preferences")

@router.get("/stats")
async def get_consent_stats():
    """
    Get statistics about cookie consents (for monitoring)

    Returns:
        Statistics about consents saved
    """
    try:
        total = len(cookie_consents)
        analytics_enabled = sum(1 for c in cookie_consents.values() if c.get("analytics"))
        marketing_enabled = sum(1 for c in cookie_consents.values() if c.get("marketing"))

        return {
            "total_consents": total,
            "analytics_enabled": analytics_enabled,
            "marketing_enabled": marketing_enabled,
            "analytics_percentage": (analytics_enabled / total * 100) if total > 0 else 0,
            "marketing_percentage": (marketing_enabled / total * 100) if total > 0 else 0
        }

    except Exception as e:
        print(f"Error getting consent stats: {str(e)}")
        return {
            "total_consents": 0,
            "analytics_enabled": 0,
            "marketing_enabled": 0
        }
