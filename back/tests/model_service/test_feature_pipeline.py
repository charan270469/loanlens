from __future__ import annotations

import unittest

import pandas as pd

from src.service.model_service.service import ModelFeatureBuilder
from src.service.model_service.training.feature_pipeline import FeatureParityPipeline


class FeaturePipelineTests(unittest.TestCase):
    def test_feature_order_parity_and_alias_support(self) -> None:
        builder = ModelFeatureBuilder()
        pipeline = FeatureParityPipeline(
            feature_order=builder.feature_order,
            defaults=builder.defaults,
            aliases=builder.aliases,
        )

        row = {name: builder.defaults[name] for name in builder.feature_order}
        row["final_weighted_score"] = 71.0  # alias for baseline_weighted_score
        row.pop("baseline_weighted_score")
        df = pd.DataFrame([row])
        out = pipeline.transform(df)
        pipeline.enforce_strict_parity(out.frame)

        self.assertEqual(list(out.frame.columns), builder.feature_order)
        self.assertAlmostEqual(float(out.frame.iloc[0]["baseline_weighted_score"]), 71.0, places=6)


if __name__ == "__main__":
    unittest.main()

