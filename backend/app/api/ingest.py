from datetime import timezone

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models import SensorReading, Session as SleepSession
from app.schemas.common import SensorReadingCreate, SensorReadingRead

router = APIRouter(prefix="/api", tags=["ingest"])


@router.post("/ingest", response_model=SensorReadingRead)
def ingest_reading(
    payload: SensorReadingCreate,
    db: Session = Depends(get_db),
    x_device_key: str = Header(default="", alias="X-Device-Key"),
) -> SensorReading:
    if x_device_key != settings.device_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid device key")

    active_session = db.scalar(
        select(SleepSession).where(
            and_(
                SleepSession.session_id == payload.session_id,
                SleepSession.end_time.is_(None),
            )
        )
    )
    if active_session is None:
        raise HTTPException(status_code=400, detail="Session is not active or does not exist")

    reading = SensorReading(
        session_id=payload.session_id,
        timestamp=payload.timestamp.astimezone(timezone.utc),
        pressure_1=payload.pressure_1,
        pressure_2=payload.pressure_2,
        pressure_cervical_zone=payload.pressure_cervical_zone,
        motion_x=payload.motion_x,
        motion_y=payload.motion_y,
        motion_z=payload.motion_z,
        heart_rate=payload.heart_rate,
        spo2=payload.spo2,
        ambient_temperature=payload.ambient_temperature,
        ambient_humidity=payload.ambient_humidity,
        snore_event=payload.snore_event,
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading
