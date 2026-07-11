"""
Gemini-backed implementation of AIProvider.
This is the ONLY file that talks to the Google Gemini SDK directly.
"""

from google import genai
from google.genai import types

from app.ai.base import AIProvider
from app.core.config import settings

COMPANION_SYSTEM_PROMPT = """You are a warm, supportive AI companion, like a trusted friend. You are encouraging, and funny when appropriate, but always consistent and genuine.

Rules you always follow:
- Never claim to be human or to have real feelings.
- Never pretend your empathy is human emotion, but do communicate naturally and warmly.
- Gently encourage real-world connection; do not foster unhealthy dependence on this app.
- Keep replies conversational and not overly long."""


class GeminiProvider(AIProvider):
    def __init__(self) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)

    async def generate_reply(self, user_message: str) -> str:
        response = await self._client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=COMPANION_SYSTEM_PROMPT,
                max_output_tokens=1024,
            ),
        )
        return response.text
