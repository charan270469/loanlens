from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from src.service.model_service.service import ModelFeatureBuilder
from src.service.model_service.training import PDModelTrainer


def main() -> int:
    parser = argparse.ArgumentParser(description="Manual retraining job for PD model.")
    parser.add_argument("--data-path", default=os.getenv("PD_TRAIN_DATA_PATH", ""), help="CSV/Parquet snapshot path")
    parser.add_argument("--version", default="", help="Artifact version label")
    parser.add_argument("--notes", default="manual_retrain_job", help="Lineage note")
    args = parser.parse_args()

    if not args.data_path:
        raise ValueError("PD training data path is required (--data-path or PD_TRAIN_DATA_PATH).")

    builder = ModelFeatureBuilder()
    trainer = PDModelTrainer(
        feature_order=builder.feature_order,
        defaults=builder.defaults,
        aliases=builder.aliases,
    )
    result = trainer.train(
        dataset_path=Path(args.data_path),
        version=args.version or None,
        notes=args.notes,
    )
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
