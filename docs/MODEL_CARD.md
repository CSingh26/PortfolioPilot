# Model card — deterministic portfolio research

**Intended use:** learning, allocation diagnosis and reproducible historical research.
**Not intended:** automated investment decisions, return prediction, trade execution or client reporting.

There is no trained ML model or LLM in the calculation path. Sample statistical estimators,
convex optimization and a chronological holdings simulator implement the methods. The primary
inputs are complete adjusted-price panels, weights, benchmark, risk-free rate, dates and scenario
shocks. Provider data and user assertions are distinct from validated numerical outputs.

Risk parity uses convex log budgeting with a contribution convergence check; volatility targeting
uses historical sample volatility at each rebalance and never more than 100% gross exposure.
See [methodology](METHODOLOGY.md) for all formulas and conventions.

Validation uses analytical examples, invariants, invalid input tests, an API round trip and future
price perturbations. Independent review challenged annualization and tangency normalization;
regressions now cover both findings. Synthetic fixtures demonstrate software behavior only, not
model accuracy, investability, or real market performance.

No predictive accuracy metric is meaningful for this tool. Future research on shrinkage, regime
sensitivity and walk-forward allocation is not completed. See [limitations](LIMITATIONS.md).
