from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests as grequests
from google.oauth2 import id_token
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token
from app.db import get_db
from app.models import User
from app.schemas import GoogleAuthResponse, GoogleTokenLogin, GoogleUserRead

router = APIRouter(prefix="/oauth", tags=["oauth"])


def verify_google_id_token(credential: str) -> GoogleUserRead:
    settings = get_settings()
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth is not configured",
        )

    try:
        claims = id_token.verify_oauth2_token(
            credential, grequests.Request(), settings.google_client_id
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )

    email = (claims.get("email") or "").lower().strip()
    google_id = (claims.get("sub") or "").strip()
    name = (claims.get("name") or "").strip() or email or "Google User"
    picture = claims.get("picture")
    email_verified = bool(claims.get("email_verified"))

    if not email or not google_id or not email_verified:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google account")

    return GoogleUserRead(
        email=email,
        name=name,
        picture=picture if isinstance(picture, str) and picture else None,
        google_id=google_id,
    )


@router.post("/google", response_model=GoogleAuthResponse)
def google_login(payload: GoogleTokenLogin, db: Session = Depends(get_db)) -> GoogleAuthResponse:
    google_user = verify_google_id_token(payload.credential)

    user = db.scalar(select(User).where(User.email == google_user.email))
    if user is None:
        user = User(email=google_user.email, full_name=google_user.name, hashed_password="")
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user.full_name.strip() == "User":
        user.full_name = google_user.name
        db.commit()
        db.refresh(user)

    return GoogleAuthResponse(
        access_token=create_access_token(str(user.id)),
        user=user,
        google_user=google_user,
    )
