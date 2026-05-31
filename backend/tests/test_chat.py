def test_chat_invalid_session(client):
    res = client.post("/api/chat", json={"session_id": "nonexistent", "question": "hello"})
    assert res.status_code == 404


def test_chat_empty_question(client):
    import io
    upload = client.post("/api/upload", files={"file": ("test.txt", io.BytesIO(b"Some content"), "text/plain")})
    session_id = upload.json()["session_id"]

    res = client.post("/api/chat", json={"session_id": session_id, "question": "   "})
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()
