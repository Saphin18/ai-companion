"""Persists detected user moods (Phase 3). Backend-only; clients never read this."""
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import MoodLog


async def add_mood_log(
    db: AsyncSession,
    user_id: str,
    mood: str,
    intensity: int,
    note: str | None = None,
    session_id: uuid.UUID | None = None,
) -> None:
    db.add(
        MoodLog(
            user_id=user_id,
            session_id=session_id,
            mood=mood,
            intensity=intensity,
            note=note,
        )
    )