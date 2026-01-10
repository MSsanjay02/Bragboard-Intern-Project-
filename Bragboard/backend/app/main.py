from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BragBoard API")

# ✅ CORS (Allow frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "BragBoard backend running"}
