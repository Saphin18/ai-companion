"""Data-access layer for user profiles. Always scoped to one user_id."""
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Profile


async def get_profile(db: AsyncSession, user_id: uuid.UUID) -> Profile | None:
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    return result.scalar_one_or_none()


# Backwards-compatible helper (older callers pass just the name).
async def upsert_profile(
    db: AsyncSession, user_id: uuid.UUID, display_name: str
) -> Profile:
    return await update_profile_fields(db, user_id, {"display_name": display_name})


async def update_profile_fields(
    db: AsyncSession, user_id: uuid.UUID, changes: dict
) -> Profile:
    """Update only the fields present in `changes` (partial update)."""
    profile = await get_profile(db, user_id)
    if profile is None:
        profile = Profile(id=user_id)
        # Guard against a NOT NULL display_name if the client didn't send one.
        changes.setdefault("display_name", "")
        db.add(profile)
    for key, value in changes.items():
        setattr(profile, key, value)
    await db.flush()
    return profile