"""Data access for long-term user memories."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import UserMemory
from app.models.memory import ExtractedMemory


async def list_active_memories(
    db: AsyncSession, user_id: str, limit: int = 40
) -> list[UserMemory]:
    """Most important, most recently updated active memories first."""
    stmt = (
        select(UserMemory)
        .where(UserMemory.user_id == user_id, UserMemory.is_active.is_(True))
        .order_by(UserMemory.importance.desc(), UserMemory.updated_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def _active_contents(db: AsyncSession, user_id: str) -> set[str]:
    stmt = select(UserMemory.content).where(
        UserMemory.user_id == user_id, UserMemory.is_active.is_(True)
    )
    result = await db.execute(stmt)
    return {c.strip().lower() for c in result.scalars().all()}


async def add_memories(
    db: AsyncSession, user_id: str, items: list[ExtractedMemory]
) -> int:
    """Insert only genuinely new facts (case-insensitive dedup). Caller commits."""
    if not items:
        return 0
    existing = await _active_contents(db, user_id)
    added = 0
    for item in items:
        content = (item.content or "").strip()
        if not content or content.lower() in existing:
            continue
        importance = max(1, min(5, item.importance or 3))
        db.add(
            UserMemory(
                user_id=user_id,
                category=(item.category or "fact").strip() or "fact",
                content=content,
                importance=importance,
            )
        )
        existing.add(content.lower())
        added += 1
    return added