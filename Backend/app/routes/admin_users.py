from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.logs import LoginHistory
from app.routes.admin import get_current_user_role
from app.crud.user_crud import get_user_by_id, get_password_hash
from pydantic import BaseModel, EmailStr

router = APIRouter()

# --- Schemas ---
class UserEditRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile_number: Optional[str] = None
    role: Optional[str] = None

class UserStatusRequest(BaseModel):
    is_active: bool

class PasswordResetRequest(BaseModel):
    password: str

# --- Endpoints ---

@router.get("/{user_id}/history")
def get_user_login_history(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user_role)
):
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    logs = db.query(LoginHistory).filter(LoginHistory.user_id == user_id).order_by(desc(LoginHistory.timestamp)).limit(50).all()
    return logs

@router.put("/{user_id}")
def update_user_details(
    user_id: str,
    user_update: UserEditRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user_role)
):
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_update.first_name: user.first_name = user_update.first_name
    if user_update.last_name: user.last_name = user_update.last_name
    if user_update.email: user.email = user_update.email
    if user_update.mobile_number: user.mobile_number = user_update.mobile_number
    if user_update.role: user.role = user_update.role
    
    db.commit()
    db.refresh(user)
    return {"message": "User updated successfully", "user": user}

@router.patch("/{user_id}/status")
def update_user_status(
    user_id: str,
    status: UserStatusRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user_role)
):
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = status.is_active
    db.commit()
    return {"message": f"User {'activated' if status.is_active else 'deactivated'} successfully"}

@router.post("/{user_id}/reset-password")
def admin_reset_password(
    user_id: str,
    reset: PasswordResetRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user_role)
):
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.password = get_password_hash(reset.password)
    db.commit()
    return {"message": "Password reset successfully"}
