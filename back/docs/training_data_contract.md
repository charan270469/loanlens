# Training Data Contract (PD Real-Label Model)

This document defines the snapshot schema required by the PD training pipeline.

## Required Metadata Columns
- `case_id` (string): unique case/application id.
- `as_of_date` (date): decision/reference date for feature snapshot.
- `outcome_window_end_date` (date): last date of the 12-month outcome window.
- `max_dpd_next_12m` (numeric): maximum observed DPD in next 12 months.

## Label Rule
- `pd_label_90dpd_12m = 1` if `max_dpd_next_12m >= 90`, else `0`.

## Required Feature Columns
The snapshot must contain the online model feature set (directly or alias-mapped):
- `baseline_weighted_score`
- `representative_credit_score`
- `debt_to_income_ratio`
- `average_monthly_balance`
- `monthly_average_credit`
- `monthly_average_debit`
- `secondary_research_risk_score`
- `circular_trading_score`
- `notes_risk_adjustment`
- `paystub_recency_days`
- `delinquency_profile.30_day_delinquencies`
- `delinquency_profile.60_day_delinquencies`
- `delinquency_profile.90_day_delinquencies`
- `negative_events.bankruptcies`
- `negative_events.collections`

## Optional Leakage Control Column
- `borrower_id` (string): if present, train/test borrower overlap is removed.

## Exclusion Rules
- Drop rows with missing `as_of_date`.
- Drop rows where `outcome_window_end_date < as_of_date`.
- De-duplicate on `(case_id, as_of_date)` keeping latest `outcome_window_end_date`.

## Accepted File Formats
- CSV (`.csv`)
- Parquet (`.parquet`, `.pq`)

## Outputs Produced By Training Job
Under `model_artifacts/pd/<version>/`:
- `model.pkl`
- `calibrator.pkl`
- `manifest.json`
- `feature_schema.json`
- `metrics.json`
- `data_quality.json`
- `drift_report.json`
- `model_card.md`

