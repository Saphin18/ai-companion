"""
AIProvider is the interface between our app and whichever AI service
answers messages. Chat code depends on THIS interface, never on a specific
AI vendor's SDK directly. Swapping providers later means writing one new
class here - nothing else in the app changes.

The keyword arguments below are not optional extras: api/chat.py passes ALL
of them on every call. A provider that does not accept them raises
"TypeError: generate_reply() got an unexpected keyword argument 'history'"
on the first message, which is exactly what made the Claude and Gemini
providers unusable as a fallback until Session 23.

If you add a new provider, accept every argument - even if you ignore some
of them - or the swap will fail the moment it is needed.
"""

from abc import ABC, abstractmethod


class AIProvider(ABC):
    @abstractmethod
    async def generate_reply(
        self,
        user_message: str,
        *,
        history: list[dict] | None = None,
        memory_context: str | None = None,
        personality_context: str | None = None,
        tone_context: str | None = None,
    ) -> str:
        """Return the companion's reply to the user's latest message.

        history           prior turns as [{"role": "user"|"assistant", "content": str}]
        memory_context    durable facts about the user, plus their active goals
        personality_context  the user's chosen personality mode, if not "balanced"
        tone_context      how to pitch this reply, based on their detected mood
        """
        raise NotImplementedError
