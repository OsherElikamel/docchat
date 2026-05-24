import uuid
from dataclasses import dataclass, field

import pdfplumber


@dataclass
class Document:
    id: str
    filename: str
    chunks: list[str] = field(default_factory=list)


documents: dict[str, Document] = {}


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return [c.strip() for c in chunks if c.strip()]


def parse_pdf(file_bytes: bytes) -> str:
    text_parts = []
    with pdfplumber.open(file_bytes) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


def store_document(filename: str, chunks: list[str]) -> str:
    doc_id = uuid.uuid4().hex
    documents[doc_id] = Document(id=doc_id, filename=filename, chunks=chunks)
    return doc_id


def get_document(doc_id: str) -> Document | None:
    return documents.get(doc_id)
