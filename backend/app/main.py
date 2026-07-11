from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chat, health

app = FastAPI(title="AI Companion API")

# Allow the mobile app to call this API during development.
# TODO: restrict allow_origins before production deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(chat.router)
