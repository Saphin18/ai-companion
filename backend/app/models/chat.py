"""Request/response schemas for the chat and session APIs."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ChatRequest(BaseModel):
    message: str
    session_id: UUID | None = None


class ChatResponse(BaseModel):
    reply: str
    session_id: UUID


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    role: str
    content: str
    created_at: datetime


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str | None
    created_at: datetime
    updated_at: datetime
