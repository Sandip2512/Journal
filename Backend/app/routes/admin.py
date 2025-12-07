from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.trade import Trade
from app.crud.user_crud import get_all_users

router = APIRouter()

# Simple dependency/helper to check admin role
# In a real app, this should decode the JWT and check roles/scopes
# For now, we rely on the client to send the request (protected by frontend) 
# BUT backend MUST verify the user invoking this is actually an admin.
# I need 'get_current_user' dependency. Use auth logic or create a lightweight one.

from app.routes.auth import SECRET_KEY, ALGORITHM
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user_role(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        user = db.query(User).filter(User.email == email).first()
        if user is None:
             raise HTTPException(status_code=401, detail="User not found")
             
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

@router.get("/users")
def get_all_users_stats(
    current_user: User = Depends(get_current_user_role),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    users = get_all_users(db)
    results = []
    
    for user in users:
        # Calculate summary stats for each user
        trades = user.trades
        total_trades = len(trades)
        net_profit = sum(t.net_profit for t in trades)
        wins = sum(1 for t in trades if t.net_profit > 0)
        win_rate = (wins / total_trades * 100) if total_trades > 0 else 0
        
        results.append({
            "user_id": user.user_id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "total_trades": total_trades,
            "net_profit": net_profit,
            "win_rate": win_rate,
            "joined_at": user.created_at
        })
        
    return results
