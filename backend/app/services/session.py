import time
import uuid
from dataclasses import dataclass, field

from app.config import settings


@dataclass
class Message:
    role: str
    content: str


@dataclass
class Session:
    id: str
    doc_id: str
    messages: list[Message] = field(default_factory=list)
    exchange_count: int = 0
    created_at: float = field(default_factory=time.time)


sessions: dict[str, Session] = {}


def _evict_expired():
    cutoff = time.time() - settings.session_ttl_minutes * 60
    expired = [k for k, v in sessions.items() if v.created_at < cutoff]
    for k in expired:
        del sessions[k]


def create_session(doc_id: str) -> Session:
    _evict_expired()
    session_id = uuid.uuid4().hex
    session = Session(id=session_id, doc_id=doc_id)
    sessions[session_id] = session
    return session


def get_session(session_id: str) -> Session | None:
    return sessions.get(session_id)


def is_rate_limited(session: Session) -> bool:
    return session.exchange_count >= settings.max_messages_per_session


def remaining_messages(session: Session) -> int:
    return max(0, settings.max_messages_per_session - session.exchange_count)
