"""Chat + session history endpoints (all require a valid Supabase JWT)."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai import provider_factory
from app.ai.memory_extractor import extract_memories
from app.ai.mood_detector import detect_mood
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
from app.repositories import memory_repository as mem_repo
from app.repositories import mood_repository as mood_repo

router = APIRouter()

# How many recent messages of the CURRENT chat to feed back to the AI.
HISTORY_LIMIT = 20


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

    # --- MEMORY: build context BEFORE saving the new user message ---
    # Short-term: the last N messages of this conversation.
    prior = await repo.list_messages(db, session.id, user_id)
    history = [{"role": m.role, "content": m.content} for m in prior][-HISTORY_LIMIT:]

    # Long-term: durable facts we remember about this user.
    memories = await mem_repo.list_active_memories(db, str(user_id))
    memory_context = None
    if memories:
        lines = "\n".join(f"- ({m.category}) {m.content}" for m in memories)
        memory_context = (
            "Things you remember about this user (use them naturally, "
            "don't recite them):\n" + lines
        )

    # --- MOOD (Phase 3): detect the user's current tone so the reply can adapt. ---
    # Best-effort: on any failure detect_mood returns None and we skip adaptation.
    mood_reading = await detect_mood(payload.message)
    tone_context = None
    if mood_reading:
        tone_context = (
            f"The user's current emotional tone seems to be '{mood_reading.mood}' "
            f"(intensity {mood_reading.intensity}/5). Naturally adapt your warmth and "
            "energy to match — be gentler and reassuring if they seem low, anxious, "
            "sad or stressed; match their energy if they're upbeat or excited. "
            "Never state or imply that you detected their mood."
        )

    # Save the user's message, then generate a reply with full context.
    await repo.add_message(db, session.id, user_id, "user", payload.message)
    provider = provider_factory.get_ai_provider()
    reply = await provider.generate_reply(
        payload.message,
        history=history,
        memory_context=memory_context,
        tone_context=tone_context,
    )
    await repo.add_message(db, session.id, user_id, "assistant", reply)
    await repo.touch_session(db, session.id)

    # Capture the id before commit so we never read an expired attribute.
    session_id = session.id
    await db.commit()

    # --- MEMORY: extract & save new facts (best-effort; never breaks chat) ---
    try:
        known = [m.content for m in memories]
        extracted = await extract_memories(payload.message, reply, known)
        if extracted:
            await mem_repo.add_memories(db, str(user_id), extracted)
            await db.commit()
    except Exception:
        await db.rollback()

    # --- MOOD (Phase 3): log the detected mood (best-effort; never breaks chat) ---
    if mood_reading:
        try:
            await mood_repo.add_mood_log(
                db,
                str(user_id),
                mood_reading.mood,
                mood_reading.intensity,
                note=mood_reading.note or None,
                session_id=session_id,
            )
            await db.commit()
        except Exception:
            await db.rollback()

    return ChatResponse(reply=reply, session_id=session_id)


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
    # updated_at is generated by the DB (onupdate=now()), so it's stale on the
    # object right after an update. Refresh reloads every column in async context;
    # without it, serializing updated_at attempts blocked async IO -> 500.
    await db.refresh(session)
    result = SessionOut.model_validate(session)
    await db.commit()
    return result


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