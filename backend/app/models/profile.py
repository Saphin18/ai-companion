"""Request/response schemas for the profile API."""

from pydantic import BaseModel, ConfigDict


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    display_name: str | None = None


class ProfileUpdate(BaseModel):
    display_name: str
