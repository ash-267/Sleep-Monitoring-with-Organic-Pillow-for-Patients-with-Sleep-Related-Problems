from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.entities import OutcomeMeasureTypeEnum, PhaseEnum, PillowTypeEnum


class ParticipantCreate(BaseModel):
    participant_id: str
    age: int
    gender: str
    neck_pain_baseline_ndi: float | None = None
    consent_confirmed: bool


class ParticipantRead(ParticipantCreate):
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SessionCreate(BaseModel):
    participant_id: str
    phase: PhaseEnum
    pillow_type: PillowTypeEnum
    start_time: datetime
    notes: str | None = None


class SessionRead(BaseModel):
    session_id: UUID
    participant_id: str
    phase: PhaseEnum
    pillow_type: PillowTypeEnum
    start_time: datetime
    end_time: datetime | None
    notes: str | None

    model_config = ConfigDict(from_attributes=True)


class SessionEndPatch(BaseModel):
    end_time: datetime


class SensorReadingCreate(BaseModel):
    session_id: UUID
    timestamp: datetime
    pressure_1: float
    pressure_2: float
    pressure_cervical_zone: float | None = None
    motion_x: float
    motion_y: float
    motion_z: float
    heart_rate: float | None = None
    spo2: float | None = None
    ambient_temperature: float | None = None
    ambient_humidity: float | None = None
    snore_event: bool | None = None


class SensorReadingRead(SensorReadingCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class DerivedMetricsRead(BaseModel):
    sleep_onset_time: datetime | None = None
    wake_time: datetime | None = None
    total_sleep_time: float | None = None
    waso: float | None = None
    sleep_efficiency: float | None = None
    movement_event_count: int | None = None
    sqi_score: float | None = None
    rmssd: float | None = None
    sdnn: float | None = None
    lf_hf_ratio: float | None = None
    estimated_stage_summary: dict | None = None

    model_config = ConfigDict(from_attributes=True)


class SessionDetail(SessionRead):
    derived_metrics: DerivedMetricsRead | None = None
    sensor_readings: list[SensorReadingRead] = []


class OutcomeMeasureCreate(BaseModel):
    session_id: UUID | None = None
    participant_id: str | None = None
    measure_type: OutcomeMeasureTypeEnum
    score: float
    recorded_at: datetime | None = None
