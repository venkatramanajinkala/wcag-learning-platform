import json

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_optional_user
from app.db import get_db
from app.models import Submission, User
from app.schemas import AuditRequest, AuditResponse, SubmissionRead
from app.services.audit import scan_html

router = APIRouter(prefix="/audit", tags=["audit"])


@router.post("/scan", response_model=AuditResponse)
def scan(
    payload: AuditRequest,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> AuditResponse:
    passed, details = scan_html(payload.html)
    submission_id: int | None = None

    if payload.save_submission:
        submission = Submission(
            user_id=current_user.id if current_user else None,
            criterion_id=payload.criterion_id,
            html=payload.html,
            passed=passed,
            report=json.dumps(details),
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)
        submission_id = submission.id

    return AuditResponse(passed=passed, details=details, submission_id=submission_id)


@router.get("/submissions", response_model=list[SubmissionRead])
def submissions(
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> list[SubmissionRead]:
    if current_user is None:
        return []
    rows = db.scalars(
        select(Submission)
        .where(Submission.user_id == current_user.id)
        .order_by(Submission.created_at.desc())
        .limit(50)
    )
    return [
        SubmissionRead(
            id=row.id,
            criterion_id=row.criterion_id,
            html=row.html,
            passed=row.passed,
            report=json.loads(row.report),
            created_at=row.created_at,
        )
        for row in rows
    ]
