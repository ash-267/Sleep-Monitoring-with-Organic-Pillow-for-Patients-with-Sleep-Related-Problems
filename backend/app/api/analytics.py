from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Session as SleepSession
from app.services.metrics_pipeline import compute_session_metrics

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.post("/sessions/{session_id}/recompute")
def recompute_session_metrics(session_id: UUID, db: Session = Depends(get_db)) -> dict:
    session = db.get(SleepSession, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    metrics = compute_session_metrics(db, session_id)
    return {"session_id": str(session_id), "sqi_score": metrics.sqi_score}
