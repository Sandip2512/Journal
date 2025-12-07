from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.trade import Trade
from app.models.user import User
from app.routes.admin import get_current_user_role
from pydantic import BaseModel

router = APIRouter()

# --- Schemas ---
class TradeEditRequest(BaseModel):
    mistake: Optional[str] = None
    reason: Optional[str] = None
    profit_amount: Optional[float] = None
    loss_amount: Optional[float] = None
    # Add other editable fields as needed

# --- Endpoints ---
@router.get("/")
def get_all_trades(
    user_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user_role)
):
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    query = db.query(Trade)
    
    if user_id:
        query = query.filter(Trade.user_id == user_id)
        
    if start_date:
        query = query.filter(Trade.close_time >= start_date)
        
    if end_date:
        query = query.filter(Trade.close_time <= end_date)
        
    trades = query.order_by(desc(Trade.close_time)).offset(skip).limit(limit).all()
    count = query.count()
    
    return {"trades": trades, "total": count}

@router.put("/{trade_id}")
def update_trade(
    trade_id: int,
    trade_update: TradeEditRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user_role)
):
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    trade = db.query(Trade).filter(Trade.id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
        
    if trade_update.mistake is not None:
        trade.mistake = trade_update.mistake
    if trade_update.reason is not None:
        trade.reason = trade_update.reason
    if trade_update.profit_amount is not None:
        trade.profit_amount = trade_update.profit_amount
    if trade_update.loss_amount is not None:
        trade.loss_amount = trade_update.loss_amount
        
    # Recalculate net profit if needed
    if trade.profit_amount != 0 or trade.loss_amount != 0:
        trade.net_profit = trade.profit_amount - trade.loss_amount
        
    db.commit()
    db.refresh(trade)
    return trade

@router.delete("/{trade_id}")
def delete_trade(
    trade_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user_role)
):
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    trade = db.query(Trade).filter(Trade.id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
        
    db.delete(trade)
    db.commit()
    return {"message": "Trade deleted successfully"}
