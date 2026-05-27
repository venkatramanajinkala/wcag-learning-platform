from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests as grequests
from google.oauth2 import id_token
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token
from app.db import get_db
from app.models import User
from app.schemas import GoogleTokenLogin, Token

router = APIRouter(prefix="/oauth", tags=["oauth"])


@router.post("/google", response_model=Token)
def google_login(payload: GoogleTokenLogin, db: Session = Depends(get_db)) -> Token:
    settings = get_settings()
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured",
        )

    try:
        claims = id_token.verify_oauth2_token(
            payload.credential, grequests.Request(), settings.google_client_id
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")

    email = (claims.get("email") or "").lower().strip()
    name = (claims.get("name") or "").strip() or "User"
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google token missing email")

    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        # Password-based login remains available; Google accounts start without a local password.
        user = User(email=email, full_name=name, hashed_password="")
        db.add(user)
        db.commit()
        db.refresh(user)

    return Token(access_token=create_access_token(str(user.id)), user=user)
