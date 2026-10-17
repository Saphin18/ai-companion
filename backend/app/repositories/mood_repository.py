"""Persists and reads back detected user moods (Phase 3).

Until Session 24 this was write-only - `detect_mood()` had been logging a
reading for every message sent since Phase 3A and nothing had ever read one.
`list_recent` exists so the home screen can show the user what the app has
been noticing.
"""
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import ChatSession, MoodLog


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


async def list_recent(
    db: AsyncSession, user_id: str, days: int = 7
) -> list[tuple[MoodLog, str | None]]:
    """Every mood reading from the last `days`, oldest first.

    Returns (log, session_title) pairs so the client can list the actual
    conversations behind a day without a second round trip - `session_id` was
    already on every row, it had simply never been followed.

    `days + 1` is fetched deliberately. Timestamps are UTC and the CLIENT
    groups them into ITS OWN local days (a phone in Kathmandu is UTC+5:45, so
    anything sent before 05:45 local belongs to the previous UTC date). Without
    the extra day of slack the earliest local day would come back half empty.
    Grouping is never done here - the server has no idea what day it is for
    the person asking.
    """
    since = datetime.now(timezone.utc) - timedelta(days=days + 1)
    result = await db.execute(
        select(MoodLog, ChatSession.title)
        .outerjoin(ChatSession, ChatSession.id == MoodLog.session_id)
        .where(MoodLog.user_id == user_id, MoodLog.created_at >= since)
        .order_by(MoodLog.created_at.asc())
    )
    return [(row[0], row[1]) for row in result.all()]
