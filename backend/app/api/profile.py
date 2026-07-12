"""Profile endpoints (require a valid Supabase JWT)."""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.profile import ProfileOut, ProfileUpdate
from app.repositories import profile_repository as repo

router = APIRouter()


@router.get("/profile", response_model=ProfileOut)
async def read_profile(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ProfileOut:
    profile = await repo.get_profile(db, user_id)
    return ProfileOut(display_name=profile.display_name if profile else None)


@router.put("/profile", response_model=ProfileOut)
async def update_profile(
    payload: ProfileUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ProfileOut:
    profile = await repo.upsert_profile(db, user_id, payload.display_name.strip())
    await db.commit()
    return ProfileOut(display_name=profile.display_name)
