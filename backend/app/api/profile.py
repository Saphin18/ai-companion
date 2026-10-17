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
from app.repositories import push_repository as push_repo

router = APIRouter()


@router.get("/profile", response_model=ProfileOut)
async def read_profile(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ProfileOut:
    profile = await repo.get_profile(db, user_id)
    if profile is None:
        return ProfileOut()
    return ProfileOut.model_validate(profile)


@router.put("/profile", response_model=ProfileOut)
async def update_profile(
    payload: ProfileUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ProfileOut:
    # Only the fields the client actually sent get updated (partial update).
    changes = payload.model_dump(exclude_unset=True)
    if changes.get("display_name") is not None:
        changes["display_name"] = changes["display_name"].strip()
    profile = await repo.update_profile_fields(db, user_id, changes)
    await db.commit()
    await db.refresh(profile)
    return ProfileOut.model_validate(profile)


@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Permanently delete the caller's Supabase auth account.
    This frees the email for reuse (a re-signup starts fresh). Chat data in
    our own tables is keyed by a plain user_id column with no FK to auth.users,
    so it is intentionally left in the database and NOT deleted (rule 0.4).

    Bug #101: "keep their data" was read as "change nothing", so a deleted
    account kept `checkin_enabled = true` and kept its push tokens, and the
    daily `run-checkins` cron iterates profiles - not auth users. People who
    deleted their account carried on getting a notification every morning,
    forever, with no way to stop it.

    Notifications are not chat data. The two are silenced here BEFORE the auth
    user is deleted, so that if the Supabase call then fails we have not left
    someone half-deleted and still being pushed to.
    """
    # Silence notifications first - see the note above about ordering.
    # update_profile_fields CREATES a row when none exists, which would leave
    # a brand new profile behind for an account being deleted, so check first.
    try:
        if await repo.get_profile(db, user_id) is not None:
            await repo.update_profile_fields(db, user_id, {"checkin_enabled": False})
            await db.commit()
    except Exception:
        await db.rollback()
    try:
        await push_repo.delete_tokens_for_user(db, user_id)
    except Exception:
        await db.rollback()

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
    if resp.status_code not in (200, 204):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not delete account.",
        )