from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, users, shoutouts

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BragBoard API")

# ✅ DEV CORS (allow frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # dev only
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(shoutouts.router)

@app.get("/")
def root():
    return {"message": "BragBoard backend running"}
