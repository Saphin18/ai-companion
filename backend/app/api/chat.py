"""Chat + session history endpoints (all require a valid Supabase JWT)."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai import provider_factory
from app.auth.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.chat import (
    ChatRequest,
    ChatResponse,
    MessageOut,
    SessionOut,
    SessionUpdate,
)
from app.repositories import chat_repository as repo

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    if payload.session_id is not None:
        session = await repo.get_session(db, payload.session_id, user_id)
        if session is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
            )
    else:
        title = payload.message.strip()[:40] or "New chat"
        session = await repo.create_session(db, user_id, title=title)
    await repo.add_message(db, session.id, user_id, "user", payload.message)
    provider = provider_factory.get_ai_provider()
    reply = await provider.generate_reply(payload.message)
    await repo.add_message(db, session.id, user_id, "assistant", reply)
    await repo.touch_session(db, session.id)
    await db.commit()
    return ChatResponse(reply=reply, session_id=session.id)


@router.get("/sessions", response_model=list[SessionOut])
async def get_sessions(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> list[SessionOut]:
    return await repo.list_sessions(db, user_id)


@router.get("/sessions/{session_id}/messages", response_model=list[MessageOut])
async def get_session_messages(
    session_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> list[MessageOut]:
    session = await repo.get_session(db, session_id, user_id)
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    return await repo.list_messages(db, session_id, user_id)


@router.patch("/sessions/{session_id}", response_model=SessionOut)
async def update_session_endpoint(
    session_id: uuid.UUID,
    payload: SessionUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> SessionOut:
    # Only forward the fields the client actually sent (rename, pin, or both).
    data = payload.model_dump(exclude_unset=True)
    kwargs = {}
    if "title" in data:
        kwargs["title"] = data["title"]
    if "pinned" in data:
        kwargs["pinned"] = data["pinned"]
    session = await repo.update_session(db, session_id, user_id, **kwargs)
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    await db.commit()
    return session


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_session(
    session_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> None:
    ok = await repo.hide_session(db, session_id, user_id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    await db.commit()
