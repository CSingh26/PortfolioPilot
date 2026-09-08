# ReliScore independent review

Reviewer: PortfolioPilot project lead, read-only ReliScore review requested by the portfolio
orchestrator on 2026-09-08. Scope: model loading/scoring schemas and API, scoring service/client,
streaming trainer, feature builder, and adjacent inference feature engineering needed to verify
training/serving parity. Original examined revision: 23fb9076d3d7e21a9a18bb30b589ee1bdcc916c7;
re-review included 41b5055, dbe9103 and final closeout ed0c300e57ecf48c35815b62148f8438e2074168. No ReliScore source files were edited by this reviewer.

## Findings and reproduced evidence

### P1 — training/serving age and missing-delta mismatch (closed at dbe9103)

`feature-engineering.ts` previously fetched only 30 calendar days and computed age from the
oldest fetched row. On 91 daily rows from Jan 1 through Apr 1, actual API `age_days` was 30,
while the SQL training feature builder produced 90. A missing current SMART value with previous
observations of 10 yielded API delta −10, while training SQL yielded NULL, then the trainer's
zero imputation yielded 0. This changes the model's inputs before scaling and can materially
change its score even though the request schema and coefficients are correct.

Reproduction used the real exported `generateFeaturesForDay` with a fake Prisma boundary that
applied the production query bounds, plus the real DuckDB `build_features` on temporary synthetic
Parquet. Observed outputs before correction:

```text
API: age_days=30, smart_5_raw_delta_vs_7d=-10
Training: age_days=90, delta=NULL, training-filled delta=0
```

At dbe9103, the API uses lifetime `firstSeen` (earliest-telemetry fallback), reads the latest 30
actual observations across gaps to match SQL ROWS windows, and uses zero for a missing-current
delta after the same training convention. Repeating the real API function reproduced age 90 and
delta 0. This finding is closed within the reviewed feature contract.

### P2 — stale observations promoted to a requested as-of day (feature generation closed)

Previously the API generated a row for any drive present in the lookback even when the drive
had no observation on the requested day. dbe9103 now requires exact target-day telemetry and
excludes drives with a known failure at/before that date. Re-review confirmed the query predicates,
last-30-observation selection and target-day check in the generated-row loop.

A related retry-path finding was also corrected: `ScoringService.runScoringJob` reloads persisted
`featuresDaily` rows after generation. At ed0c300 the retrieval reapplies exact-day and no-prior-failure
eligibility, preventing a previously persisted row from bypassing corrected generation filters
on retries after telemetry/failure corrections. Re-reading the final query confirmed closure.

## Methods and validation assessed

- Training labels exclude failure-day and post-failure observations. Positive future-horizon
  labels are separated from negative labels requiring sufficient follow-up; unknown outcomes
  remain NULL and are excluded from fitting/evaluation.
- The chronological holdout is purged by the 30-day horizon. Training rows never substitute
  for an empty holdout. Scaler fitting uses training rows and the exported zero-fill convention.
- The artifact records class balancing and explicitly states scores are uncalibrated; they must
  not be called calibrated fleet failure probabilities. Conventional calibration/Brier/AP
  diagnostics and a training-prevalence baseline are computed from the holdout.
- Linear log-odds explanations multiply coefficients by the actual transformed features. They
  are not SHAP values, probabilities or causal effects. Unsupported models report explanations
  unavailable. Missing artifacts return 503 rather than fabricated risk.
- The updated model client chunks requests and checks returned drive/day/model-version identity.
  Finite, bounded payload schemas and model probability validation prevent nonfinite risk output.
- Local joblib artifacts remain trusted deployment inputs; deserialization is not safe for
  arbitrary untrusted uploads. This bounded review is not a penetration test or fleet model certification.

Independent model tests: `.venv/bin/python -m pytest services/model/tests -q` → 19 passed.
After the owner completed dependency alignment, the independent direct API `vitest run` completed
with 10 passing tests. The explicit exported-function reproductions above also ran successfully
via tsx independently of Vitest. All actionable findings in this bounded review are closed.

## Remaining methodological limits

Sparse observations still require clear “observation window” naming rather than implying exactly
7/30 calendar days. Missing SMART 241/242 in the application telemetry must be disclosed as a
training/serving availability limitation. Random device independence is not claimed: shared drives
across temporal periods test time generalization rather than unseen-drive generalization. A single
chronological holdout and class-balanced logistic scoring do not establish calibrated operational
failure probabilities or fleet-wide reliability gains.
