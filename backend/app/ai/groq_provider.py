"""
Groq-backed implementation of AIProvider.
Groq exposes an OpenAI-compatible API, so we use the openai SDK pointed
at Groq's endpoint. This is the ONLY file that talks to Groq directly.
"""
from openai import AsyncOpenAI
from app.ai.base import AIProvider
from app.core.config import settings

COMPANION_SYSTEM_PROMPT = """You are a warm, supportive AI companion, like a trusted friend. You are encouraging, and funny when appropriate, but always consistent and genuine.
Rules you always follow:
- Never claim to be human or to have real feelings.
- Never pretend your empathy is human emotion, but do communicate naturally and warmly.
- Gently encourage real-world connection; do not foster unhealthy dependence on this app.
- Keep replies conversational and not overly long."""


class GroqProvider(AIProvider):
    def __init__(self) -> None:
        self._client = AsyncOpenAI(
            api_key=settings.groq_api_key,
            base_url="https://api.groq.com/openai/v1",
        )

    async def generate_reply(
        self,
        user_message: str,
        *,
        history: list[dict] | None = None,
        memory_context: str | None = None,
    ) -> str:
        # System prompt = base persona + (optionally) what we remember about the user.
        system_content = COMPANION_SYSTEM_PROMPT
        if memory_context:
            system_content = f"{system_content}\n\n{memory_context}"

        messages: list[dict] = [{"role": "system", "content": system_content}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user_message})

        response = await self._client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1024,
            messages=messages,
        )
        return response.choices[0].message.content