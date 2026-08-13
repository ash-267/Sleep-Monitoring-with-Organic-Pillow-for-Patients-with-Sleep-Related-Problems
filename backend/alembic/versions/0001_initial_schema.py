"""initial schema

Revision ID: 0001_initial_schema
Revises: None
Create Date: 2026-08-12
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    phase_enum = postgresql.ENUM("baseline", "intervention", name="phase_enum")
    pillow_enum = postgresql.ENUM("standard_fiberfill", "cervical_contour", "restntravel_organic", name="pillow_type_enum")
    outcome_enum = postgresql.ENUM("VAS", "NDI", name="outcome_measure_enum")
    phase_enum.create(op.get_bind(), checkfirst=True)
    pillow_enum.create(op.get_bind(), checkfirst=True)
    outcome_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "participants",
        sa.Column("participant_id", sa.String(length=64), primary_key=True),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("gender", sa.String(length=32), nullable=False),
        sa.Column("neck_pain_baseline_ndi", sa.Float(), nullable=True),
        sa.Column("consent_confirmed", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "sessions",
        sa.Column("session_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("participant_id", sa.String(length=64), sa.ForeignKey("participants.participant_id", ondelete="CASCADE"), nullable=False),
        sa.Column("phase", sa.Enum(name="phase_enum", create_type=False), nullable=False),
        sa.Column("pillow_type", sa.Enum(name="pillow_type_enum", create_type=False), nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )

    op.create_table(
        "sensor_readings",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("sessions.session_id", ondelete="CASCADE"), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("pressure_1", sa.Float(), nullable=False),
        sa.Column("pressure_2", sa.Float(), nullable=False),
        sa.Column("pressure_cervical_zone", sa.Float(), nullable=True),
        sa.Column("motion_x", sa.Float(), nullable=False),
        sa.Column("motion_y", sa.Float(), nullable=False),
        sa.Column("motion_z", sa.Float(), nullable=False),
        sa.Column("heart_rate", sa.Float(), nullable=True),
        sa.Column("spo2", sa.Float(), nullable=True),
    )

    op.create_table(
        "derived_metrics",
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("sessions.session_id", ondelete="CASCADE"), primary_key=True),
        sa.Column("sleep_onset_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("wake_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("total_sleep_time", sa.Float(), nullable=True),
        sa.Column("waso", sa.Float(), nullable=True),
        sa.Column("sleep_efficiency", sa.Float(), nullable=True),
        sa.Column("movement_event_count", sa.Integer(), nullable=True),
        sa.Column("sqi_score", sa.Float(), nullable=True),
        sa.Column("rmssd", sa.Float(), nullable=True),
        sa.Column("sdnn", sa.Float(), nullable=True),
        sa.Column("lf_hf_ratio", sa.Float(), nullable=True),
        sa.Column("estimated_stage_summary", sa.JSON(), nullable=True),
    )

    op.create_table(
        "outcome_measures",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("sessions.session_id", ondelete="CASCADE"), nullable=True),
        sa.Column("participant_id", sa.String(length=64), sa.ForeignKey("participants.participant_id", ondelete="CASCADE"), nullable=True),
        sa.Column("measure_type", sa.Enum(name="outcome_measure_enum", create_type=False), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("outcome_measures")
    op.drop_table("derived_metrics")
    op.drop_table("sensor_readings")
    op.drop_table("sessions")
    op.drop_table("participants")

    op.execute("DROP TYPE IF EXISTS outcome_measure_enum")
    op.execute("DROP TYPE IF EXISTS pillow_type_enum")
    op.execute("DROP TYPE IF EXISTS phase_enum")
