from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.mt5_credentials import MT5Credentials as MT5CredentialsModel

def create_mt5_credentials(db: Session, credentials_data: dict):
    credentials = MT5CredentialsModel(**credentials_data)
    db.add(credentials)
    db.commit()
    db.refresh(credentials)
    return credentials

def get_mt5_credentials(db: Session, user_id: str):
    return db.query(MT5CredentialsModel).filter(MT5CredentialsModel.user_id == user_id).first()

def get_mt5_credentials_by_account(db: Session, account: str):  # ✅ NEW function
    return db.query(MT5CredentialsModel).filter(MT5CredentialsModel.account == account).first()

def update_mt5_credentials(db: Session, user_id: str, credentials_data: dict):
    credentials = get_mt5_credentials(db, user_id)
    if credentials:
        for key, value in credentials_data.items():
            setattr(credentials, key, value)
        db.commit()
        db.refresh(credentials)
    return credentials

def delete_mt5_credentials(db: Session, user_id: str):
    credentials = get_mt5_credentials(db, user_id)
    if credentials:
        db.delete(credentials)
        db.commit()
    return credentials