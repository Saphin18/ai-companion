"""FastAPI application entrypoint: CORS + routers."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import (
    chat,
    confirmed,
    goals,
    health,
    internal,
    journal,
    profile,
    push,
    reminders,
    reset_password,
)

app = FastAPI(title="AI Companion API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(profile.router)
app.include_router(journal.router)
app.include_router(confirmed.router)
app.include_router(reset_password.router)
app.include_router(reminders.router)
app.include_router(goals.router)
app.include_router(push.router)
app.include_router(internal.router)
