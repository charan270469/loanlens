from __future__ import annotations

import unittest

import numpy as np

from src.service.model_service.training.calibration import ProbabilityCalibrator
from src.service.model_service.training.promotion import evaluate_promotion_gate


class CalibrationAndPromotionTests(unittest.TestCase):
    def test_calibration_output_is_bounded(self) -> None:
        rng = np.random.default_rng(42)
        probs = np.clip(rng.normal(0.35, 0.2, 600), 1e-4, 0.999)
        y = (rng.random(600) < probs).astype(int)

        result = ProbabilityCalibrator.fit_auto(probs, y)
        calibrated = result.calibrator.transform(probs)
        self.assertTrue(np.all(calibrated >= 0.0))
        self.assertTrue(np.all(calibrated <= 1.0))

    def test_promotion_gate_deterministic_fail_and_pass(self) -> None:
        fail = evaluate_promotion_gate(
            candidate_metrics={"auc": 0.60, "ks": 0.10, "ece": 0.10},
            baseline_metrics={"auc": 0.62, "ks": 0.12, "ece": 0.08},
        )
        self.assertFalse(fail["promotable"])
        self.assertGreater(len(fail["reasons"]), 0)

        passed = evaluate_promotion_gate(
            candidate_metrics={"auc": 0.75, "ks": 0.30, "ece": 0.03},
            baseline_metrics={"auc": 0.70, "ks": 0.25, "ece": 0.05},
            candidate_segment_auc={"credit_low": 0.68},
            baseline_segment_auc={"credit_low": 0.71},
        )
        self.assertTrue(passed["promotable"])


if __name__ == "__main__":
    unittest.main()

