from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from app.db.models import PushToken


async def upsert_token(db, user_id, token, platform):
    now = datetime.now(timezone.utc)
    stmt = pg_insert(PushToken).values(
        user_id=user_id, token=token, platform=platform, updated_at=now,
    ).on_conflict_do_update(
        index_elements=["user_id", "token"],
        set_={"platform": platform, "updated_at": now},
    )
    await db.execute(stmt)
    await db.commit()


async def get_tokens(db, user_id):
    result = await db.execute(
        select(PushToken.token).where(PushToken.user_id == user_id)
    )
    return [r[0] for r in result.all()]
