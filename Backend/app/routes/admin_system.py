from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.trade import Trade
from app.models.logs import LoginHistory
from app.models.announcement import Announcement
from app.routes.admin import get_current_user_role
from pydantic import BaseModel

router = APIRouter()

# --- Schemas ---
class AnnouncementCreate(BaseModel):
    title: str
    content: str

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_active: Optional[bool] = None

# --- Endpoints ---

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user_role)
):
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_users = db.query(User).count()
    total_trades = db.query(Trade).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # Calculate some activity metrics
    one_day_ago = datetime.utcnow() - timedelta(days=1)
    new_users_24h = db.query(User).filter(User.created_at >= one_day_ago).count()
    trades_24h = db.query(Trade).filter(Trade.close_time >= one_day_ago).count()
    
    return {
        "total_users": total_users,
        "total_trades": total_trades,
        "active_users": active_users,
        "new_users_24h": new_users_24h,
        "trades_24h": trades_24h
    }

@router.get("/logs/login")
def get_login_logs(
    skip: int = 0, 
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user_role)
):
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    logs = db.query(LoginHistory).order_by(desc(LoginHistory.timestamp)).offset(skip).limit(limit).all()
    # Populate user email for easier reading if user still exists
    # Or just return raw log and let frontend handle
    # Let's map it if possible to include user email
    
    result = []
    for log in logs:
        user_email = "Unknown"
        if log.user:
            user_email = log.user.email
        elif log.user_id:
            # Fallback if relationship not autoloaded, though it should be
            u = db.query(User).filter(User.user_id == log.user_id).first()
            if u: user_email = u.email
            
        result.append({
            "id": log.id,
            "user_id": log.user_id,
            "email": user_email,
            "ip_address": log.ip_address,
            "status": log.status,
            "timestamp": log.timestamp
        })
        
    return result

@router.post("/announcements")
def create_announcement(
    announcement: AnnouncementCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user_role)
):
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    new_announcement = Announcement(
        title=announcement.title,
        content=announcement.content,
        is_active=True
    )
    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)
    return new_announcement

@router.get("/announcements")
def get_announcements(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user_role)
):
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Auto-delete announcements older than 24 hours
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    old_announcements = db.query(Announcement).filter(
        Announcement.created_at < twenty_four_hours_ago
    ).all()
    
    for announcement in old_announcements:
        db.delete(announcement)
    
    if old_announcements:
        db.commit()
    
    # Return all remaining announcements
    return db.query(Announcement).order_by(desc(Announcement.created_at)).all()

@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user_role)
):
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    db.delete(announcement)
    db.commit()
    
    return {"message": "Announcement deleted successfully"}
