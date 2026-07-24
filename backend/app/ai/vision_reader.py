"""
Image -> short text description via Groq's Qwen vision model.

Your chat model (llama-3.3-70b-versatile) is text-only, so images are
converted to text HERE and then injected like any other context.
Best-effort: any failure returns None.
"""
import base64
import re
from openai import AsyncOpenAI
from app.core.config import settings

MODEL = "qwen/qwen3.6-27b"
MAX_BYTES = 8 * 1024 * 1024

PROMPT = (
    "Describe this image for someone who cannot see it. Be specific and factual: "
    "what is in it, any text that is visible, and the setting or mood. "
    "Keep it under 120 words. Do not guess at anything you cannot clearly see."
)

_client = AsyncOpenAI(
    api_key=settings.groq_api_key,
    base_url="https://api.groq.com/openai/v1",
)


def _strip_thinking(text: str) -> str:
    """Qwen is a reasoning model; remove any <think>...</think> block."""
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    text = re.sub(r"^.*?</think>", "", text, flags=re.DOTALL)
    return text.replace("<think>", "").strip()


async def describe_image(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
) -> str | None:
    """Return a plain-text description of an image, or None on failure."""
    if not image_bytes or len(image_bytes) > MAX_BYTES:
        return None

    b64 = base64.b64encode(image_bytes).decode()
    messages = [{
        "role": "user",
        "content": [
            {"type": "text", "text": PROMPT},
            {"type": "image_url",
             "image_url": {"url": f"data:{mime_type};base64,{b64}"}},
        ],
    }]

    try:
        r = await _client.chat.completions.create(
            model=MODEL,
            max_tokens=400,
            reasoning_effort="none",
            messages=messages,
        )
        out = _strip_thinking(r.choices[0].message.content or "")
        if out:
            return out
    except Exception:
        pass

    try:
        r = await _client.chat.completions.create(
            model=MODEL,
            max_tokens=900,
            messages=messages,
        )
        return _strip_thinking(r.choices[0].message.content or "") or None
    except Exception:
        return None
