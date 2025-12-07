from app.database import engine, Base
from app.models.logs import LoginHistory, AuditLog
from app.models.announcement import Announcement
# Ensure User is imported so ForeignKey works if needed, though usually string reference works if Base is shared
from app.models.user import User

if __name__ == "__main__":
    print("Creating new tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")
