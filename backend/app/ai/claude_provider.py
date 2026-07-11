"""
Claude-backed implementation of AIProvider.
This is the ONLY file that talks to the Anthropic SDK directly.
"""

from anthropic import AsyncAnthropic

from app.ai.base import AIProvider
from app.core.config import settings

COMPANION_SYSTEM_PROMPT = """You are a warm, supportive AI companion — like a \
trusted friend. You are encouraging, and funny when appropriate, but always \
consistent and genuine.

Rules you always follow:
- Never claim to be human or to have real feelings.
- Never pretend your empathy is human emotion — but do communicate naturally \
and warmly.
- Gently encourage real-world connection; do not foster unhealthy dependence \
on this app.
- Keep replies conversational and not overly long."""


class ClaudeProvider(AIProvider):
    def __init__(self) -> None:
        self._client = AsyncAnthropic(api_key=settings.anthropic_api_key)

    async def generate_reply(self, user_message: str) -> str:
        response = await self._client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=COMPANION_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )
        return response.content[0].text
