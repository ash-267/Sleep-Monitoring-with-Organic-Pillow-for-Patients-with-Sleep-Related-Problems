from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Sequence
from datetime import datetime

import numpy as np

from app.services.sleep_analysis import ReadingLike


DISCLAIMER = (
    "Sleep stage estimates are derived from surrogate sensors (HRV, motion, respiration proxies) "
    "and are NOT clinical-grade. Accuracy ceiling: Cohen's κ 0.4–0.7 vs polysomnography."
)


class StageEstimator(ABC):
    @abstractmethod
    def estimate(self, readings: Sequence[ReadingLike], onset: datetime | None, wake: datetime | None) -> dict:
        ...


class RuleBasedStageEstimator(StageEstimator):
    def estimate(self, readings: Sequence[ReadingLike], onset: datetime | None, wake: datetime | None) -> dict:
        if onset is None or wake is None or wake <= onset:
            return {"light_minutes": 0, "deep_minutes": 0, "rem_proxy_minutes": 0, "confidence": 0.4, "disclaimer": DISCLAIMER}

        in_sleep = [r for r in readings if onset <= r.timestamp <= wake]
        if not in_sleep:
            return {"light_minutes": 0, "deep_minutes": 0, "rem_proxy_minutes": 0, "confidence": 0.4, "disclaimer": DISCLAIMER}

        deep = rem = light = 0.0
        for prev, current in zip(in_sleep, in_sleep[1:]):
            dt_minutes = max((current.timestamp - prev.timestamp).total_seconds() / 60.0, 0.0)
            motion = np.sqrt(current.motion_x**2 + current.motion_y**2 + current.motion_z**2)
            hr = current.heart_rate or 70
            if motion < 0.1 and hr < 62:
                deep += dt_minutes
            elif motion < 0.2 and 62 <= hr <= 78:
                rem += dt_minutes
            else:
                light += dt_minutes

        return {
            "light_minutes": round(light, 2),
            "deep_minutes": round(deep, 2),
            "rem_proxy_minutes": round(rem, 2),
            "confidence": 0.55,
            "disclaimer": DISCLAIMER,
        }
