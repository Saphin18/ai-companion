"""
Speech-to-text via Groq Whisper.
Best-effort: any failure returns None so the caller can carry on.
"""
from openai import AsyncOpenAI
from app.core.config import settings

MODEL = "whisper-large-v3-turbo"
MAX_BYTES = 20 * 1024 * 1024   # Groq caps uploads; speech audio is far smaller

_client = AsyncOpenAI(
    api_key=settings.groq_api_key,
    base_url="https://api.groq.com/openai/v1",
)


async def transcribe(
    audio_bytes: bytes,
    filename: str = "voice.m4a",
    language: str | None = None,
) -> str | None:
    """Turn a recorded audio clip into text. Returns None if anything fails.

    `language` is an ISO-639-1 hint ("en", "ne", "hi"). Leaving it None lets
    Whisper auto-detect, which handles code-switching better.
    """
    if not audio_bytes or len(audio_bytes) > MAX_BYTES:
        return None
    try:
        kwargs: dict = {}
        if language:
            kwargs["language"] = language
        result = await _client.audio.transcriptions.create(
            model=MODEL,
            file=(filename, audio_bytes),
            **kwargs,
        )
        text = (result.text or "").strip()
        return text or None
    except Exception:
        return None
