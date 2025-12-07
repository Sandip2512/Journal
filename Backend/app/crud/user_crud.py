from sqlalchemy.orm import Session
from app.models.user import User
from app.models.mt5_credentials import MT5Credentials
import secrets
import datetime
import hashlib
import logging
import uuid  # ✅ UUID import

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# ------------------- Password Helpers -------------------
def get_password_hash(password: str) -> str:
    """Hash the password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password"""
    return get_password_hash(plain_password) == hashed_password

# ------------------- User Queries -------------------
def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.user_id == user_id).first()

def get_user_by_id(db: Session, user_id: str):
    return db.query(User).filter(User.user_id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_account(db: Session, account_number: int):
    credentials = db.query(MT5Credentials).filter(MT5Credentials.account == account_number).first()
    if credentials:
        return db.query(User).filter(User.user_id == credentials.user_id).first()
    return None

def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

# ------------------- User Creation -------------------
def create_user(db: Session, user_data: dict):
    """Create a new user with permanent UUID"""
    user_id = str(uuid.uuid4())  # ✅ Permanent UUID
    user = User(
        user_id=user_id,
        first_name=user_data['first_name'],
        last_name=user_data['last_name'],
        email=user_data['email'],
        password=get_password_hash(user_data['password']),
        mobile_number=user_data.get('mobile_number', '')
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"✅ Created user {user.email} with permanent ID: {user_id}")
    return user

# ------------------- Authentication -------------------
def login_user(db: Session, email: str, password: str):
    """Authenticate user with email and password"""
    user = get_user_by_email(db, email)
    if user and verify_password(password, user.password):
        print(f"📊 Logged in user: {user.email} with ID: {user.user_id}")
        return user
    return None

def update_password(db: Session, email: str, new_password: str):
    user = get_user_by_email(db, email)
    if user:
        user.password = get_password_hash(new_password)
        db.commit()
        db.refresh(user)
    return user

# ------------------- Password Reset -------------------
password_reset_tokens = {}

def create_password_reset_token(email: str):
    """Generate a token for password reset valid for 1 hour"""
    token = secrets.token_urlsafe(32)
    expires = datetime.datetime.now() + datetime.timedelta(hours=1)
    password_reset_tokens[token] = {
        "email": email,
        "expires": expires
    }
    # Always print token for debugging/fallback
    print(f"🎯 PASSWORD RESET TOKEN for {email}: {token}")
    print(f"🌐 Reset URL: http://localhost:3000/reset-password?token={token}")
    # Try sending real email via email service
    email_sent = _send_password_reset_email(email, token)
    if not email_sent:
        logger.warning(f"[FALLBACK] Password reset token for {email}: {token}")
    return token

def _send_password_reset_email(email: str, token: str) -> bool:
    """Send email via service if configured; return True if successful"""
    try:
        from app.services.email_service import email_service
        if not hasattr(email_service, 'sendgrid_api_key') or not email_service.sendgrid_api_key:
            logger.warning("SendGrid not configured properly")
            return False
        success = email_service.send_password_reset_email(email, token)
        if success:
            logger.info(f"✅ Password reset email sent to {email}")
        else:
            logger.warning(f"❌ Failed to send password reset email to {email}")
        return success
    except ImportError:
        logger.warning("Email service module not found")
        return False
    except Exception as e:
        logger.error(f"❌ Email sending error: {str(e)}")
        return False

def verify_password_reset_token(token: str):
    """Verify reset token validity"""
    if token not in password_reset_tokens:
        return None
    token_data = password_reset_tokens[token]
    if datetime.datetime.now() > token_data["expires"]:
        del password_reset_tokens[token]
        return None
    return token_data["email"]
