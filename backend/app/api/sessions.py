from datetime import timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Participant, Session as SleepSession
from app.schemas.common import SessionCreate, SessionDetail, SessionEndPatch, SessionRead
from app.services.metrics_pipeline import compute_session_metrics

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("", response_model=SessionRead)
def create_session(payload: SessionCreate, db: Session = Depends(get_db)) -> SleepSession:
    participant = db.get(Participant, payload.participant_id)
    if participant is None:
        raise HTTPException(status_code=404, detail="Participant not found")

    active = db.scalar(
        select(SleepSession).where(
            and_(
                SleepSession.participant_id == payload.participant_id,
                SleepSession.end_time.is_(None),
            )
        )
    )
    if active:
        raise HTTPException(status_code=409, detail="Participant already has an active session")

    session = SleepSession(
        participant_id=payload.participant_id,
        phase=payload.phase,
        pillow_type=payload.pillow_type,
        start_time=payload.start_time.astimezone(timezone.utc),
        notes=payload.notes,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.patch("/{session_id}/end", response_model=SessionDetail)
def end_session(session_id: UUID, payload: SessionEndPatch, db: Session = Depends(get_db)) -> SleepSession:
    session = db.get(SleepSession, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    session.end_time = payload.end_time.astimezone(timezone.utc)
    db.commit()
    db.refresh(session)
    compute_session_metrics(db, session_id)
    db.refresh(session)
    return session


@router.get("/{session_id}", response_model=SessionDetail)
def get_session(session_id: UUID, db: Session = Depends(get_db)) -> SleepSession:
    session = db.get(SleepSession, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
