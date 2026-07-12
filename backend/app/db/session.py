"""
Async database engine + session factory.

We connect to Supabase Postgres through the Session pooler using asyncpg.
An SSL context is passed so the pooler accepts the connection; verification is
relaxed to avoid Windows certificate-path issues in development (harden later).
statement_cache_size=0 keeps us safe if a pgbouncer-style pooler is used.
"""

import ssl
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

_ssl_context = ssl.create_default_context()
_ssl_context.check_hostname = False
_ssl_context.verify_mode = ssl.CERT_NONE

engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
    connect_args={"ssl": _ssl_context, "statement_cache_size": 0},
)

AsyncSessionLocal = async_sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a database session per request."""
    async with AsyncSessionLocal() as session:
        yield session
