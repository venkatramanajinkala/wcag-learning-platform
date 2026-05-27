from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class GoogleTokenLogin(BaseModel):
    credential: str = Field(min_length=10)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=20, max_length=200)
    new_password: str = Field(min_length=8, max_length=128)


class ProgressItemRead(BaseModel):
    criterion_id: str
    item_key: str
    completed: bool
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProgressUpdate(BaseModel):
    criterion_id: str = Field(min_length=1, max_length=32)
    item_key: str = Field(min_length=1, max_length=80)
    completed: bool


class ProgressBulkUpdate(BaseModel):
    items: list[ProgressUpdate]


class AuditRequest(BaseModel):
    html: str = Field(min_length=1, max_length=50000)
    criterion_id: str | None = Field(default=None, max_length=32)
    save_submission: bool = False


class AuditResponse(BaseModel):
    passed: bool
    details: list[str]
    submission_id: int | None = None


class SubmissionRead(BaseModel):
    id: int
    criterion_id: str | None
    html: str
    passed: bool
    report: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}
