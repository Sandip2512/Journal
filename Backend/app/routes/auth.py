from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
import os
from dotenv import load_dotenv

from app.database import get_db
from app.crud.user_crud import login_user
from app.schemas.user_schema import UserLogin, UserResponse

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

router = APIRouter()
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks

# ... (imports)

@router.post("/login")
def login(user_login: UserLogin, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    client_ip = request.client.host
    
    try:
        print(f"🔐 Login attempt for email: {user_login.email}")
        
        db_user = login_user(db, user_login.email, user_login.password)
        
        if not db_user:
            print("❌ Login failed: Invalid credentials or user not found")
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Record success in background to avoid blocking response
        background_tasks.add_task(log_login_history, db_user.user_id, client_ip, "success", db)

        print(f"✅ Login successful!")
        
        access_token = create_access_token(
            data={
                "sub": db_user.email, 
                "user_id": db_user.user_id,
                "role": db_user.role 
            },
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        user_data = UserResponse.model_validate(db_user)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_data
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

def log_login_history(user_id: str, ip_address: str, status: str, db: Session):
    try:
        from app.models.logs import LoginHistory # Import here to avoid circular dependencies if any
        # Create a new session for background task to avoid binding potential issues with request session
        # Actually, using the passed 'db' session depends on its lifecycle. 
        # Better to create a new session or be careful. 
        # For simplicity in this setups, using the same db session object might be risky if it's closed.
        # Let's import SessionLocal instead.
        from app.database import SessionLocal
        
        with SessionLocal() as session:
            log = LoginHistory(
                user_id=user_id,
                ip_address=ip_address,
                status=status
            )
            session.add(log)
            session.commit()
    except Exception as e:
        print(f"⚠️ Failed to log login history: {e}")