"""
Detects the USER's current emotional tone from their latest message using Groq.
Best-effort: on any failure it returns None so chat/adaptation never breaks.
"""
import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.models.mood import MoodReading

_client = AsyncOpenAI(
    api_key=settings.groq_api_key,
    base_url="https://api.groq.com/openai/v1",
)

_MOOD_PROMPT = """You classify the USER's current emotional tone from their latest message.
Return ONLY a JSON object of this exact shape:
{"mood": "neutral", "intensity": 3, "note": ""}
Rules:
- mood is ONE lowercase word, one of: happy, excited, calm, neutral, tired, sad, \
anxious, angry, stressed, lonely, grateful.
- intensity is 1 (very mild) to 5 (very strong).
- note is a very short (<=8 words) reason, or "".
- Judge ONLY the user's message. Ignore anything the AI said.
- If the tone is unclear, use "neutral" with intensity 2."""


async def detect_mood(user_message: str) -> MoodReading | None:
    try:
        response = await _client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=120,
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": _MOOD_PROMPT},
                {"role": "user", "content": user_message},
            ],
        )
        raw = response.choices[0].message.content or "{}"
        data = json.loads(raw)

        mood = str(data.get("mood", "neutral")).strip().lower() or "neutral"
        try:
            intensity = int(data.get("intensity", 2))
        except (TypeError, ValueError):
            intensity = 2
        intensity = max(1, min(5, intensity))
        note = str(data.get("note", "") or "").strip()

        return MoodReading(mood=mood, intensity=intensity, note=note)
    except Exception:
        return None