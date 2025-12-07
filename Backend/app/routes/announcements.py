from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.announcement import Announcement
from app.models.user import User
from app.routes.auth import get_current_user

router = APIRouter()

@router.get("/active")
def get_active_announcements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    # Only return the most recent active announcement for the banner
    announcement = db.query(Announcement)\
        .filter(Announcement.is_active == True)\
        .order_by(desc(Announcement.created_at))\
        .first()
        
    if not announcement:
        return None
        
    return announcement
