from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ReminderCreate(BaseModel):
    title: str
    remind_at: datetime | None = None
    repeats_daily: bool = False
    local_notif_id: str | None = None


class ReminderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    remind_at: datetime | None = None
    repeats_daily: bool = False
    local_notif_id: str | None = None
    is_active: bool = True
    created_at: datetime
