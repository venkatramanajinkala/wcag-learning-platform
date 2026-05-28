from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.groq_client import ask_groq
from app.services.wcag_kb import get_wcag_rules


router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    answer: str
    wcag_context: list[str]


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    matched_rules = get_wcag_rules(request.message)
    answer = ask_groq(request.message, matched_rules)
    return ChatResponse(answer=answer, wcag_context=matched_rules)
