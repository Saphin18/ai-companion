import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.auth.dependencies import get_current_user_id
from app.models.reminder import ReminderCreate, ReminderOut
from app.repositories import reminder_repository as repo

router = APIRouter()


@router.post("/reminders", response_model=ReminderOut)
async def create_reminder(
    payload: ReminderCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await repo.create_reminder(
        db, str(user_id), payload.title, payload.remind_at,
        payload.repeats_daily, payload.local_notif_id,
    )


@router.get("/reminders", response_model=list[ReminderOut])
async def list_reminders(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await repo.list_reminders(db, str(user_id))


@router.delete("/reminders/{reminder_id}")
async def delete_reminder(
    reminder_id: str,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    await repo.deactivate_reminder(db, str(user_id), reminder_id)
    return {"ok": True}
