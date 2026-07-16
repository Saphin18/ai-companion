"""FastAPI application entrypoint: CORS + routers."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat, confirmed, health, journal, profile, reset_password

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