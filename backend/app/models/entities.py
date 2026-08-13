import enum
import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, Uuid, Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PhaseEnum(str, enum.Enum):
    baseline = "baseline"
    intervention = "intervention"


class PillowTypeEnum(str, enum.Enum):
    standard_fiberfill = "standard_fiberfill"
    cervical_contour = "cervical_contour"
    restntravel_organic = "restntravel_organic"


class OutcomeMeasureTypeEnum(str, enum.Enum):
    VAS = "VAS"
    NDI = "NDI"


class Participant(Base):
    __tablename__ = "participants"

    participant_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(32), nullable=False)
    neck_pain_baseline_ndi: Mapped[float | None] = mapped_column(Float, nullable=True)
    consent_confirmed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))

    sessions: Mapped[list["Session"]] = relationship(back_populates="participant", cascade="all,delete-orphan")


class Session(Base):
    __tablename__ = "sessions"

    session_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_id: Mapped[str] = mapped_column(ForeignKey("participants.participant_id", ondelete="CASCADE"), nullable=False)
    phase: Mapped[PhaseEnum] = mapped_column(Enum(PhaseEnum, name="phase_enum"), nullable=False)
    pillow_type: Mapped[PillowTypeEnum] = mapped_column(Enum(PillowTypeEnum, name="pillow_type_enum"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    participant: Mapped[Participant] = relationship(back_populates="sessions")
    sensor_readings: Mapped[list["SensorReading"]] = relationship(back_populates="session", cascade="all,delete-orphan")
    derived_metrics: Mapped["DerivedMetrics | None"] = relationship(back_populates="session", uselist=False, cascade="all,delete-orphan")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.session_id", ondelete="CASCADE"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    pressure_1: Mapped[float] = mapped_column(Float, nullable=False)
    pressure_2: Mapped[float] = mapped_column(Float, nullable=False)
    pressure_cervical_zone: Mapped[float | None] = mapped_column(Float, nullable=True)
    motion_x: Mapped[float] = mapped_column(Float, nullable=False)
    motion_y: Mapped[float] = mapped_column(Float, nullable=False)
    motion_z: Mapped[float] = mapped_column(Float, nullable=False)
    heart_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    spo2: Mapped[float | None] = mapped_column(Float, nullable=True)

    session: Mapped[Session] = relationship(back_populates="sensor_readings")


class DerivedMetrics(Base):
    __tablename__ = "derived_metrics"

    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.session_id", ondelete="CASCADE"), primary_key=True)
    sleep_onset_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    wake_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    total_sleep_time: Mapped[float | None] = mapped_column(Float, nullable=True)
    waso: Mapped[float | None] = mapped_column(Float, nullable=True)
    sleep_efficiency: Mapped[float | None] = mapped_column(Float, nullable=True)
    movement_event_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sqi_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    rmssd: Mapped[float | None] = mapped_column(Float, nullable=True)
    sdnn: Mapped[float | None] = mapped_column(Float, nullable=True)
    lf_hf_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_stage_summary: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    session: Mapped[Session] = relationship(back_populates="derived_metrics")


class OutcomeMeasure(Base):
    __tablename__ = "outcome_measures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("sessions.session_id", ondelete="CASCADE"), nullable=True)
    participant_id: Mapped[str | None] = mapped_column(ForeignKey("participants.participant_id", ondelete="CASCADE"), nullable=True)
    measure_type: Mapped[OutcomeMeasureTypeEnum] = mapped_column(Enum(OutcomeMeasureTypeEnum, name="outcome_measure_enum"), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))
