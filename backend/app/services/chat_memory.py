from collections import defaultdict
from threading import Lock
from typing import TypedDict


class ChatTurn(TypedDict):
    role: str
    content: str


_sessions: dict[str, list[ChatTurn]] = defaultdict(list)
_lock = Lock()
_MAX_MESSAGES = 8


def get_session_history(session_id: str) -> list[ChatTurn]:
    with _lock:
        return list(_sessions.get(session_id, []))


def append_session_turn(session_id: str, role: str, content: str) -> None:
    with _lock:
        turns = _sessions[session_id]
        turns.append({"role": role, "content": content})
        if len(turns) > _MAX_MESSAGES:
            _sessions[session_id] = turns[-_MAX_MESSAGES:]


def clear_session(session_id: str) -> None:
    with _lock:
        _sessions.pop(session_id, None)
