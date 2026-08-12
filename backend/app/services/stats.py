from __future__ import annotations

import numpy as np
from scipy import stats


def paired_comparison(baseline: list[float], intervention: list[float]) -> dict:
    if len(baseline) != len(intervention) or len(baseline) < 2:
        return {"test": None, "p_value": None, "ci_95": None, "effect_mean_diff": None}

    baseline_arr = np.array(baseline, dtype=float)
    intervention_arr = np.array(intervention, dtype=float)
    diffs = intervention_arr - baseline_arr

    normality_p = stats.shapiro(diffs).pvalue if len(diffs) <= 5000 else 0.0
    if normality_p > 0.05:
        test_name = "ttest_rel"
        stat_res = stats.ttest_rel(intervention_arr, baseline_arr)
    else:
        test_name = "wilcoxon"
        stat_res = stats.wilcoxon(intervention_arr, baseline_arr, zero_method="wilcox")

    mean_diff = float(np.mean(diffs))
    sem = stats.sem(diffs) if len(diffs) > 1 else 0.0
    ci = stats.t.interval(0.95, len(diffs) - 1, loc=mean_diff, scale=sem) if len(diffs) > 1 else (mean_diff, mean_diff)

    return {
        "test": test_name,
        "normality_p": float(normality_p),
        "p_value": float(stat_res.pvalue),
        "effect_mean_diff": round(mean_diff, 3),
        "ci_95": [round(float(ci[0]), 3), round(float(ci[1]), 3)],
    }
