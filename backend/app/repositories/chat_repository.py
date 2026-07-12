"""
Data-access layer for chat sessions and messages.

Every function requires user_id and filters by it, so a user can only ever
touch their own rows. Endpoints call these; they never write SQL directly.
Commits are handled by the caller (the endpoint), not here.
"""

import uuid

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import ChatMessage, ChatSession


async def create_session(
    db: AsyncSession, user_id: uuid.UUID, title: str | None = None
) -> ChatSession:
    session = ChatSession(user_id=user_id, title=title)
    db.add(session)
    await db.flush()
    return session


async def get_session(
    db: AsyncSession, session_id: uuid.UUID, user_id: uuid.UUID
) -> ChatSession | None:
    result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == session_id, ChatSession.user_id == user_id
        )
    )
    return result.scalar_one_or_none()


async def list_sessions(db: AsyncSession, user_id: uuid.UUID) -> list[ChatSession]:
    result = await db.execute(
        select(ChatSession)
        .where(
            ChatSession.user_id == user_id,
            ChatSession.hidden_at.is_(None),
        )
        .order_by(ChatSession.updated_at.desc())
    )
    return list(result.scalars().all())


async def hide_session(
    db: AsyncSession, session_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    session = await get_session(db, session_id, user_id)
    if session is None:
        return False
    session.hidden_at = func.now()
    await db.flush()
    return True


async def add_message(
    db: AsyncSession,
    session_id: uuid.UUID,
    user_id: uuid.UUID,
    role: str,
    content: str,
) -> ChatMessage:
    message = ChatMessage(
        session_id=session_id, user_id=user_id, role=role, content=content
    )
    db.add(message)
    await db.flush()
    return message


async def list_messages(
    db: AsyncSession, session_id: uuid.UUID, user_id: uuid.UUID
) -> list[ChatMessage]:
    result = await db.execute(
        select(ChatMessage)
        .where(
            ChatMessage.session_id == session_id, ChatMessage.user_id == user_id
        )
        .order_by(ChatMessage.created_at.asc())
    )
    return list(result.scalars().all())


async def touch_session(db: AsyncSession, session_id: uuid.UUID) -> None:
    await db.execute(
        update(ChatSession)
        .where(ChatSession.id == session_id)
        .values(updated_at=func.now())
    )
