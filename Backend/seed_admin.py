from app.database import engine
from sqlalchemy import text
import hashlib
import uuid
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def seed_admin():
    try:
        admin_email = "admin@tradingjournal.com"
        password_hash = get_password_hash("Admin@123")
        
        with engine.connect() as connection:
            # Check if user exists
            result = connection.execute(text("SELECT user_id, role FROM users WHERE email = :email"), {"email": admin_email})
            row = result.fetchone()
            
            if row:
                logger.info(f"Admin user {admin_email} exists. Updating password and role...")
                connection.execute(text("""
                    UPDATE users 
                    SET role = 'admin', password = :password, is_active = true
                    WHERE email = :email
                """), {"password": password_hash, "email": admin_email})
            else:
                logger.info(f"Creating admin user {admin_email}...")
                new_id = str(uuid.uuid4())
                connection.execute(text("""
                    INSERT INTO users (user_id, email, password, first_name, last_name, mobile_number, role, is_active, created_at)
                    VALUES (:user_id, :email, :password, 'Admin', 'User', '+1234567890', 'admin', true, CURRENT_TIMESTAMP)
                """), {
                    "user_id": new_id, 
                    "email": admin_email, 
                    "password": password_hash
                })
                
            connection.commit()
            logger.info("✅ Admin user seeded successfully (Raw SQL).")
            
    except Exception as e:
        logger.error(f"❌ Error seeding admin: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    seed_admin()
