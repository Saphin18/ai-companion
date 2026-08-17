from datetime import datetime, timezone
from sqlalchemy import select, update
from app.db.models import Goal


async def create_goal(db, user_id, title, detail):
    row = Goal(user_id=user_id, title=title, detail=detail, status="active")
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def list_goals(db, user_id, status=None):
    q = select(Goal).where(Goal.user_id == user_id)
    if status:
        q = q.where(Goal.status == status)
    q = q.order_by(Goal.created_at.desc())
    result = await db.execute(q)
    return result.scalars().all()


async def update_goal(db, user_id, goal_id, values):
    if values.get("status") == "done":
        values["completed_at"] = datetime.now(timezone.utc)
    await db.execute(
        update(Goal)
        .where(Goal.id == goal_id, Goal.user_id == user_id)
        .values(**values)
    )
    await db.commit()


async def delete_goal(db, user_id, goal_id):
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == user_id)
    )
    row = result.scalar_one_or_none()
    if not row:
        return False
    await db.delete(row)
    await db.commit()
    return True


async def active_goal_titles(db, user_id):
    result = await db.execute(
        select(Goal.title).where(Goal.user_id == user_id, Goal.status == "active")
    )
    return [r[0] for r in result.all()]


