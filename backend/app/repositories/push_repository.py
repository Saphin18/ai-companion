from datetime import datetime, timezone
from sqlalchemy import delete, select
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


async def delete_token(db, token: str) -> None:
    """Drop one dead token (bug #102).

    Called when Expo reports DeviceNotRegistered - the app was uninstalled or
    the token was rotated, so it will never deliver again. Matched on the
    token alone rather than (user, token) because a reinstalled device can
    hand the same token to a different account.
    """
    await db.execute(delete(PushToken).where(PushToken.token == token))
    await db.commit()


async def delete_tokens_for_user(db, user_id) -> int:
    """Remove every push token belonging to a user. Returns how many went.

    Used on account deletion (bug #101): without this the rows survive the
    Supabase auth user and the daily check-in cron keeps pushing to a phone
    whose account no longer exists.
    """
    result = await db.execute(
        delete(PushToken).where(PushToken.user_id == str(user_id))
    )
    await db.commit()
    return result.rowcount or 0
