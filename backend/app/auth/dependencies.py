"""
Verifies the Supabase access token sent by the mobile app (as a Bearer
token) and returns the current user's id. Any endpoint that needs to know
"who is calling" depends on get_current_user_id.

Supabase signs tokens with a rotating public/private key pair (JWKS).
We fetch Supabase's public keys via httpx (with a browser-like User-Agent,
since Supabase's edge network blocks default HTTP clients) and cache them.
"""

import time

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

_security = HTTPBearer()

_jwks_cache: dict = {}
_jwks_cache_time: float = 0
_JWKS_CACHE_SECONDS = 3600


def _get_jwks() -> dict:
    global _jwks_cache, _jwks_cache_time
    if _jwks_cache and (time.time() - _jwks_cache_time) < _JWKS_CACHE_SECONDS:
        return _jwks_cache

    url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
    response = httpx.get(
        url,
        headers={"User-Agent": "Mozilla/5.0 (compatible; AICompanionBackend/1.0)"},
        timeout=10,
    )
    response.raise_for_status()
    _jwks_cache = response.json()
    _jwks_cache_time = time.time()
    return _jwks_cache


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> str:
    token = credentials.credentials
    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        jwks = _get_jwks()
        matching_key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
        if matching_key is None:
            raise jwt.InvalidTokenError("No matching signing key found.")

        signing_key = jwt.PyJWK.from_dict(matching_key).key

        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
    except (jwt.PyJWTError, httpx.HTTPError):
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
