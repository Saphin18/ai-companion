"""
Verifies the Supabase access token sent by the mobile app (as a Bearer
token) and returns the current user's id. Any endpoint that needs to know
"who is calling" depends on get_current_user_id.

Supabase signs tokens with a rotating public/private key pair (JWKS).
We fetch Supabase's public keys via httpx (with a browser-like User-Agent,
since Supabase's edge network blocks default HTTP clients) and cache them.

Two hard-won details:

1. CLOCK SKEW. If our clock is even a second behind Supabase's, a freshly
   issued token looks "not yet valid" (iat in the future) and PyJWT raises
   ImmatureSignatureError -> the user is wrongly told to log in again.
   A small leeway absorbs normal drift.

2. JWKS CACHE. The cache is a module-level global, so it is EMPTY after
   every restart (Render cold start, uvicorn --reload). A failed key fetch
   must never be reported as "invalid session": that tells the user to log
   in again when logging in cannot possibly help.
"""
import time
from datetime import timedelta
import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings

_security = HTTPBearer()
_jwks_cache: dict = {}
_jwks_cache_time: float = 0
_JWKS_CACHE_SECONDS = 3600
_JWKS_ATTEMPTS = 3
_JWKS_TIMEOUT = 6

# Grace window for clock differences between us and Supabase.
_CLOCK_SKEW_LEEWAY = timedelta(seconds=30)


class _JwksUnavailable(Exception):
    """Could not reach Supabase's key server AND we have no cached keys."""


def _get_jwks() -> dict:
    """Return Supabase's public keys, retrying and falling back to stale cache."""
    global _jwks_cache, _jwks_cache_time

    if _jwks_cache and (time.time() - _jwks_cache_time) < _JWKS_CACHE_SECONDS:
        return _jwks_cache

    url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
    headers = {"User-Agent": "Mozilla/5.0 (compatible; AICompanionBackend/1.0)"}

    last_error: Exception | None = None
    for attempt in range(_JWKS_ATTEMPTS):
        try:
            response = httpx.get(url, headers=headers, timeout=_JWKS_TIMEOUT)
            response.raise_for_status()
            data = response.json()
            if data.get("keys"):
                _jwks_cache = data
                _jwks_cache_time = time.time()
                return _jwks_cache
            last_error = ValueError("JWKS response contained no keys")
        except Exception as exc:
            last_error = exc
        if attempt < _JWKS_ATTEMPTS - 1:
            time.sleep(0.5 * (attempt + 1))

    # Every attempt failed. A stale key beats logging everyone out; Supabase
    # signing keys rotate rarely. Deliberately do NOT clear the cache here.
    if _jwks_cache:
        return _jwks_cache

    raise _JwksUnavailable(str(last_error))


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> str:
    token = credentials.credentials

    # Step 1: can we reach the key server? A failure here is OUR problem,
    # so it must not be reported as a bad session.
    try:
        jwks = _get_jwks()
    except _JwksUnavailable:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not verify your session right now. Please try again in a moment.",
        )

    # Step 2: is the token itself genuine? A failure here IS the user's session.
    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        matching_key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
        if matching_key is None:
            raise jwt.InvalidTokenError("No matching signing key found.")
        signing_key = jwt.PyJWK.from_dict(matching_key).key
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            leeway=_CLOCK_SKEW_LEEWAY,
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please log in again.",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token.",
        )
    return user_id
