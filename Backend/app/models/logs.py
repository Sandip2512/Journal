from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class LoginHistory(Base):
    __tablename__ = "login_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id")) # Assuming user_id is String based on previous context
    ip_address = Column(String)
    status = Column(String) # 'success' or 'failure'
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="login_logs")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(String, ForeignKey("users.user_id"))
    action = Column(String) # e.g., 'UPDATE_USER', 'DELETE_TRADE'
    target_id = Column(String, nullable=True) # ID of the object affected
    details = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
