"""
Supabase Storage helper (private `attachments` bucket).

Uses the REST API with the service-role key via httpx — the same approach
app/api/profile.py already uses for admin account deletion. The service role
bypasses RLS, so the bucket stays private and only this backend can reach it.
"""
import httpx
from app.core.config import settings

BUCKET = "attachments"
SIGNED_URL_TTL = 60 * 60  # 1 hour


def _headers() -> dict:
    key = settings.supabase_service_role_key
    return {"apikey": key, "Authorization": f"Bearer {key}"}


def _base() -> str:
    return f"{settings.supabase_url}/storage/v1"


async def upload(path: str, data: bytes, content_type: str) -> bool:
    """Upload bytes to attachments/<path>. Returns True on success."""
    if not settings.supabase_service_role_key:
        return False
    headers = _headers()
    headers["Content-Type"] = content_type or "application/octet-stream"
    headers["x-upsert"] = "true"
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(
                f"{_base()}/object/{BUCKET}/{path}",
                headers=headers,
                content=data,
            )
        return r.status_code in (200, 201)
    except Exception:
        return False


async def signed_url(path: str, expires_in: int = SIGNED_URL_TTL) -> str | None:
    """Create a short-lived URL the app can use to play/open a private file."""
    if not settings.supabase_service_role_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                f"{_base()}/object/sign/{BUCKET}/{path}",
                headers=_headers(),
                json={"expiresIn": expires_in},
            )
        if r.status_code != 200:
            return None
        rel = (r.json() or {}).get("signedURL")
        if not rel:
            return None
        return f"{_base()}{rel}" if rel.startswith("/") else rel
    except Exception:
        return None


async def remove(path: str) -> bool:
    """Delete a stored file. Only used when account deletion runs."""
    if not settings.supabase_service_role_key:
        return False
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.delete(
                f"{_base()}/object/{BUCKET}/{path}", headers=_headers()
            )
        return r.status_code in (200, 204)
    except Exception:
        return False
