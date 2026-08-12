from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import analytics, export, health, ingest, participants, sessions
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

app = FastAPI(title="RestNTravel Sleep Comparator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(ingest.router)
app.include_router(sessions.router)
app.include_router(participants.router)
app.include_router(export.router)
app.include_router(analytics.router)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
