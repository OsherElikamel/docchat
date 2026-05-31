import io


def test_upload_txt_file(client):
    content = b"This is a test document about Python programming."
    res = client.post("/api/upload", files={"file": ("test.txt", io.BytesIO(content), "text/plain")})
    assert res.status_code == 200
    data = res.json()
    assert data["filename"] == "test.txt"
    assert data["session_id"]
    assert data["doc_id"]
    assert data["chunks"] >= 1


def test_upload_md_file(client):
    content = b"# Markdown Title\n\nSome markdown content here."
    res = client.post("/api/upload", files={"file": ("readme.md", io.BytesIO(content), "text/markdown")})
    assert res.status_code == 200
    assert res.json()["filename"] == "readme.md"


def test_reject_unsupported_file_type(client):
    content = b"some binary data"
    res = client.post("/api/upload", files={"file": ("image.png", io.BytesIO(content), "image/png")})
    assert res.status_code == 400
    assert "Unsupported" in res.json()["detail"]


def test_reject_empty_document(client):
    content = b"   "
    res = client.post("/api/upload", files={"file": ("empty.txt", io.BytesIO(content), "text/plain")})
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()


def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
