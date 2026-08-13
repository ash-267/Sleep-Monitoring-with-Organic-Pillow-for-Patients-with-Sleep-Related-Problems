from datetime import UTC, datetime, timedelta
import numpy as np

from app.services.sleep_analysis import ReadingLike, estimate_sleep_onset_and_wake, compute_waso_minutes, calculate_sleep_efficiency, calculate_hrv_features
from app.services.sqi import calculate_sqi
from app.services.staging import RuleBasedStageEstimator
from app.services.stats import paired_comparison
from app.core.config import settings

def test_estimate_sleep_onset_and_wake_detects_sleep_and_wake():
    start = datetime(2026, 1, 1, 22, 0, tzinfo=UTC)
    readings: list[ReadingLike] = []

    for i in range(20):
        asleep = i >= 6
        pressure = 0.7 if i < 18 else 0.01
        motion = 0.03 if asleep else 0.35
        hr = 62 if asleep else 78
        readings.append(
            ReadingLike(
                timestamp=start + timedelta(minutes=i),
                motion_x=motion,
                motion_y=motion,
                motion_z=motion,
                pressure_1=pressure,
                pressure_2=pressure,
                pressure_cervical_zone=pressure,
                heart_rate=hr,
                snore_event=False,
            )
        )

    onset, wake = estimate_sleep_onset_and_wake(readings)

    assert onset is not None
    assert wake is not None
    assert onset > start
    assert wake >= start + timedelta(minutes=18)

def test_estimate_sleep_with_missing_sensors():
    start = datetime(2026, 1, 1, 22, 0, tzinfo=UTC)
    readings: list[ReadingLike] = []
    
    # Missing heart rate (simulating MAX30102 dropout or missing)
    for i in range(20):
        asleep = i >= 4
        # Even with no HR, motion stabilization should eventually trigger an onset
        pressure = 0.8
        motion = 0.01 if asleep else 0.4
        readings.append(
            ReadingLike(
                timestamp=start + timedelta(minutes=i),
                motion_x=motion,
                motion_y=motion,
                motion_z=motion,
                pressure_1=pressure,
                pressure_2=pressure,
                pressure_cervical_zone=None, 
                heart_rate=None,
                snore_event=None,
            )
        )

    onset, wake = estimate_sleep_onset_and_wake(readings)
    assert onset is not None

def test_waso_computation():
    start = datetime(2026, 1, 1, 22, 0, tzinfo=UTC)
    readings: list[ReadingLike] = []
    # Create awake period in the middle
    for i in range(30):
        awake = 10 <= i <= 15
        hr = 80 if awake else 60
        motion = 0.4 if awake else 0.02

        readings.append(
            ReadingLike(
                timestamp=start + timedelta(minutes=i),
                motion_x=motion,
                motion_y=motion,
                motion_z=motion,
                pressure_1=0.8,
                pressure_2=0.8,
                pressure_cervical_zone=0.8,
                heart_rate=hr,
                snore_event=False,
            )
        )

    onset = start
    wake = start + timedelta(minutes=29)
    waso = compute_waso_minutes(readings, onset, wake)
    assert waso > 0 # we should have detected some WASO time


def test_calculate_sqi_in_range():
    sqi = calculate_sqi(88.0, movement_event_count=5, stability_score=82.0, snore_events=2)
    assert 0 <= sqi <= 100
    assert sqi > 60

def test_staging_estimation():
    start = datetime(2026, 1, 1, 22, 0, tzinfo=UTC)
    readings: list[ReadingLike] = []
    for i in range(60):
        if i < 20: 
            hr, motion = 60, 0.05 # Deep sleep 
        elif i < 40:
            hr, motion = 70, 0.15 # REM 
        else:
            hr, motion = 75, 0.25 # Light
            
        readings.append(
            ReadingLike(
                timestamp=start + timedelta(minutes=i),
                motion_x=motion,
                motion_y=motion,
                motion_z=motion,
                pressure_1=0.8,
                pressure_2=0.8,
                pressure_cervical_zone=0.8,
                heart_rate=hr,
                snore_event=False,
            )
        )
    estimator = RuleBasedStageEstimator()
    onset = start
    wake = start + timedelta(minutes=60)
    res = estimator.estimate(readings, onset, wake)
    assert res["deep_minutes"] > 0
    assert res["rem_proxy_minutes"] > 0
    assert "disclaimer" in res
    assert "kappa" in res["disclaimer"].lower()

def test_paired_comparison_wilcoxon():
    # Will trigger shapiro test non-normal if we use weird dist, but let's test general functionality
    baseline = [5.0, 5.2, 5.1, 5.0, 4.9, 6.0, 8.0, 9.0]
    intervention = [4.0, 4.1, 4.0, 3.9, 3.8, 5.0, 7.0, 8.0]
    result = paired_comparison(baseline, intervention)
    assert result["test"] in ["wilcoxon", "ttest_rel"]
    assert result["p_value"] is not None

