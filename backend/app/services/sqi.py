from __future__ import annotations

from app.core.config import settings


def calculate_sqi(
    sleep_efficiency: float,
    movement_event_count: int,
    stability_score: float,
    snore_events: int,
) -> float:
    eff_component = max(min(sleep_efficiency, 100), 0)
    movement_component = max(0.0, 100.0 - (movement_event_count * 2.5))
    stability_component = max(min(stability_score, 100), 0)
    snore_component = max(0.0, 100.0 - (snore_events * 5.0))

    score = (
        eff_component * settings.sqi_weight_efficiency
        + movement_component * settings.sqi_weight_movement
        + stability_component * settings.sqi_weight_stability
        + snore_component * settings.sqi_weight_snore
    )
    return round(max(0.0, min(score, 100.0)), 2)
