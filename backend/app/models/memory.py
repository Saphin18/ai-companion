from datetime import datetime
from pydantic import BaseModel


class MemoryOut(BaseModel):
    id: str
    category: str
    content: str
    importance: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExtractedMemory(BaseModel):
    """One fact the extractor pulled from a conversation turn."""
    category: str = "fact"
    content: str
    importance: int = 3