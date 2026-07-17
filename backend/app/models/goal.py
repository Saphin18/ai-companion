from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class GoalCreate(BaseModel):
    title: str
    detail: str | None = None


class GoalUpdate(BaseModel):
    status: str | None = None
    title: str | None = None
    detail: str | None = None


class GoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    detail: str | None = None
    status: str = "active"
    created_at: datetime
    completed_at: datetime | None = None
