"""FastAPI application entrypoint: CORS + routers."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import (
    attachments,
    chat,
    confirmed,
    goals,
    health,
    internal,
    journal,
    moods,
    profile,
    push,
    reminders,
    reset_password,
)

app = FastAPI(title="AI Companion API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # Browsers REJECT the combination of allow_origins=["*"] with
    # allow_credentials=True - the spec forbids a wildcard origin on a
    # credentialed request, so Starlette's "*" header is simply ignored.
    # This API authenticates with a Bearer token, never a cookie, so no
    # credentials are needed and the pair is now valid instead of silently
    # broken (noted in Session 23's audit).
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(profile.router)
app.include_router(journal.router)
app.include_router(moods.router)
app.include_router(confirmed.router)
app.include_router(reset_password.router)
app.include_router(reminders.router)
app.include_router(goals.router)
app.include_router(push.router)
app.include_router(attachments.router)
app.include_router(internal.router)
