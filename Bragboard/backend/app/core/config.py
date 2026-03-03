import os

from dotenv import load_dotenv


load_dotenv()


def _get_int(name: str, default: int) -> int:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    try:
        return int(raw_value)
    except ValueError:
        return default


def _normalize_db_url(url: str) -> str:
    # Render may provide postgres:// URLs, but SQLAlchemy expects postgresql://
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


DATABASE_URL = _normalize_db_url(
    os.getenv("DATABASE_URL", "sqlite:///./bragboard.db")
)
SECRET_KEY = os.getenv(
    "SECRET_KEY", "change-me-in-production-with-a-long-random-secret"
)
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = _get_int("ACCESS_TOKEN_EXPIRE_MINUTES", 60)

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
