"""Mood history (Session 24).

`detect_mood()` has written a reading for every message sent since Phase 3A,
and until now nothing could read them back - there was no repository function,
no endpoint, and no mention of mood anywhere in the frontend. This exposes
that history so the home screen can show it.

TIMEZONE: readings go out as raw UTC timestamps and the client groups them
into ITS OWN local days. The server deliberately does not bucket them - it
cannot know what day it is for the caller, and a phone in Kathmandu (UTC+5:45)
would otherwise see every message sent before 05:45 land on the previous day.
"""
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.mood import MoodLogOut
from app.repositories import mood_repository as repo

router = APIRouter()


@router.get("/moods/recent", response_model=list[MoodLogOut])
async def recent_moods(
    days: int = Query(default=7, ge=1, le=31),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> list[MoodLogOut]:
    """Mood readings from the last `days`, oldest first."""
    rows = await repo.list_recent(db, str(user_id), days=days)
    return [
        MoodLogOut(
            id=log.id,
            mood=log.mood,
            intensity=log.intensity,
            note=log.note,
            session_id=log.session_id,
            session_title=title,
            created_at=log.created_at,
        )
        for log, title in rows
    ]
