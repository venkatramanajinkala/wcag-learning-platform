from fastapi import APIRouter, Depends, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db import get_db
from app.models import ProgressItem, User
from app.schemas import ProgressBulkUpdate, ProgressItemRead, ProgressUpdate

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("", response_model=list[ProgressItemRead])
def list_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProgressItem]:
    return list(
        db.scalars(
            select(ProgressItem)
            .where(ProgressItem.user_id == current_user.id)
            .order_by(ProgressItem.criterion_id, ProgressItem.item_key)
        )
    )


@router.put("", response_model=ProgressItemRead)
def upsert_progress(
    payload: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProgressItem:
    item = db.scalar(
        select(ProgressItem).where(
            ProgressItem.user_id == current_user.id,
            ProgressItem.criterion_id == payload.criterion_id,
            ProgressItem.item_key == payload.item_key,
        )
    )
    if item is None:
        item = ProgressItem(
            user_id=current_user.id,
            criterion_id=payload.criterion_id,
            item_key=payload.item_key,
            completed=payload.completed,
        )
        db.add(item)
    else:
        item.completed = payload.completed

    db.commit()
    db.refresh(item)
    return item


@router.put("/bulk", response_model=list[ProgressItemRead])
def upsert_progress_bulk(
    payload: ProgressBulkUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProgressItem]:
    saved: list[ProgressItem] = []
    for progress in payload.items:
        item = db.scalar(
            select(ProgressItem).where(
                ProgressItem.user_id == current_user.id,
                ProgressItem.criterion_id == progress.criterion_id,
                ProgressItem.item_key == progress.item_key,
            )
        )
        if item is None:
            item = ProgressItem(
                user_id=current_user.id,
                criterion_id=progress.criterion_id,
                item_key=progress.item_key,
                completed=progress.completed,
            )
            db.add(item)
        else:
            item.completed = progress.completed
        saved.append(item)

    db.commit()
    for item in saved:
        db.refresh(item)
    return saved


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def reset_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    db.execute(delete(ProgressItem).where(ProgressItem.user_id == current_user.id))
    db.commit()
