"""Chat + session history endpoints (all require a valid Supabase JWT)."""
import asyncio
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai import provider_factory
from app.ai.memory_extractor import extract_memories
from app.ai.mood_detector import detect_mood
from app.auth.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.attachment import AttachmentOut
from app.models.chat import (
    ChatRequest,
    ChatResponse,
    MessageOut,
    SessionOut,
    SessionUpdate,
)
from app.repositories import attachment_repository as attach_repo
from app.repositories import chat_repository as repo
from app.repositories import goal_repository as goal_repo
from app.repositories import memory_repository as mem_repo
from app.repositories import mood_repository as mood_repo
from app.repositories import profile_repository as prof_repo
from app.services import storage

router = APIRouter()

# How many recent messages of the CURRENT chat to feed back to the AI.
HISTORY_LIMIT = 20

# Personality-mode instruction blocks (Phase 3B). "balanced" adds nothing.
PERSONALITY_PROMPTS = {
    "motivator": (
        "Personality mode: MOTIVATOR. Be upbeat and encouraging. Cheer the user on, "
        "highlight their strengths and progress, and nudge them toward positive action "
        "with concrete, doable next steps. Stay realistic and never dismiss their feelings."
    ),
    "humor": (
        "Personality mode: HUMOR. Be playful, warm and lightly witty. Add gentle jokes or "
        "fun observations where they fit. Keep it kind, never sarcastic at the user's "
        "expense, and dial the humor down if they seem upset."
    ),
    "calm": (
        "Personality mode: CALM. Be soothing, gentle and grounding. Use a slow, reassuring "
        "tone and short, calming sentences to help the user feel settled and safe."
    ),
}


async def _with_urls(rows) -> list[AttachmentOut]:
    """Turn Attachment rows into AttachmentOut, adding fresh signed URLs."""
    if not rows:
        return []
    urls = await asyncio.gather(
        *(storage.signed_url(r.storage_path) for r in rows),
        return_exceptions=True,
    )
    out = []
    for row, url in zip(rows, urls):
        item = AttachmentOut.model_validate(row)
        item.url = url if isinstance(url, str) else None
        out.append(item)
    return out


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    # --- ATTACHMENTS (Phase 6): fetch what was uploaded with this message. ---
    # NOTE: attachments.user_id is TEXT, hence str(user_id).
    attachments = []
    if payload.attachment_ids:
        try:
            attachments = await attach_repo.get_attachments(
                db, str(user_id), payload.attachment_ids
            )
        except Exception:
            attachments = []

    message_text = (payload.message or "").strip()
    if not message_text:
        # Voice-only send: the transcript becomes the message itself.
        spoken = [a.extracted_text for a in attachments
                  if a.kind == "voice" and a.extracted_text]
        message_text = " ".join(spoken).strip()
    if not message_text:
        message_text = "(sent an attachment)"

    if payload.session_id is not None:
        session = await repo.get_session(db, payload.session_id, user_id)
        if session is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
            )
    else:
        title = message_text[:40] or "New chat"
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

    # --- GOALS (Phase 4D): the user's active goals, injected so the companion
    # naturally encourages them. Folded into memory_context so the provider
    # signature stays unchanged. Best-effort: any failure just skips goals. ---
    try:
        goal_titles = await goal_repo.active_goal_titles(db, str(user_id))
    except Exception:
        goal_titles = []
    if goal_titles:
        goals_block = (
            "The user's current personal goals (gently support and encourage "
            "these when relevant, never nag):\n"
            + "\n".join(f"- {t}" for t in goal_titles)
        )
        memory_context = (
            memory_context + "\n\n" + goals_block if memory_context else goals_block
        )

    # --- ATTACHMENTS (Phase 6): images and documents become text blocks.
    # Voice is skipped here because its transcript IS the message. Same
    # fold-into-memory_context trick as goals, so the provider is untouched. ---
    blocks = []
    for a in attachments:
        if a.kind == "voice" or not a.extracted_text:
            continue
        label = a.original_name or a.kind
        if a.kind == "image":
            blocks.append(
                f"The user attached an image ({label}). You cannot see it "
                f"directly; this is a description of it:\n{a.extracted_text}"
            )
        else:
            blocks.append(
                f"The user attached a document ({label}). Its text "
                f"content:\n{a.extracted_text}"
            )
    if blocks:
        attach_block = (
            "\n\n".join(blocks)
            + "\n\nRefer to the attachment naturally when answering. Never claim "
            "to have seen or opened a file you were not given."
        )
        memory_context = (
            memory_context + "\n\n" + attach_block if memory_context else attach_block
        )

    # --- PERSONALITY (Phase 3B): the user's chosen companion style. ---
    profile = await prof_repo.get_profile(db, user_id)
    mode = (profile.personality_mode if profile else "balanced") or "balanced"
    personality_context = PERSONALITY_PROMPTS.get(mode)

    # --- MOOD (Phase 3A): detect the user's current tone so the reply can adapt. ---
    # Best-effort: on any failure detect_mood returns None and we skip adaptation.
    mood_reading = await detect_mood(message_text)
    tone_context = None
    if mood_reading:
        tone_context = (
            f"The user's current emotional tone seems to be '{mood_reading.mood}' "
            f"(intensity {mood_reading.intensity}/5). Naturally adapt your warmth and "
            "energy to match - be gentler and reassuring if they seem low, anxious, "
            "sad or stressed; match their energy if they're upbeat or excited. "
            "Never state or imply that you detected their mood."
        )

    # Save the user's message, then generate a reply with full context.
    user_msg = await repo.add_message(db, session.id, user_id, "user", message_text)
    user_message_id = user_msg.id
    provider = provider_factory.get_ai_provider()
    reply = await provider.generate_reply(
        message_text,
        history=history,
        memory_context=memory_context,
        personality_context=personality_context,
        tone_context=tone_context,
    )
    await repo.add_message(db, session.id, user_id, "assistant", reply)
    await repo.touch_session(db, session.id)

    # Capture the id before commit so we never read an expired attribute.
    session_id = session.id
    await db.commit()

    # --- ATTACHMENTS (Phase 6): link them to the message they arrived with,
    # so history can render the voice bubble / image later. Best-effort. ---
    if payload.attachment_ids:
        try:
            await attach_repo.link_to_message(
                db, str(user_id), payload.attachment_ids, session_id, user_message_id
            )
        except Exception:
            await db.rollback()

    # --- MEMORY: extract & save new facts (best-effort; never breaks chat) ---
    try:
        known = [m.content for m in memories]
        extracted = await extract_memories(message_text, reply, known)
        if extracted:
            await mem_repo.add_memories(db, str(user_id), extracted)
            await db.commit()
    except Exception:
        await db.rollback()

    # --- MOOD (Phase 3A): log the detected mood (best-effort; never breaks chat) ---
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
    messages = await repo.list_messages(db, session_id, user_id)
    out = [MessageOut.model_validate(m) for m in messages]

    # Phase 6: attach any voice notes / images / documents. Best-effort:
    # if this fails the chat still loads, just without attachment bubbles.
    try:
        rows = await attach_repo.list_for_messages(
            db, str(user_id), [m.id for m in messages]
        )
        if rows:
            items = await _with_urls(rows)
            by_message: dict = {}
            for row, item in zip(rows, items):
                by_message.setdefault(row.message_id, []).append(item)
            for m in out:
                m.attachments = by_message.get(m.id, [])
    except Exception:
        pass

    return out


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


