from __future__ import annotations

import random
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import Participant, PhaseEnum, PillowTypeEnum, SensorReading, Session as SleepSession
from app.services.metrics_pipeline import compute_session_metrics


def seed() -> None:
    db: Session = SessionLocal()
    try:
        participant = db.get(Participant, "P001")
        if participant is None:
            participant = Participant(participant_id="P001", age=24, gender="F", neck_pain_baseline_ndi=22.5, consent_confirmed=True)
            db.add(participant)
            db.commit()

        for phase, pillow in [(PhaseEnum.baseline, PillowTypeEnum.standard_fiberfill), (PhaseEnum.intervention, PillowTypeEnum.restntravel_organic)]:
            session = SleepSession(
                participant_id="P001",
                phase=phase,
                pillow_type=pillow,
                start_time=datetime.now(UTC) - timedelta(hours=8),
                end_time=datetime.now(UTC),
                notes=f"Synthetic {phase.value} data",
            )
            db.add(session)
            db.commit()
            db.refresh(session)

            timestamp = session.start_time
            for idx in range(360):
                motion_base = 0.05 if idx > 30 else 0.3
                reading = SensorReading(
                    session_id=session.session_id,
                    timestamp=timestamp,
                    pressure_1=max(0.0, random.gauss(0.7, 0.08)),
                    pressure_2=max(0.0, random.gauss(0.65, 0.09)),
                    pressure_cervical_zone=max(0.0, random.gauss(0.6, 0.1)),
                    motion_x=random.gauss(motion_base, 0.05),
                    motion_y=random.gauss(motion_base, 0.05),
                    motion_z=random.gauss(motion_base, 0.05),
                    heart_rate=max(45, random.gauss(64, 4)),
                    spo2=random.gauss(97, 1.2),
                    ambient_temperature=random.gauss(24, 1.0),
                    ambient_humidity=random.gauss(55, 3.0),
                    snore_event=(idx % 47 == 0),
                )
                db.add(reading)
                timestamp += timedelta(minutes=1)
            db.commit()
            compute_session_metrics(db, session.session_id)

        print("Seed complete")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
