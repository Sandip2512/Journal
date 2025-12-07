from app.database import engine
from sqlalchemy import text

with engine.connect() as connection:
    # Postgres DDL might need explicit commit
    print("Altering table trades column user_id to VARCHAR...")
    try:
        connection.execute(text("ALTER TABLE trades ALTER COLUMN user_id TYPE VARCHAR"))
        connection.commit()
        print("Success!")
    except Exception as e:
        print(f"Error: {e}")
        connection.rollback()
