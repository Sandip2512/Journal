from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.trade import Trade

def create_trade(db: Session, trade_data: dict):
    # Calculate net profit
    trade_data['net_profit'] = trade_data['profit_amount'] - trade_data['loss_amount']
    
    # Auto-generate trade_no if not provided
    if 'trade_no' not in trade_data or trade_data['trade_no'] is None:
        # Get the maximum trade_no and increment
        max_trade_no = db.query(func.max(Trade.trade_no)).scalar()
        trade_data['trade_no'] = (max_trade_no or 0) + 1
    
    trade = Trade(**trade_data)
    db.add(trade)
    db.commit()
    db.refresh(trade)
    return trade

def get_trades(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    return db.query(Trade).filter(Trade.user_id == user_id).offset(skip).limit(limit).all()

def get_trade_by_trade_no(db: Session, trade_no: int):
    return db.query(Trade).filter(Trade.trade_no == trade_no).first()

def delete_trade(db: Session, trade_no: int):
    trade = get_trade_by_trade_no(db, trade_no)
    if trade:
        db.delete(trade)
        db.commit()
    return trade

def update_trade_reason(db: Session, trade_no: int, reason: str, mistake: str):
    trade = get_trade_by_trade_no(db, trade_no)
    if trade:
        trade.reason = reason
        trade.mistake = mistake
        db.commit()
        db.refresh(trade)
    return trade