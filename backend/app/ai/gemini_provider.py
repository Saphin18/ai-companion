"""
Gemini-backed implementation of AIProvider.
This is the ONLY file that talks to the Google Gemini SDK directly.

INACTIVE: Groq is the live provider (see provider_factory.py). This file is
the fallback for the day Groq retires a model or goes down, as happened in
Session 22. It is kept signature-compatible with api/chat.py on purpose -
a fallback that has not been kept in step is not a fallback.

Needs GEMINI_API_KEY, and the free tier was zero-quota in Nepal when this was
last tried (see mistake #9).
"""

from google import genai
from google.genai import types

from app.ai.base import AIProvider
from app.ai.groq_provider import COMPANION_SYSTEM_PROMPT, FORMAT_REMINDER
from app.core.config import settings


class GeminiProvider(AIProvider):
    def __init__(self) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)

    async def generate_reply(
        self,
        user_message: str,
        *,
        history: list[dict] | None = None,
        memory_context: str | None = None,
        personality_context: str | None = None,
        tone_context: str | None = None,
    ) -> str:
        # Same assembly order as GroqProvider, so switching provider does not
        # silently change the companion's personality:
        #   base persona -> memory (+ goals) -> personality mode -> tone
        system = COMPANION_SYSTEM_PROMPT
        if memory_context:
            system = f"{system}\n\n{memory_context}"
        if personality_context:
            system = f"{system}\n\n{personality_context}"
        if tone_context:
            system = f"{system}\n\n{tone_context}"
        system = f"{system}\n\n{FORMAT_REMINDER}"

        # Gemini calls the assistant role "model", so our stored history has to
        # be translated. Anything that is not "assistant" is treated as a user
        # turn, which matches how we only ever store "user"/"assistant".
        contents = []
        for turn in history or []:
            role = "model" if turn.get("role") == "assistant" else "user"
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part(text=turn.get("content") or "")],
                )
            )
        contents.append(
            types.Content(role="user", parts=[types.Part(text=user_message)])
        )

        response = await self._client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system,
                max_output_tokens=500,
            ),
        )
        return response.text or ""
