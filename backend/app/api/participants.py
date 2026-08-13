from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import DerivedMetrics, Participant, PhaseEnum, Session as SleepSession
from app.schemas.common import ParticipantCreate, ParticipantRead
from app.services.stats import paired_comparison

router = APIRouter(prefix="/api/participants", tags=["participants"])


@router.get("")
def list_participants(db: Session = Depends(get_db)) -> list[dict]:
    participants = db.scalars(select(Participant).order_by(Participant.participant_id.asc())).all()
    out: list[dict] = []
    for participant in participants:
        sessions = db.scalars(select(SleepSession).where(SleepSession.participant_id == participant.participant_id)).all()
        session_ids = [s.session_id for s in sessions]
        metrics = db.scalars(select(DerivedMetrics).where(DerivedMetrics.session_id.in_(session_ids))).all() if session_ids else []
        trend = [m.sqi_score for m in metrics if m.sqi_score is not None]
        out.append(
            {
                "participant_id": participant.participant_id,
                "session_count": len(sessions),
                "sqi_trend": trend[-10:],
            }
        )
    return out


@router.post("", response_model=ParticipantRead)
def create_participant(payload: ParticipantCreate, db: Session = Depends(get_db)) -> Participant:
    existing = db.get(Participant, payload.participant_id)
    if existing:
        raise HTTPException(status_code=409, detail="Participant already exists")

    participant = Participant(**payload.model_dump())
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


@router.get("/{participant_id}/compare")
def compare_participant(participant_id: str, db: Session = Depends(get_db)) -> dict:
    participant = db.get(Participant, participant_id)
    if participant is None:
        raise HTTPException(status_code=404, detail="Participant not found")

    sessions = db.scalars(select(SleepSession).where(SleepSession.participant_id == participant_id)).all()
    baseline_ids = [s.session_id for s in sessions if s.phase == PhaseEnum.baseline]
    intervention_ids = [s.session_id for s in sessions if s.phase == PhaseEnum.intervention]

    baseline_scores = [m.sqi_score for m in db.scalars(select(DerivedMetrics).where(DerivedMetrics.session_id.in_(baseline_ids))).all() if m.sqi_score is not None]
    intervention_scores = [m.sqi_score for m in db.scalars(select(DerivedMetrics).where(DerivedMetrics.session_id.in_(intervention_ids))).all() if m.sqi_score is not None]
    
    from app.models import OutcomeMeasure
    outcomes = db.scalars(select(OutcomeMeasure).where(OutcomeMeasure.participant_id == participant_id)).all()
    baseline_outcomes = [o.score for o in outcomes if o.session_id in baseline_ids]
    intervention_outcomes = [o.score for o in outcomes if o.session_id in intervention_ids]

    pair_len = min(len(baseline_scores), len(intervention_scores))
    baseline_scores = baseline_scores[:pair_len]
    intervention_scores = intervention_scores[:pair_len]
    result = paired_comparison(baseline_scores, intervention_scores)

    pct_change = None
    if pair_len and sum(baseline_scores) != 0:
        pct_change = round(((sum(intervention_scores) / pair_len) - (sum(baseline_scores) / pair_len)) / (sum(baseline_scores) / pair_len) * 100, 2)

    return {
        "participant_id": participant_id,
        "pairs": pair_len,
        "baseline_sqi": baseline_scores,
        "intervention_sqi": intervention_scores,
        "baseline_outcomes": baseline_outcomes,
        "intervention_outcomes": intervention_outcomes,
        "percent_change": pct_change,
        "stats": result,
    }
