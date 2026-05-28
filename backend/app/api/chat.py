from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.groq_client import ask_groq
from app.services.chat_memory import append_session_turn, get_session_history
from app.services.wcag_kb import get_wcag_rules


router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1, max_length=2000)


class RuleReference(BaseModel):
    id: str
    title: str


class ChatResponse(BaseModel):
    response: str
    rules_used: list[RuleReference]


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    session_id = request.session_id.strip() or "default"
    matched_rules = get_wcag_rules(request.message)
    history = get_session_history(session_id)
    response = ask_groq(request.message, matched_rules, history=history)
    append_session_turn(session_id, "user", request.message)
    append_session_turn(session_id, "assistant", response)

    rules_used = [RuleReference(id=rule["id"], title=rule["title"]) for rule in matched_rules]
    return ChatResponse(response=response, rules_used=rules_used)
