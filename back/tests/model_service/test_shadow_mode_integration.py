from __future__ import annotations

import json
import os
import pickle
import tempfile
import unittest
from pathlib import Path

import numpy as np
from sklearn.dummy import DummyClassifier

from src.repository.case_repo import CaseRepository
from src.repository.feature_repo import FeatureRepository
from src.service.model_service.service import ModelFeatureBuilder, RecommendationModelService


class ShadowModeIntegrationTests(unittest.TestCase):
    def test_shadow_mode_persists_shadow_namespace(self) -> None:
        builder = ModelFeatureBuilder()

        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            model_dir = root / "pd"
            version = "v_test"
            version_dir = model_dir / version
            version_dir.mkdir(parents=True, exist_ok=True)

            X = np.zeros((10, len(builder.feature_order)), dtype=float)
            y = np.array([0, 1] * 5)
            clf = DummyClassifier(strategy="prior")
            clf.fit(X, y)
            with (version_dir / "model.pkl").open("wb") as f:
                pickle.dump(clf, f)
            (version_dir / "manifest.json").write_text(
                json.dumps({"version": version, "trained_at": "2026-03-01T00:00:00Z"}),
                encoding="utf-8",
            )
            (version_dir / "feature_schema.json").write_text(
                json.dumps({"feature_order": builder.feature_order}),
                encoding="utf-8",
            )
            (version_dir / "metrics.json").write_text(json.dumps({}), encoding="utf-8")

            os.environ["PD_MODEL_DIR"] = str(model_dir)
            os.environ["PD_ACTIVE_VERSION"] = version
            os.environ["PD_MODEL_MODE"] = "shadow"
            os.environ["PD_SHADOW_ENABLED"] = "true"

            case_repo = CaseRepository(base_dir=root / "resources")
            feature_repo = FeatureRepository(case_repo)
            service = RecommendationModelService(case_repo, feature_repo)

            case_id = "case-shadow"
            payload = {k: v for k, v in builder.defaults.items()}
            _ = service.score_case(case_id, payload)
            shadow = feature_repo.load_features(case_id, "model_features_shadow")

            self.assertIn("baseline_pd", shadow)
            self.assertIn("shadow_pd", shadow)
            self.assertIn("shadow_model_version", shadow)


if __name__ == "__main__":
    unittest.main()

