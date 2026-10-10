"""
Claude-backed implementation of AIProvider.
This is the ONLY file that talks to the Anthropic SDK directly.

INACTIVE: Groq is the live provider (see provider_factory.py). This file is
the fallback for the day Groq retires a model or goes down, as happened in
Session 22. It is kept signature-compatible with api/chat.py on purpose -
a fallback that has not been kept in step is not a fallback.

Needs ANTHROPIC_API_KEY plus billing on the Anthropic account (see mistake #8).
"""

from anthropic import AsyncAnthropic

from app.ai.base import AIProvider
from app.ai.groq_provider import COMPANION_SYSTEM_PROMPT, FORMAT_REMINDER
from app.core.config import settings


class ClaudeProvider(AIProvider):
    def __init__(self) -> None:
        self._client = AsyncAnthropic(api_key=settings.anthropic_api_key)

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

        # Anthropic uses the same {"role": "user"|"assistant"} shape we store,
        # so history passes through unchanged.
        messages = list(history or [])
        messages.append({"role": "user", "content": user_message})

        response = await self._client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            system=system,
            messages=messages,
        )
        for block in response.content:
            if block.type == "text":
                return block.text
        return ""
