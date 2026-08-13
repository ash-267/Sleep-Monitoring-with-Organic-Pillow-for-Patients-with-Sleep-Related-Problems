from __future__ import annotations

from app.core.config import settings


def calculate_sqi(
    sleep_efficiency: float,
    movement_event_count: int,
    stability_score: float | None = None,
) -> float:
    eff_component = max(min(sleep_efficiency, 100), 0)
    movement_component = max(0.0, 100.0 - (movement_event_count * 2.5))
    
    components = [
        (eff_component, settings.sqi_weight_efficiency),
        (movement_component, settings.sqi_weight_movement)
    ]
    
    if stability_score is not None:
        stability_component = max(min(stability_score, 100), 0)
        components.append((stability_component, settings.sqi_weight_stability))
        
    total_weight = sum(weight for _, weight in components)
    if total_weight == 0:
        return 0.0
        
    score = sum((val * weight) / total_weight for val, weight in components)
    return round(max(0.0, min(score, 100.0)), 2)
