from sqlalchemy import select, update
from app.db.models import Profile


async def get_checkin_enabled_profiles(db):
    result = await db.execute(
        select(Profile).where(Profile.checkin_enabled.is_(True))
    )
    return result.scalars().all()


async def set_last_checkin_date(db, user_id, the_date):
    await db.execute(
        update(Profile)
        .where(Profile.id == user_id)
        .values(last_checkin_date=the_date)
    )
    await db.commit()
