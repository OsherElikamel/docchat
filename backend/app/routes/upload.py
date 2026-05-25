import io
import logging

from fastapi import APIRouter, HTTPException, UploadFile

from app.config import settings

logger = logging.getLogger("docchat")
from app.services.document import chunk_text, parse_pdf, store_document
from app.services.session import create_session

router = APIRouter()


@router.post("/upload")
async def upload_document(file: UploadFile):
    if not file.filename:
        raise HTTPException(400, "No file provided")

    content = await file.read()

    if len(content) > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(413, f"File too large. Maximum {settings.max_upload_size_mb}MB")

    filename_lower = file.filename.lower()

    if filename_lower.endswith(".pdf"):
        try:
            text = parse_pdf(io.BytesIO(content))
        except Exception:
            logger.exception("PDF parse failed for %s", file.filename)
            raise HTTPException(400, "Could not parse PDF")
    elif filename_lower.endswith(".txt") or filename_lower.endswith(".md"):
        text = content.decode("utf-8", errors="replace")
    else:
        raise HTTPException(400, "Unsupported file type. Upload a PDF, TXT, or MD file")

    if not text.strip():
        raise HTTPException(400, "Document appears to be empty")

    chunks = chunk_text(text, settings.chunk_size, settings.chunk_overlap)
    doc_id = store_document(file.filename, chunks)
    session = create_session(doc_id)

    return {
        "session_id": session.id,
        "doc_id": doc_id,
        "filename": file.filename,
        "chunks": len(chunks),
        "remaining_messages": settings.max_messages_per_session,
    }
