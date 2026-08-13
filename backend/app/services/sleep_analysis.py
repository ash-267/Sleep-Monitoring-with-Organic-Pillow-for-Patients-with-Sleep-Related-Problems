from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime, timedelta

import numpy as np

from app.core.config import settings


@dataclass
class ReadingLike:
    timestamp: datetime
    motion_x: float
    motion_y: float
    motion_z: float
    pressure_1: float
    pressure_2: float
    pressure_cervical_zone: float | None
    heart_rate: float | None


def _motion_magnitude(reading: ReadingLike) -> float:
    return float(np.sqrt(reading.motion_x**2 + reading.motion_y**2 + reading.motion_z**2))


def estimate_sleep_onset_and_wake(readings: Sequence[ReadingLike]) -> tuple[datetime | None, datetime | None]:
    if not readings:
        return None, None

    window = max(settings.motion_window_size, 3)
    sleep_onset: datetime | None = None
    wake_time: datetime | None = readings[-1].timestamp

    magnitudes = np.array([_motion_magnitude(r) for r in readings], dtype=float)
    hr_values = np.array([r.heart_rate if r.heart_rate is not None else np.nan for r in readings], dtype=float)

    for idx in range(window, len(readings)):
        mot_slice = magnitudes[idx - window : idx]
        hr_slice = hr_values[idx - window : idx]
        hr_slice = hr_slice[~np.isnan(hr_slice)]
        mot_std = float(np.std(mot_slice))
        hr_std = float(np.std(hr_slice)) if len(hr_slice) >= 2 else 0.0
        if mot_std <= settings.sleep_motion_std_threshold and hr_std <= settings.sleep_hr_std_threshold:
            sleep_onset = readings[idx].timestamp
            break

    if sleep_onset is None:
        sleep_onset = readings[0].timestamp

    for idx in range(len(readings) - 1, -1, -1):
        reading = readings[idx]
        pressure_avg = np.nanmean([
            reading.pressure_1,
            reading.pressure_2,
            reading.pressure_cervical_zone if reading.pressure_cervical_zone is not None else np.nan,
        ])
        if float(pressure_avg) < settings.wake_pressure_threshold:
            wake_time = reading.timestamp
            break

    return sleep_onset, wake_time


def compute_waso_minutes(readings: Sequence[ReadingLike], onset: datetime | None, wake: datetime | None) -> float:
    if not readings or onset is None or wake is None or wake <= onset:
        return 0.0

    waso = timedelta(0)
    baseline_hr = np.nanmean([r.heart_rate for r in readings if r.heart_rate is not None])
    baseline_hr = float(baseline_hr) if not np.isnan(baseline_hr) else 0.0

    for prev, current in zip(readings, readings[1:]):
        if current.timestamp < onset or current.timestamp > wake:
            continue
        motion_mag = _motion_magnitude(current)
        hr = current.heart_rate or baseline_hr
        if motion_mag >= settings.waso_motion_threshold and hr >= baseline_hr + settings.waso_hr_spike_bpm:
            delta = current.timestamp - prev.timestamp
            waso += max(delta, timedelta(0))

    return round(waso.total_seconds() / 60.0, 2)


def calculate_sleep_efficiency(total_sleep_minutes: float, time_in_bed_minutes: float) -> float:
    if time_in_bed_minutes <= 0:
        return 0.0
    return round((total_sleep_minutes / time_in_bed_minutes) * 100.0, 2)


def calculate_hrv_features(heart_rates: Sequence[float | None]) -> tuple[float | None, float | None, float | None]:
    # MAX30102 values are PPG-derived proxies, not ECG-grade RR intervals.
    cleaned = np.array([hr for hr in heart_rates if hr is not None and hr > 0], dtype=float)
    if len(cleaned) < 3:
        return None, None, None

    rr = 60000.0 / cleaned
    rr_diff = np.diff(rr)
    rmssd = float(np.sqrt(np.mean(rr_diff**2))) if len(rr_diff) else None
    sdnn = float(np.std(rr)) if len(rr) else None

    low_band = np.var(rr[: len(rr) // 2]) if len(rr) >= 4 else 0.0
    high_band = np.var(rr[len(rr) // 2 :]) if len(rr) >= 4 else 1.0
    lf_hf_ratio = float(low_band / high_band) if high_band > 0 else None

    return (round(rmssd, 3) if rmssd is not None else None, round(sdnn, 3) if sdnn is not None else None, round(lf_hf_ratio, 3) if lf_hf_ratio is not None else None)
