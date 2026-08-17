"""
Pulls durable personal facts out of a conversation turn using Groq.
Best-effort: on any failure it returns an empty list so chat never breaks.
"""
import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.models.memory import ExtractedMemory

_client = AsyncOpenAI(
    api_key=settings.groq_api_key,
    base_url="https://api.groq.com/openai/v1",
)

_EXTRACTION_PROMPT = """You extract durable facts a supportive AI companion should \
remember about the USER across future conversations.

Return ONLY a JSON object of this exact shape:
{"memories": [{"category": "fact", "content": "...", "importance": 3}]}

Rules:
- category is one of: fact, preference, goal, event, relationship.
- content is a short third-person statement about the user (e.g. "Has a dog named Max").
- importance is 1 (minor) to 5 (core to who they are).
- Only include NEW, lasting, personal facts. Ignore small talk, questions, opinions \
about the AI, and anything temporary.
- Do NOT repeat facts already in the KNOWN list.
- If there is nothing worth remembering, return {"memories": []}."""


async def extract_memories(
    user_message: str, assistant_reply: str, known_facts: list[str]
) -> list[ExtractedMemory]:
    known = "\n".join(f"- {f}" for f in known_facts) if known_facts else "(none)"
    user_block = (
        f"KNOWN facts about the user:\n{known}\n\n"
        f"New exchange:\nUSER: {user_message}\nAI: {assistant_reply}"
    )
    try:
        response = await _client.chat.completions.create(
            model="openai/gpt-oss-120b",
            max_tokens=500,
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": _EXTRACTION_PROMPT},
                {"role": "user", "content": user_block},
            ],
        )
        raw = response.choices[0].message.content or "{}"
        data = json.loads(raw)
        items = data.get("memories", [])
        results: list[ExtractedMemory] = []
        for it in items:
            if isinstance(it, dict) and it.get("content"):
                results.append(
                    ExtractedMemory(
                        category=str(it.get("category", "fact")),
                        content=str(it["content"]),
                        importance=int(it.get("importance", 3)),
                    )
                )
        return results
    except Exception:
        return []

