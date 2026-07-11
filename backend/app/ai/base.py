"""
AIProvider is the interface between our app and whichever AI service
answers messages. Chat code depends on THIS interface, never on a specific
AI vendor'"'"'s SDK directly. Swapping providers later means writing one new
class here — nothing else in the app changes.
"""

from abc import ABC, abstractmethod


class AIProvider(ABC):
    @abstractmethod
    async def generate_reply(self, user_message: str) -> str:
        """Return the companion'"'"'s reply to a single user message."""
        raise NotImplementedError
