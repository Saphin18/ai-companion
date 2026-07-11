"""
Single place that decides which AIProvider implementation is active.
To switch providers app-wide, change the one line marked below.
"""

from app.ai.base import AIProvider
from app.ai.groq_provider import GroqProvider

_provider_instance: AIProvider | None = None


def get_ai_provider() -> AIProvider:
    global _provider_instance
    if _provider_instance is None:
        # Swap this line to change providers (e.g. GeminiProvider()).
        _provider_instance = GroqProvider()
    return _provider_instance
