import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.auth.dependencies import get_current_user_id
from app.models.push import PushTokenIn
from app.repositories import push_repository as repo

router = APIRouter()


@router.post("/push/register")
async def register_push(
    payload: PushTokenIn,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    await repo.upsert_token(db, str(user_id), payload.token, payload.platform)
    return {"ok": True}
