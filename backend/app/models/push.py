from pydantic import BaseModel


class PushTokenIn(BaseModel):
    token: str
    platform: str | None = None
