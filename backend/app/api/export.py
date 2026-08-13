import io

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import DerivedMetrics, SensorReading, Session as SleepSession

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/csv")
def export_csv(
    session_id: str | None = Query(default=None),
    participant_id: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    if not session_id and not participant_id:
        raise HTTPException(status_code=400, detail="Provide session_id or participant_id")

    session_ids = []
    if session_id:
        session_ids = [session_id]
    elif participant_id:
        sessions = db.scalars(select(SleepSession).where(SleepSession.participant_id == participant_id)).all()
        session_ids = [str(s.session_id) for s in sessions]

    readings = db.scalars(select(SensorReading).where(SensorReading.session_id.in_(session_ids))).all()
    derived = db.scalars(select(DerivedMetrics).where(DerivedMetrics.session_id.in_(session_ids))).all()

    raw_df = pd.DataFrame(
        [
            {
                "id": r.id,
                "session_id": str(r.session_id),
                "timestamp": r.timestamp,
                "pressure_1": r.pressure_1,
                "pressure_2": r.pressure_2,
                "pressure_cervical_zone": r.pressure_cervical_zone,
                "motion_x": r.motion_x,
                "motion_y": r.motion_y,
                "motion_z": r.motion_z,
                "heart_rate": r.heart_rate,
                "spo2": r.spo2,
            }
            for r in readings
        ]
    )
    derived_df = pd.DataFrame(
        [
            {
                "session_id": str(d.session_id),
                "sleep_onset_time": d.sleep_onset_time,
                "wake_time": d.wake_time,
                "total_sleep_time": d.total_sleep_time,
                "waso": d.waso,
                "sleep_efficiency": d.sleep_efficiency,
                "movement_event_count": d.movement_event_count,
                "sqi_score": d.sqi_score,
                "rmssd": d.rmssd,
                "sdnn": d.sdnn,
                "lf_hf_ratio": d.lf_hf_ratio,
                "estimated_stage_summary": d.estimated_stage_summary,
            }
            for d in derived
        ]
    )

    merged = raw_df.merge(derived_df, on="session_id", how="left") if not raw_df.empty else derived_df
    stream = io.StringIO()
    merged.to_csv(stream, index=False)
    stream.seek(0)

    return StreamingResponse(iter([stream.read()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=export.csv"})
