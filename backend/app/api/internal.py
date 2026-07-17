from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.config import settings
from app.repositories import checkin_repository as checkins
from app.repositories import goal_repository as goals
from app.repositories import push_repository as pushes
from app.ai.checkin_writer import generate_checkin
from app.services.expo_push import send_push

router = APIRouter()


@router.post("/internal/run-checkins")
async def run_checkins(
    x_cron_secret: str = Header(default=""),
    db: AsyncSession = Depends(get_db),
):
    if not settings.cron_secret or x_cron_secret != settings.cron_secret:
        raise HTTPException(status_code=403, detail="forbidden")

    now = datetime.now(timezone.utc)
    now_min = now.hour * 60 + now.minute
    sent = 0

    for p in await checkins.get_checkin_enabled_profiles(db):
        try:
            uid = str(p.id)
            offset = p.checkin_tz_offset_minutes or 0
            target = ((p.checkin_hour * 60 + p.checkin_minute) + offset) % 1440
            local_now = now - timedelta(minutes=offset)
            local_today = local_now.date()

            if p.last_checkin_date == local_today:
                continue
            if not (0 <= (now_min - target) % 1440 <= 15):
                continue

            titles = await goals.active_goal_titles(db, uid)
            line = await generate_checkin(titles)
            for tok in await pushes.get_tokens(db, uid):
                await send_push(tok, "Saphin AI", line, {"type": "checkin"})
            await checkins.set_last_checkin_date(db, p.id, local_today)
            sent += 1
        except Exception:
            continue

    return {"sent": sent}
