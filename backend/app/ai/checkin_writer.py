import httpx
from app.core.config import settings

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "qwen/qwen3.6-27b"
DEFAULT_LINE = "Hey, just thinking of you. How is your day going? I am here whenever you want to talk."


async def generate_checkin(goal_titles=None):
    """Best-effort: write ONE short, warm daily check-in line. Never raises."""
    try:
        goals_note = ""
        if goal_titles:
            goals_note = " The user is working on: " + ", ".join(goal_titles[:3]) + "."
        prompt = (
            "You are a warm, caring AI companion sending a short daily check-in "
            "notification to your friend. Write ONE friendly sentence (max about 20 words), "
            "gentle and non-pushy, inviting them to chat if they want. No greeting like "
            "'Dear', no sign-off, just the sentence." + goals_note
        )
        async with httpx.AsyncClient(timeout=12) as c:
            r = await c.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                json={
                    "model": MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.9,
                    "max_tokens": 60,
                },
            )
            data = r.json()
            line = data["choices"][0]["message"]["content"].strip().strip('"')
            return line or DEFAULT_LINE
    except Exception:
        return DEFAULT_LINE

