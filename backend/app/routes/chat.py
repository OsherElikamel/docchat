from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.chat import get_response
from app.services.document import get_document
from app.services.session import get_session, is_rate_limited, remaining_messages

router = APIRouter()


class ChatRequest(BaseModel):
    session_id: str
    question: str


@router.post("/chat")
def chat(req: ChatRequest):
    session = get_session(req.session_id)
    if not session:
        raise HTTPException(404, "Session not found. Upload a document first")

    if is_rate_limited(session):
        raise HTTPException(429, "Message limit reached. Upload a new document to start a new session")

    document = get_document(session.doc_id)
    if not document:
        raise HTTPException(404, "Document not found")

    if not req.question.strip():
        raise HTTPException(400, "Question cannot be empty")

    try:
        answer = get_response(session, document, req.question)
    except Exception:
        raise HTTPException(502, "Failed to get a response from the AI model. Please try again")

    return {
        "answer": answer,
        "remaining_messages": remaining_messages(session),
    }
