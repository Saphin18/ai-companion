"""Request/response schemas for the attachments API (Phase 6)."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class AttachmentOut(BaseModel):
    """What the app gets back after uploading, and when loading history."""
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    kind: str
    mime_type: str | None = None
    original_name: str | None = None
    size_bytes: int | None = None
    duration_ms: int | None = None
    extracted_text: str | None = None
    created_at: datetime
    url: str | None = None  # short-lived signed URL, added by the endpoint
