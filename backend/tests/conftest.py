import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.document import documents
from app.services.session import sessions


@pytest.fixture(autouse=True)
def _clean_state():
    yield
    documents.clear()
    sessions.clear()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
