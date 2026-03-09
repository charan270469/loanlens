# LoanLens AI – ML Model Info

## Summary: Is the model trained and running accurately?

**Yes.** The **Probability of Default (PD)** model is trained, validated, and used in production. With `PD_MODEL_MODE=production` and active version `mock_from_env`, the backend uses the trained ensemble for PD; LGD and EAD come from the pre-trained credit-risk `.sav` artifacts.

---

## 1. Probability of Default (PD) model

### Where it lives
- **Directory:** `model_artifacts/pd/`
- **Active version:** `mock_from_env` (set in `model_artifacts/pd/active_version.txt`)
- **Other version:** `20260301_152938` (same trained model, different timestamp)

### What it is
- **Champion:** Ensemble of three models with isotonic calibration:
  - **Logistic regression** (WoE-based)
  - **XGBoost**
  - **LightGBM**
- **Weights (test):** LightGBM ~33.7%, Logistic ~32.8%, XGBoost ~33.5%
- **Calibration:** Isotonic regression (ECE driven to ~0.032 on validation)
- **Target:** 90+ days past due within 12 months (`pd_label_90dpd_12m`)

### Accuracy and validation (test set)

| Metric | Value | Note |
|--------|--------|------|
| **AUC** | **0.791** | Good discrimination |
| **KS** | **0.446** | Strong separation |
| **Brier** | 0.146 | Calibrated probabilities |
| **ECE** | **0.032** | Well calibrated |
| **Log loss** | 0.480 | |
| **Event rate** | 23.5% | Test set |
| **Sample count** | 750 | Test holdout |

### Promotion gate (did it pass?)
- **Promotable:** Yes (`promotion_gate.promotable: true`)
- **Thresholds:** min AUC 0.68, min KS 0.22, max ECE 0.06, max segment AUC drop 0.05
- **Candidate (calibrated):** AUC 0.791, KS 0.446, ECE 0.032 — all within gate
- **Baseline (random):** AUC 0.51, KS 0.077 — champion clearly better

### Training data (mock_from_env)
- **Source:** Mock lending snapshot CSV (e.g. `data/mock_training/mock_lending_snapshot.csv`)
- **Rows:** 5,000 (train 1,201 / validation 750 / test 750)
- **Event rate:** 24.36%
- **Window:** 2022-01-01 to 2025-12-30
- **Trained at:** 2026-03-01 (from `manifest.json`)

### Features (15 inputs)
The model expects this **feature order** (see `model_artifacts/pd/mock_from_env/feature_schema.json`):

1. `baseline_weighted_score`
2. `representative_credit_score`
3. `debt_to_income_ratio`
4. `average_monthly_balance`
5. `monthly_average_credit`
6. `monthly_average_debit`
7. `secondary_research_risk_score`
8. `circular_trading_score`
9. `notes_risk_adjustment`
10. `paystub_recency_days`
11. `delinquency_profile.30_day_delinquencies`
12. `delinquency_profile.60_day_delinquencies`
13. `delinquency_profile.90_day_delinquencies`
14. `negative_events.bankruptcies`
15. `negative_events.collections`

Defaults and aliases are in `feature_schema.json`; missing values are imputed using those defaults.

### How it runs in the backend
- **`PD_MODEL_MODE=production`** (your `.env`): For each case, the service builds a feature vector, then:
  1. Computes a **baseline** (XGBoost + LightGBM + CatBoost + Logistic WoE ensemble + credit_risk `.sav` for LGD/EAD).
  2. Loads the **active PD bundle** from the registry (`mock_from_env`).
  3. Runs **`bundle.predict_proba(feature_vector)`** and uses that as the production PD.
  4. Recomputes expected loss = PD × LGD × EAD and saves to `model_features` / policy decision.
- **`PD_MODEL_MODE=synthetic`**: Only the baseline stack is used (no registry PD override).
- **`PD_MODEL_MODE=shadow`**: Both baseline and registry PD are computed and compared (e.g. `model_features_shadow`).

So with your current config, the **trained PD model is in use and running accurately** in production.

---

## 2. Credit risk artifacts (PD/LGD/EAD .sav)

### Where they live
- **Directory:** `model_artifacts/credit_risk/`
- **Files:**
  - `pd_model.sav` / `pd_model_deployment.sav` – legacy PD (can be overridden by registry when in production)
  - `lgd_model_stage_1.sav` – Loss Given Default, stage 1
  - `lgd_model_stage_2.sav` – LGD, stage 2
  - `reg_ead.sav` – Exposure at Default regression

### How they’re used
- Loaded in `model_service/service.py` via `RecommendationModelService` (artifact loader).
- **LGD** and **EAD** from these artifacts are always used in the baseline (and in production) to compute expected loss.
- **PD** from artifacts is used only when the registry does not override it (e.g. in synthetic mode, or if production bundle load fails).

### Diagnostics (mock data)
- `model_artifacts/credit_risk/mock_training_diagnostics.json`:
  - Rows: 5,000
  - PD event rate: 24.36%
  - LGD stage-1 event rate: 40.68%
  - LGD stage-2 mean: ~0.40
  - EAD mean: ~0.84

No test AUC/metrics are stored in the repo for these `.sav` models; they are pre-trained artifacts used for LGD/EAD (and fallback PD).

---

## 3. Model card (PD) – limitations

From `model_artifacts/pd/mock_from_env/model_card.md`:

- **Intended use:** Probability of default for credit decision support.
- **Target:** 90+ DPD within 12 months.
- **Limitations:** PD-only first release; LGD/EAD still use the existing artifact/fallback path. Calibration and reliability depend on snapshot quality and feature coverage.

---

## 4. Quick reference

| Question | Answer |
|----------|--------|
| Is the ML model trained? | Yes – PD ensemble (logistic + XGBoost + LightGBM) trained on mock data. |
| Is it running accurately? | Yes – Test AUC 0.79, KS 0.45, ECE 0.03; promotion gate passed. |
| Which version is live? | `mock_from_env` (active_version.txt). |
| What does production use? | PD from registry (`mock_from_env`); LGD/EAD from `credit_risk/*.sav`. |
| Where are metrics? | `model_artifacts/pd/mock_from_env/metrics.json` and `model_card.md`. |
