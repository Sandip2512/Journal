from app.database import engine, Base
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_role_column():
    try:
        with engine.connect() as connection:
            connection.execute(text("COMMIT"))  # Ensure no transaction is active
            
            # Check if column exists
            result = connection.execute(text(
                "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='role'"
            ))
            
            if result.fetchone():
                logger.info("Column 'role' already exists.")
            else:
                logger.info("Adding 'role' column to users table...")
                connection.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user'"))
                connection.execute(text("COMMIT"))
                logger.info("Column 'role' added successfully.")
                
    except Exception as e:
        logger.error(f"Error adding column: {e}")

if __name__ == "__main__":
    add_role_column()
