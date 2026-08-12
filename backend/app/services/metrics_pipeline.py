from __future__ import annotations

from datetime import datetime

import numpy as np
from sqlalchemy.orm import Session

from app.models import DerivedMetrics, SensorReading
from app.services.sleep_analysis import calculate_hrv_features, calculate_sleep_efficiency, compute_waso_minutes, estimate_sleep_onset_and_wake
from app.services.sqi import calculate_sqi
from app.services.staging import RuleBasedStageEstimator


def compute_session_metrics(db: Session, session_id) -> DerivedMetrics:
    readings = (
        db.query(SensorReading)
        .filter(SensorReading.session_id == session_id)
        .order_by(SensorReading.timestamp.asc())
        .all()
    )

    onset, wake = estimate_sleep_onset_and_wake(readings)
    total_sleep_minutes = 0.0
    time_in_bed = 0.0
    if onset and wake and wake > onset:
        total_sleep_minutes = (wake - onset).total_seconds() / 60.0
        time_in_bed = total_sleep_minutes
    elif readings:
        time_in_bed = (readings[-1].timestamp - readings[0].timestamp).total_seconds() / 60.0

    waso = compute_waso_minutes(readings, onset, wake)
    movement_count = sum(
        1
        for r in readings
        if np.sqrt(r.motion_x**2 + r.motion_y**2 + r.motion_z**2) > 0.3
    )
    sleep_efficiency = calculate_sleep_efficiency(max(total_sleep_minutes - waso, 0.0), max(time_in_bed, 1e-6))
    rmssd, sdnn, lf_hf = calculate_hrv_features([r.heart_rate for r in readings])
    stage_summary = RuleBasedStageEstimator().estimate(readings, onset, wake)

    stability = max(0.0, min(100.0, 100.0 - (np.std([r.heart_rate for r in readings if r.heart_rate is not None]) if readings else 0.0) * 2.0))
    snore_count = sum(1 for r in readings if r.snore_event)
    sqi = calculate_sqi(sleep_efficiency, movement_count, float(stability), snore_count)

    metrics = db.get(DerivedMetrics, session_id)
    if metrics is None:
        metrics = DerivedMetrics(session_id=session_id)
        db.add(metrics)

    metrics.sleep_onset_time = onset
    metrics.wake_time = wake
    metrics.total_sleep_time = round(max(total_sleep_minutes - waso, 0.0), 2)
    metrics.waso = waso
    metrics.sleep_efficiency = sleep_efficiency
    metrics.movement_event_count = movement_count
    metrics.sqi_score = sqi
    metrics.rmssd = rmssd
    metrics.sdnn = sdnn
    metrics.lf_hf_ratio = lf_hf
    metrics.estimated_stage_summary = stage_summary

    db.commit()
    db.refresh(metrics)
    return metrics
