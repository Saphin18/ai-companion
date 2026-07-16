"""Request/response schemas for the journal API."""
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class JournalCreate(BaseModel):
    content: str


class JournalEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    content: str
    reflection: str | None = None
    created_at: datetime