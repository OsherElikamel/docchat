import logging

from groq import Groq

from app.config import settings
from app.services.document import Document
from app.services.session import Message, Session

logger = logging.getLogger("docchat")

client = Groq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """You are DocChat, a helpful assistant that answers questions based on the provided document.

Rules:
- Only answer based on the document content provided below.
- If the answer is not in the document, say so clearly.
- Be concise and direct.
- Quote relevant parts of the document when helpful.

Document content:
{context}"""

STOPWORDS = frozenset({
    "a", "an", "the", "is", "are", "was", "were", "be", "been",
    "am", "do", "does", "did", "have", "has", "had", "will",
    "would", "could", "should", "can", "may", "might",
    "i", "me", "my", "we", "us", "our", "you", "your",
    "he", "him", "his", "she", "her", "it", "its",
    "they", "them", "their", "this", "that", "these", "those",
    "what", "which", "who", "whom", "how", "when", "where", "why",
    "in", "on", "at", "to", "for", "of", "with", "by", "from",
    "and", "or", "but", "not", "no", "if", "so", "as",
})


def build_context(document: Document, question: str) -> str:
    scored = []
    question_lower = question.lower()
    question_words = {w for w in question_lower.split() if w not in STOPWORDS}

    if not question_words:
        question_words = set(question_lower.split())

    for i, chunk in enumerate(document.chunks):
        chunk_lower = chunk.lower()
        score = sum(1 for word in question_words if word in chunk_lower)
        scored.append((score, i, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_chunks = scored[:5]
    top_chunks.sort(key=lambda x: x[1])

    return "\n\n---\n\n".join(chunk for _, _, chunk in top_chunks)


def get_response(session: Session, document: Document, question: str) -> str:
    context = build_context(document, question)
    system = SYSTEM_PROMPT.format(context=context)

    messages = [{"role": "system", "content": system}]
    for m in session.messages:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": question})

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            max_tokens=1024,
        )
    except Exception:
        logger.exception("Groq API call failed")
        raise

    answer = response.choices[0].message.content or ""

    session.messages.append(Message(role="user", content=question))
    session.messages.append(Message(role="assistant", content=answer))
    session.exchange_count += 1

    return answer
