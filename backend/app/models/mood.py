"""DTOs for detected emotional-tone readings (Phase 3)."""
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MoodReading(BaseModel):
    """What mood_detector returns for a single message."""
    mood: str          # one lowercase word, e.g. "anxious", "happy", "neutral"
    intensity: int     # 1 (very mild) .. 5 (very strong)
    note: str = ""     # very short reason, may be empty


class MoodLogOut(BaseModel):
    """A stored reading, on its way to the client (Session 24).

    `created_at` is UTC and is serialised with its offset. The client groups
    these into its own local days - see app/api/moods.py.

    `session_title` is None for an untitled chat and for the rare log whose
    session has since been hidden.
    """
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    mood: str
    intensity: int
    note: str | None = None
    session_id: uuid.UUID | None = None
    session_title: str | None = None
    created_at: datetime