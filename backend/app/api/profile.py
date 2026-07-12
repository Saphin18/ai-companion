"""Profile endpoints (require a valid Supabase JWT)."""
import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.dependencies import get_current_user_id
from app.core.config import settings
from app.db.session import get_db
from app.models.profile import ProfileOut, ProfileUpdate
from app.repositories import profile_repository as repo

router = APIRouter()


@router.get("/profile", response_model=ProfileOut)
async def read_profile(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ProfileOut:
    profile = await repo.get_profile(db, user_id)
    return ProfileOut(display_name=profile.display_name if profile else None)


@router.put("/profile", response_model=ProfileOut)
async def update_profile(
    payload: ProfileUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ProfileOut:
    profile = await repo.upsert_profile(db, user_id, payload.display_name.strip())
    await db.commit()
    return ProfileOut(display_name=profile.display_name)


@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> None:
    """
    Permanently delete the caller's Supabase auth account.

    This frees the email for reuse (a re-signup starts fresh). Chat data in
    our own tables is keyed by a plain user_id column with no FK to auth.users,
    so it is intentionally left in the database and NOT deleted.
    """
    if not settings.supabase_service_role_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server is missing the service role key.",
        )
    url = f"{settings.supabase_url}/auth/v1/admin/users/{user_id}"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.delete(url, headers=headers)
    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach the auth service.",
        )
    # 200 or 204 both mean the user was deleted.
    if resp.status_code not in (200, 204):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not delete account.",
        )
