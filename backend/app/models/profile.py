"""Request/response schemas for the profile API."""
from datetime import date
from pydantic import BaseModel, ConfigDict


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    display_name: str | None = None
    theme_preference: str = "system"
    theme_id: str = "default"
    personality_mode: str = "balanced"
    avatar_url: str | None = None
    # Phase 4 — daily check-in settings
    checkin_enabled: bool = False
    checkin_hour: int = 9
    checkin_minute: int = 0
    checkin_tz_offset_minutes: int = 0
    last_checkin_date: date | None = None


class ProfileUpdate(BaseModel):
    display_name: str | None = None
    theme_preference: str | None = None
    theme_id: str | None = None
    personality_mode: str | None = None
    avatar_url: str | None = None
    # Phase 4 — daily check-in settings
    checkin_enabled: bool | None = None
    checkin_hour: int | None = None
    checkin_minute: int | None = None
    checkin_tz_offset_minutes: int | None = None
