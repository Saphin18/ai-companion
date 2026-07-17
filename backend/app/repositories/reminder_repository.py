from sqlalchemy import select, update
from app.db.models import Reminder


async def create_reminder(db, user_id, title, remind_at, repeats_daily, local_notif_id):
    row = Reminder(
        user_id=user_id,
        title=title,
        remind_at=remind_at,
        repeats_daily=repeats_daily,
        local_notif_id=local_notif_id,
        is_active=True,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def list_reminders(db, user_id):
    result = await db.execute(
        select(Reminder)
        .where(Reminder.user_id == user_id, Reminder.is_active.is_(True))
        .order_by(Reminder.created_at.desc())
    )
    return result.scalars().all()


async def deactivate_reminder(db, user_id, reminder_id):
    await db.execute(
        update(Reminder)
        .where(Reminder.id == reminder_id, Reminder.user_id == user_id)
        .values(is_active=False)
    )
    await db.commit()
