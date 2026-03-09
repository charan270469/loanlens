from __future__ import annotations

import argparse
import json
import pickle
import sys
from pathlib import Path
from typing import Any, Dict

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestRegressor

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from src.service.model_service.service import ModelFeatureBuilder
from src.service.model_service.training import PDModelRegistry, PDModelTrainer


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def build_mock_snapshot(
    builder: ModelFeatureBuilder,
    rows: int,
    seed: int,
) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    X, y_pd = builder.synthetic_training_data(n_samples=rows, seed=seed)
    frame = pd.DataFrame(X, columns=builder.feature_order)

    day_offsets = rng.integers(0, 365 * 4, size=rows)
    as_of_date = pd.Timestamp("2022-01-01") + pd.to_timedelta(day_offsets, unit="D")

    frame["case_id"] = [f"CASE-{idx:07d}" for idx in range(rows)]
    borrower_pool = max(400, rows // 7)
    frame["borrower_id"] = [f"BORR-{idx:05d}" for idx in rng.integers(1, borrower_pool, size=rows)]
    frame["as_of_date"] = as_of_date
    frame["outcome_window_end_date"] = as_of_date + pd.Timedelta(days=365)
    frame["max_dpd_next_12m"] = np.where(
        y_pd == 1,
        rng.integers(90, 181, size=rows),
        rng.integers(0, 90, size=rows),
    )

    # Keep this label handy for artifact-model training and diagnostics.
    frame["pd_label_90dpd_12m"] = y_pd.astype(int)
    return frame


def train_credit_risk_artifacts(
    frame: pd.DataFrame,
    builder: ModelFeatureBuilder,
    seed: int,
    output_dir: Path,
) -> Dict[str, Any]:
    rng = np.random.default_rng(seed + 100)
    X = frame[builder.feature_order].values
    y_pd = frame["pd_label_90dpd_12m"].astype(int).values

    dti = frame["debt_to_income_ratio"].values
    sec_risk = frame["secondary_research_risk_score"].values
    circular = frame["circular_trading_score"].values
    recency = frame["paystub_recency_days"].values
    delq90 = frame["delinquency_profile.90_day_delinquencies"].values
    bankruptcies = frame["negative_events.bankruptcies"].values
    collections = frame["negative_events.collections"].values
    monthly_credit = np.maximum(frame["monthly_average_credit"].values, 1.0)
    monthly_debit = frame["monthly_average_debit"].values

    lgd_stage1_prob = np.clip(
        0.06
        + (0.35 * y_pd)
        + (0.14 * np.clip(dti, 0.0, 1.5))
        + (0.12 * (sec_risk / 100.0))
        + (0.10 * (delq90 / 3.0))
        + (0.10 * (bankruptcies / 2.0))
        + (0.08 * (collections / 6.0))
        + (0.05 * (circular / 100.0)),
        0.02,
        0.98,
    )
    y_lgd_stage1 = rng.binomial(1, lgd_stage1_prob).astype(int)

    lgd_raw = (
        0.14
        + (0.45 * y_pd)
        + (0.18 * np.clip(dti, 0.0, 1.5))
        + (0.10 * (sec_risk / 100.0))
        + (0.07 * (collections / 8.0))
        + rng.normal(0, 0.04, len(frame))
    )
    y_lgd_stage2 = np.clip(lgd_raw, 0.05, 0.95)

    utilization_ratio = np.clip(monthly_debit / monthly_credit, 0.0, 2.0)
    ead_raw = (
        0.48
        + (0.32 * np.clip(dti, 0.0, 1.5))
        + (0.15 * utilization_ratio)
        + (0.08 * (recency / 365.0))
        + (0.04 * (sec_risk / 100.0))
        + rng.normal(0, 0.05, len(frame))
    )
    y_ead = np.clip(ead_raw, 0.2, 1.2)

    pd_model = GradientBoostingClassifier(random_state=seed)
    pd_model.fit(X, y_pd)

    lgd_stage1_model = GradientBoostingClassifier(random_state=seed + 1)
    lgd_stage1_model.fit(X, y_lgd_stage1)

    lgd_stage2_model = RandomForestRegressor(
        n_estimators=220,
        random_state=seed + 2,
        min_samples_leaf=6,
        n_jobs=-1,
    )
    lgd_stage2_model.fit(X, y_lgd_stage2)

    reg_ead_model = RandomForestRegressor(
        n_estimators=220,
        random_state=seed + 3,
        min_samples_leaf=6,
        n_jobs=-1,
    )
    reg_ead_model.fit(X, y_ead)

    output_dir.mkdir(parents=True, exist_ok=True)
    artifacts = {
        "pd_model.sav": pd_model,
        "pd_model_deployment.sav": pd_model,
        "lgd_model_stage_1.sav": lgd_stage1_model,
        "lgd_model_stage_2.sav": lgd_stage2_model,
        "reg_ead.sav": reg_ead_model,
    }
    for filename, model_obj in artifacts.items():
        with (output_dir / filename).open("wb") as f:
            pickle.dump(model_obj, f)

    diagnostics = {
        "rows": int(len(frame)),
        "pd_event_rate": float(np.mean(y_pd)),
        "lgd_stage1_event_rate": float(np.mean(y_lgd_stage1)),
        "lgd_stage2_mean": float(np.mean(y_lgd_stage2)),
        "ead_mean": float(np.mean(y_ead)),
    }
    (output_dir / "mock_training_diagnostics.json").write_text(
        json.dumps(diagnostics, indent=2),
        encoding="utf-8",
    )
    return diagnostics


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate mock training dataset and train all backend ML artifacts.",
    )
    parser.add_argument("--rows", type=int, default=5000, help="Number of synthetic rows.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed.")
    parser.add_argument("--pd-version", default="", help="Optional PD artifact version label.")
    parser.add_argument(
        "--activate-pd-version",
        action="store_true",
        help="Set the newly trained PD version as active in registry.",
    )
    args = parser.parse_args()

    if args.rows < 500:
        raise ValueError("Use at least 500 rows so split/calibration metrics are stable.")

    repo_root = _repo_root()
    data_dir = repo_root / "data" / "mock_training"
    data_dir.mkdir(parents=True, exist_ok=True)
    csv_path = data_dir / "mock_lending_snapshot.csv"
    parquet_path = data_dir / "mock_lending_snapshot.parquet"

    builder = ModelFeatureBuilder()
    frame = build_mock_snapshot(builder, rows=args.rows, seed=args.seed)

    frame.to_csv(csv_path, index=False)
    try:
        frame.to_parquet(parquet_path, index=False)
    except Exception:
        parquet_path = Path("")

    registry = PDModelRegistry()
    trainer = PDModelTrainer(
        feature_order=builder.feature_order,
        defaults=builder.defaults,
        aliases=builder.aliases,
        model_dir=registry.model_dir,
    )
    pd_result = trainer.train(
        dataset_path=csv_path,
        version=args.pd_version or None,
        notes="mock_dataset_bootstrap_training",
    )

    if args.activate_pd_version:
        registry.set_active_version(pd_result["version"])

    credit_risk_dir = repo_root / "model_artifacts" / "credit_risk"
    credit_diag = train_credit_risk_artifacts(
        frame=frame,
        builder=builder,
        seed=args.seed,
        output_dir=credit_risk_dir,
    )

    summary = {
        "mock_dataset_csv": str(csv_path),
        "mock_dataset_parquet": str(parquet_path) if str(parquet_path) else "",
        "rows": int(len(frame)),
        "pd_training_version": pd_result["version"],
        "pd_artifact_dir": pd_result["artifact_dir"],
        "pd_promotable": bool(pd_result.get("promotion_gate", {}).get("promotable", False)),
        "pd_gate_reasons": pd_result.get("promotion_gate", {}).get("reasons", []),
        "pd_active_version": registry.get_active_version(),
        "credit_risk_artifact_dir": str(credit_risk_dir),
        "credit_risk_diagnostics": credit_diag,
    }
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
