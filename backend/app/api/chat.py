from fastapi import APIRouter, Depends, HTTPException

from app.ai.base import AIProvider
from app.ai.provider_factory import get_ai_provider
from app.auth.dependencies import get_current_user_id
from app.models.chat import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def send_message(
    body: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    ai_provider: AIProvider = Depends(get_ai_provider),
) -> ChatResponse:
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        reply = await ai_provider.generate_reply(body.message)
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="I am having trouble responding right now. Please try again in a moment.",
        )

    return ChatResponse(reply=reply)
