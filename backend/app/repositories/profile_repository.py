"""Data-access layer for user profiles. Always scoped to one user_id."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Profile


async def get_profile(db: AsyncSession, user_id: uuid.UUID) -> Profile | None:
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    return result.scalar_one_or_none()


async def upsert_profile(
    db: AsyncSession, user_id: uuid.UUID, display_name: str
) -> Profile:
    profile = await get_profile(db, user_id)
    if profile is None:
        profile = Profile(id=user_id, display_name=display_name)
        db.add(profile)
    else:
        profile.display_name = display_name
    await db.flush()
    return profile
