"""Data-access layer for journal entries. Always scoped to one user_id."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import JournalEntry


async def add_entry(
    db: AsyncSession, user_id: str, content: str, reflection: str | None
) -> JournalEntry:
    entry = JournalEntry(user_id=user_id, content=content, reflection=reflection)
    db.add(entry)
    await db.flush()
    return entry


async def list_entries(db: AsyncSession, user_id: str) -> list[JournalEntry]:
    result = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.user_id == user_id)
        .order_by(JournalEntry.created_at.desc())
    )
    return list(result.scalars().all())