from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.email import send_email
from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.tokens import generate_reset_token, hash_token, reset_token_expiry
from app.db import get_db
from app.models import PasswordResetToken, User
from app.schemas import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    Token,
    UserCreate,
    UserLogin,
    UserRead,
)

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)

def _as_utc_aware(dt: datetime) -> datetime:
    # SQLite often returns naive datetimes even when timezone=True.
    # Treat naive values as UTC to keep comparisons stable across DBs.
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> Token:
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name.strip(),
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return Token(access_token=create_access_token(str(user.id)), user=user)


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, payload: UserLogin, db: Session = Depends(get_db)) -> Token:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    return Token(access_token=create_access_token(str(user.id)), user=user)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    # Always return success to avoid account enumeration.
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None:
        return {"status": "ok"}

    raw_token = generate_reset_token()
    token = PasswordResetToken(
        user_id=user.id,
        token_hash=hash_token(raw_token),
        expires_at=reset_token_expiry(),
        used=False,
    )
    db.add(token)
    db.commit()

    settings = get_settings()
    reset_link = f"{settings.frontend_url}/#/reset-password?token={raw_token}"
    # Send asynchronously so the request returns quickly.
    background_tasks.add_task(
        send_email,
        user.email,
        "Reset your A11yPlay password",
        f"Use this link to reset your password:\n\n{reset_link}\n\nThis link expires in {settings.reset_token_expire_minutes} minutes.",
    )
    return {"status": "ok"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
def reset_password(request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    now = datetime.now(timezone.utc)
    token_hash_value = hash_token(payload.token)
    token = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash_value))
    if token is None or token.used or _as_utc_aware(token.expires_at) < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    user = db.get(User, token.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")

    user.hashed_password = get_password_hash(payload.new_password)
    token.used = True
    db.commit()
    return {"status": "ok"}
