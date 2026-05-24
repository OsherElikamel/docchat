from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str = ""
    allowed_origin: str = "http://localhost:5173"
    max_messages_per_session: int = 50
    max_upload_size_mb: int = 10
    groq_model: str = "llama-3.3-70b-versatile"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    session_ttl_minutes: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
