from datetime import UTC, datetime, timedelta

from app.services.sleep_analysis import ReadingLike, estimate_sleep_onset_and_wake
from app.services.sqi import calculate_sqi


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


def test_calculate_sqi_in_range():
    sqi = calculate_sqi(88.0, movement_event_count=5, stability_score=82.0, snore_events=2)
    assert 0 <= sqi <= 100
    assert sqi > 60
