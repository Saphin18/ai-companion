"""Attachment upload endpoints (Phase 6). Requires a valid Supabase JWT."""
import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai import doc_reader, transcriber, vision_reader
from app.auth.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.attachment import AttachmentOut
from app.repositories import attachment_repository as repo
from app.services import storage

router = APIRouter()

MAX_BYTES = {
    "voice": 20 * 1024 * 1024,
    "image": 8 * 1024 * 1024,
    "document": 5 * 1024 * 1024,
}

EXT_BY_MIME = {
    "audio/m4a": "m4a", "audio/mp4": "m4a", "audio/x-m4a": "m4a",
    "audio/mpeg": "mp3", "audio/wav": "wav", "audio/webm": "webm",
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
    "application/pdf": "pdf",
}


def _extension(filename: str, mime: str) -> str:
    if filename and "." in filename:
        ext = filename.rsplit(".", 1)[-1].lower()
        if 1 <= len(ext) <= 5 and ext.isalnum():
            return ext
    return EXT_BY_MIME.get((mime or "").lower(), "bin")


@router.post("/attachments", response_model=AttachmentOut)
async def upload_attachment(
    file: UploadFile = File(...),
    kind: str = Form(...),
    duration_ms: int | None = Form(None),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> AttachmentOut:
    kind = (kind or "").strip().lower()
    if kind not in MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="kind must be voice, image or document",
        )

    data = await file.read()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file"
        )
    if len(data) > MAX_BYTES[kind]:
        limit_mb = MAX_BYTES[kind] // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"That {kind} is too large. Limit is {limit_mb} MB.",
        )

    mime = file.content_type or ""
    name = file.filename or f"{kind}.{_extension('', mime)}"

    # Store the original first, so nothing is lost even if reading fails.
    # NOTE: user_id is TEXT on this table, hence str().
    attachment_id = uuid.uuid4()
    path = f"{user_id}/{attachment_id}.{_extension(name, mime)}"
    if not await storage.upload(path, data, mime):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not save the file. Please try again.",
        )

    # Turn it into text. Best-effort: None just means no context to inject.
    if kind == "voice":
        extracted = await transcriber.transcribe(data, filename=name)
    elif kind == "image":
        extracted = await vision_reader.describe_image(data, mime_type=mime)
    else:
        extracted = doc_reader.extract_text(data, filename=name, mime_type=mime)

    row = await repo.create_attachment(
        db,
        str(user_id),
        kind,
        path,
        id=attachment_id,
        mime_type=mime or None,
        original_name=name,
        size_bytes=len(data),
        duration_ms=duration_ms,
        extracted_text=extracted,
    )

    out = AttachmentOut.model_validate(row)
    out.url = await storage.signed_url(path)
    return out


@router.get("/attachments/{attachment_id}/url")
async def refresh_attachment_url(
    attachment_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Signed URLs expire, so the app can ask for a fresh one."""
    rows = await repo.get_attachments(db, str(user_id), [attachment_id])
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found"
        )
    return {"url": await storage.signed_url(rows[0].storage_path)}
