"""DTO for a single detected emotional-tone reading (Phase 3)."""
from pydantic import BaseModel


class MoodReading(BaseModel):
    mood: str          # one lowercase word, e.g. "anxious", "happy", "neutral"
    intensity: int     # 1 (very mild) .. 5 (very strong)
    note: str = ""     # very short reason, may be empty