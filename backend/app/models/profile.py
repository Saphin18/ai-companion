"""Request/response schemas for the profile API."""
from pydantic import BaseModel, ConfigDict


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    display_name: str | None = None
    theme_preference: str = "system"
    theme_id: str = "default"
    personality_mode: str = "balanced"
    avatar_url: str | None = None


class ProfileUpdate(BaseModel):
    display_name: str | None = None
    theme_preference: str | None = None
    theme_id: str | None = None
    personality_mode: str | None = None
    avatar_url: str | None = None