# PD Model Card (20260301_152938)

## Intended Use
- Probability of default estimation for credit decision support.

## Training Target
- 90+ DPD within 12 months (`pd_label_90dpd_12m`).

## Data Window
- Start: 2022-01-01
- End: 2025-12-30

## Key Metrics (Test)
- Champion: ensemble
- AUC: 0.7910100570161545
- KS: 0.4456564776686728
- ECE: 0.03180787367325496

## Limitations
- PD-only first release. LGD/EAD continue through existing artifact/fallback path.
- Snapshot quality and feature coverage directly affect calibration reliability.
