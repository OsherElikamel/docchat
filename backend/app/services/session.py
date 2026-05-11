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
    message_count: int = 0


sessions: dict[str, Session] = {}


def create_session(doc_id: str) -> Session:
    session_id = uuid.uuid4().hex[:12]
    session = Session(id=session_id, doc_id=doc_id)
    sessions[session_id] = session
    return session


def get_session(session_id: str) -> Session | None:
    return sessions.get(session_id)


def is_rate_limited(session: Session) -> bool:
    return session.message_count >= settings.max_messages_per_session


def remaining_messages(session: Session) -> int:
    return max(0, settings.max_messages_per_session - session.message_count)
