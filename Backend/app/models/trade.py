from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey('users.user_id'))  # ✅ Changed to String
    
    # Trade details
    trade_no = Column(Integer, unique=True, index=True, nullable=False, autoincrement=False)
    symbol = Column(String)
    volume = Column(Float)
    price_open = Column(Float)
    price_close = Column(Float)
    type = Column(String)  # buy/sell
    
    # Risk management
    take_profit = Column(Float, default=0.0)
    stop_loss = Column(Float, default=0.0)
    
    # Results
    profit_amount = Column(Float, default=0.0)
    loss_amount = Column(Float, default=0.0)
    net_profit = Column(Float)
    
    # Analysis
    reason = Column(String, default="enter the reason")
    mistake = Column(String, default="enter the mistake")
    
    # Timestamps
    open_time = Column(DateTime)
    close_time = Column(DateTime)
    
    # ✅ Use back_populates instead of backref for explicit relationship
    user = relationship("User", back_populates="trades")
    
    def __repr__(self):
        return f"<Trade {self.trade_no} - {self.symbol}>"