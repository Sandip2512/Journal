from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint  # ✅ ADD UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class MT5Credentials(Base):
    __tablename__ = "mt5_credentials"
    
    id = Column(Integer, primary_key=True, index=True)
    account = Column(String, nullable=False)  # ✅ Removed unique=True
    password = Column(String, nullable=False)
    server = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    days = Column(Integer, default=90)
    
    # ✅ Composite unique constraint: same user can't have same account twice
    __table_args__ = (
        UniqueConstraint('user_id', 'account', name='uq_user_mt5_account'),
    )
    
    user = relationship("User", back_populates="mt5_credentials")
    
    def __repr__(self):
        return f"<MT5Credentials {self.account}@{self.server}>"