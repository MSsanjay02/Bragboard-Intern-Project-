from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, users, shoutouts, interactions

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BragBoard API")

# ✅ DEV CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # dev only
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(shoutouts.router)
app.include_router(interactions.router)

@app.get("/")
def root():
    return {"message": "BragBoard backend running"}
