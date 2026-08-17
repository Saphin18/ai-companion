"""
Writes a short, caring reflection on a user's journal entry using Groq.
Best-effort: on failure it returns a gentle default so the entry still saves.
"""
from openai import AsyncOpenAI
from app.core.config import settings

_client = AsyncOpenAI(
    api_key=settings.groq_api_key,
    base_url="https://api.groq.com/openai/v1",
)

_REFLECTION_PROMPT = """You are a warm, supportive companion reading a page from \
someone's private journal. Write a SHORT reflection back to them (2-3 sentences).
Rules:
- Be gentle, validating and kind, like a caring friend who truly listened.
- Acknowledge how they feel; do not judge, lecture, or pile on advice.
- You may offer one soft, hopeful thought, but keep it light.
- Speak directly to them ("you"). Warm and human, never clinical.
- Do NOT give medical advice or crisis instructions."""

_DEFAULT_REFLECTION = (
    "Thank you for writing this down. Whatever today held, it matters that you "
    "took a moment for yourself â€” and I'm glad you did."
)


async def generate_reflection(entry_text: str) -> str:
    try:
        response = await _client.chat.completions.create(
            model="openai/gpt-oss-120b",
            max_tokens=200,
            temperature=0.7,
            messages=[
                {"role": "system", "content": _REFLECTION_PROMPT},
                {"role": "user", "content": entry_text},
            ],
        )
        text = (response.choices[0].message.content or "").strip()
        return text or _DEFAULT_REFLECTION
    except Exception:
        return _DEFAULT_REFLECTION

