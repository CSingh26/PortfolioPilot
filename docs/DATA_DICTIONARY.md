# Data dictionary

| Field | Units / meaning |
|---|---|
| history.dates | ISO daily dates; ascending and unique |
| history.prices | adjusted prices, positive finite numbers; one list per asset/benchmark |
| history.source | user-supplied provenance label, not independently verified |
| start / end | inclusive start / exclusive end |
| weights | nonnegative fractions summing to one; omitted = equal weights |
| risk_free | annual effective decimal rate; .04 = 4% |
| alpha (request) | VaR confidence, strictly between .5 and 1 |
| shocks | hypothetical per-asset simple returns, −1 through 10; omitted = zero |
| expected_return | historical daily arithmetic mean × 252 |
| cagr | compounded wealth annualized by observed intervals |
| volatility / downside_deviation | annual decimal dispersion |
| hist_var / hist_cvar / param_var / param_cvar | signed one-day decimal tail returns |
| beta | dimensionless covariance exposure to benchmark |
| alpha (response) | annual descriptive CAPM residual return, unrelated to VaR confidence name |
| risk_contribution | annual component volatility in decimal units, sums to portfolio volatility |
| covariance | annual squared decimal returns |
| correlation | dimensionless; null for constant series |
| stress_return | one-period weighted linear shock |
| metadata.input_sha256 | hash of normalized input prices, independent of weights/model assumptions |
| metadata.observations | daily return count; one fewer than price count |
| null ratios | denominator insufficient/zero; not a zero-risk claim |

CSV is simple comma-separated text without quoted fields. The upload parser handles only daily
price panels, not transaction exports or holdings ledgers. Synthetic teaching paths use deliberately
non-market labels EQUITY/BONDS/GOLD and never load automatically after a provider error.
