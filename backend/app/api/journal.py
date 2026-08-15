"""Journal endpoints (all require a valid Supabase JWT)."""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.journal_reflector import generate_reflection
from app.auth.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.journal import JournalCreate, JournalEntryOut
from app.repositories import journal_repository as repo

router = APIRouter()


@router.post("/journal", response_model=JournalEntryOut)
async def create_entry(
    payload: JournalCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> JournalEntryOut:
    content = payload.content.strip()
    # Reflection is best-effort; the reflector returns a gentle default on failure.
    reflection = await generate_reflection(content)
    entry = await repo.add_entry(db, str(user_id), content, reflection)
    result = JournalEntryOut(
        id=str(entry.id),
        content=entry.content,
        reflection=entry.reflection,
        created_at=entry.created_at,
    )
    await db.commit()
    return result


@router.get("/journal", response_model=list[JournalEntryOut])
async def list_journal(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> list[JournalEntryOut]:
    entries = await repo.list_entries(db, str(user_id))
    return [
        JournalEntryOut(
            id=str(e.id),
            content=e.content,
            reflection=e.reflection,
            created_at=e.created_at,
        )
        for e in entries
    ]


@router.delete("/journal/{entry_id}")
async def delete_entry(
    entry_id: str,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    deleted = await repo.delete_entry(db, str(user_id), entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Entry not found")
    await db.commit()
    return {"ok": True}
