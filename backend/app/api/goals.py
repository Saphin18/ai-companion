import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.auth.dependencies import get_current_user_id
from app.models.goal import GoalCreate, GoalUpdate, GoalOut
from app.repositories import goal_repository as repo

router = APIRouter()


@router.post("/goals", response_model=GoalOut)
async def create_goal(
    payload: GoalCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await repo.create_goal(db, str(user_id), payload.title, payload.detail)


@router.get("/goals", response_model=list[GoalOut])
async def list_goals(
    status: str | None = None,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await repo.list_goals(db, str(user_id), status)


@router.patch("/goals/{goal_id}")
async def update_goal(
    goal_id: str,
    payload: GoalUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    values = payload.model_dump(exclude_unset=True)
    if values:
        await repo.update_goal(db, str(user_id), goal_id, values)
    return {"ok": True}
