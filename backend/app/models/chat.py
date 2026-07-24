"""Request/response schemas for the chat and session APIs."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.models.attachment import AttachmentOut


class ChatRequest(BaseModel):
    message: str
    session_id: UUID | None = None
    # Phase 6: ids returned by POST /attachments, sent with this message.
    attachment_ids: list[UUID] = []


class ChatResponse(BaseModel):
    reply: str
    session_id: UUID


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    role: str
    content: str
    created_at: datetime
    # Phase 6: voice notes / images / documents attached to this message.
    attachments: list[AttachmentOut] = []


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str | None
    pinned: bool
    created_at: datetime
    updated_at: datetime


class SessionUpdate(BaseModel):
    """Body for PATCH /sessions/{id}. Both fields optional: send only what changes."""
    title: str | None = None
    pinned: bool | None = None
