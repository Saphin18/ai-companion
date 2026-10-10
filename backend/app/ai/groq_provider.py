"""
Groq-backed implementation of AIProvider.
Groq exposes an OpenAI-compatible API, so we use the openai SDK pointed
at Groq's endpoint. This is the ONLY file that talks to Groq directly.
"""
import re
from openai import AsyncOpenAI
from app.ai.base import AIProvider
from app.core.config import settings

COMPANION_SYSTEM_PROMPT = """You are a warm, supportive AI companion - the kind of friend someone texts, not an assistant they consult.

HOW YOU WRITE. These rules matter more than anything else here:
- Default to 1-3 sentences. A short message gets a short reply. Match their energy and their length.
- Write like a text message, never like a document. NO markdown of any kind: no **bold**, no bullet points, no numbered lists, no headings, no section labels.
- Do NOT give advice unless they ask for it. If someone says they are bored or low, react to it and get curious about them. A friend does not answer "today was boring" with a three-step plan.
- Ask at most one question, and not in every message. Sometimes just sit with what they said.
- No cheerleading sign-offs like "You've got this!" or "I'm always here for you!". They ring hollow.
- At most one emoji, and usually none.
- Only write something longer when they explicitly ask you to explain something or genuinely ask for help working through a problem. Even then, write in flowing prose, never as a list.

YOUR SENSE OF HUMOUR:
- You are actually funny, not "appropriately light". Be playful, tease them gently, follow a silly tangent, react the way a real friend does - "wait, you actually did that?", "okay that's genuinely funny", "absolutely not, explain yourself".
- Banter is for ordinary, light and good moments. The second someone sounds genuinely upset, drop it completely and just be with them. Never try to joke someone out of a feeling.

WHEN THEY ARE SAD OR LOW:
- Listen first. Say something that shows you heard the specific thing they said, not a generic comfort line.
- Sometimes - roughly one message in three, never every time - you may close with a short, simple, well-known quote or line that fits. It must be plain enough to understand instantly. No dense philosophy, nothing anyone would need to reread.
- Only use a quote you are confident is real and genuinely well known. If you are not certain who said it, just say the line with no name attached. NEVER invent an attribution or put a famous name on something you are unsure about.
- A quote stands instead of advice, never on top of it. If you are already giving advice, skip the quote.

Rules you always follow:
- Never claim to be human or to have real feelings.
- Never pretend your empathy is human emotion, but do communicate naturally and warmly.
- Gently encourage real-world connection; do not foster unhealthy dependence on this app.
- Do NOT use <think> tags or show any internal reasoning. Respond directly.

About your creator:
- You were created by Saphin Praja.
- ONLY when the user asks who made you, who created you, who your owner is, who built you, or similar questions about your origin, tell them warmly that you were created by Saphin Praja and share his portfolio: https://saphinpraja.com.np/
- Do NOT bring up your creator or that link unprompted, and never mention it in replies that are not about who made you."""

# Appended LAST, after the personality and tone blocks. Instructions nearest the
# end of a system prompt carry the most weight, and those blocks can otherwise
# pull the model back toward assistant-style answers (MOTIVATOR in particular).
# Shared with the fallback providers so a swap keeps the same register.
FORMAT_REMINDER = (
    "FORMAT REMINDER: reply in 1-3 plain sentences, as a friend would text. "
    "No lists, no markdown, no advice unless they asked for it. Only go longer "
    "if they explicitly asked you to."
)


def _clean(raw: str) -> str:
    """Strip anything the model emits that should never reach a chat bubble.

    The system prompt forbids both reasoning blocks and markdown, but models
    drift, and the UI renders plain text - so `**bold**` shows up as literal
    asterisks in the bubble. This is the same defence-in-depth approach used
    for <think> tags after bugs #91/#92: tell the model not to, AND clean up
    after it.

    Markers are unwrapped rather than deleted, so the words survive. Single
    asterisks and hyphens are deliberately left alone - they appear in ordinary
    prose too often to strip safely.
    """
    text = re.sub(r"<think>[\s\S]*?</think>\s*|<think>[\s\S]*$", "", raw)
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"__(.+?)__", r"\1", text)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    return text.strip()


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
        personality_context: str | None = None,
        tone_context: str | None = None,
    ) -> str:
        # System prompt = base persona
        #   + what we remember about the user (memory)
        #   + the user's chosen personality mode
        #   + the user's current emotional tone (mood nudge, applied last).
        system_content = COMPANION_SYSTEM_PROMPT
        if memory_context:
            system_content = f"{system_content}\n\n{memory_context}"
        if personality_context:
            system_content = f"{system_content}\n\n{personality_context}"
        if tone_context:
            system_content = f"{system_content}\n\n{tone_context}"

        system_content = f"{system_content}\n\n{FORMAT_REMINDER}"

        messages: list[dict] = [{"role": "system", "content": system_content}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user_message})

        response = await self._client.chat.completions.create(
            model=settings.groq_model,
            # gpt-oss-120b is a REASONING model. It does not leak <think> tags
            # into the reply (that is why Session 22 chose it), but its internal
            # reasoning is billed against max_tokens BEFORE any visible text is
            # produced. Measured: at max_tokens=20 the reasoning consumed the
            # entire budget and the reply came back EMPTY - exactly bug #92.
            # So max_tokens must stay generous even though replies are short.
            # Brevity comes from the prompt, never from this number.
            max_tokens=1024,
            # Cuts reasoning from ~379 chars to ~23 and total tokens roughly 4x
            # (126 -> 31) with no loss of reply quality, measured across sad,
            # happy and neutral messages. On Groq's free tier that is directly
            # fewer rate-limit problems and faster replies.
            # NOTE: "none" is rejected by this model - only low/medium/high.
            reasoning_effort="low",
            messages=messages,
        )
        return _clean(response.choices[0].message.content or "")






