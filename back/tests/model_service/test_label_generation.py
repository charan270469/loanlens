from __future__ import annotations

import tempfile
import unittest

import pandas as pd

from src.service.model_service.service import ModelFeatureBuilder
from src.service.model_service.training.data_loader import TrainingDataLoader
from src.service.model_service.training.feature_pipeline import FeatureParityPipeline


class LabelGenerationTests(unittest.TestCase):
    def test_label_boundary_89_vs_90(self) -> None:
        builder = ModelFeatureBuilder()
        pipeline = FeatureParityPipeline(
            feature_order=builder.feature_order,
            defaults=builder.defaults,
            aliases=builder.aliases,
        )
        loader = TrainingDataLoader(pipeline)

        base = {name: builder.defaults[name] for name in builder.feature_order}
        rows = []
        r1 = dict(base)
        r1.update(
            {
                "case_id": "c1",
                "as_of_date": "2025-01-01",
                "outcome_window_end_date": "2025-12-31",
                "max_dpd_next_12m": 89,
            }
        )
        rows.append(r1)
        r2 = dict(base)
        r2.update(
            {
                "case_id": "c2",
                "as_of_date": "2025-01-02",
                "outcome_window_end_date": "2025-12-31",
                "max_dpd_next_12m": 90,
            }
        )
        rows.append(r2)
        df = pd.DataFrame(rows)

        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as fp:
            df.to_csv(fp.name, index=False)
            dataset = loader.load(fp.name)

        labels = list(dataset.labels.values)
        self.assertEqual(labels, [0, 1])


if __name__ == "__main__":
    unittest.main()

