# Independent review closeout

Reviewer: separate ChronosResearch project lead (read-only PortfolioPilot review), coordinated
by the portfolio orchestrator. Reviewed original core commit 69095fa and closed findings on
bc0a1bcb3de6840ae3a5e78a21d6353f8604c03f on 2026-09-08.

| Finding | Resolution | Evidence |
|---|---|---|
| Negative unconstrained tangency normalization reverses direction | Reject unsupported nonpositive normalization | `test_unconstrained_tangency_rejects_negative_normalization` |
| Backtest entry row counted as elapsed day | CAGR uses terminal wealth over N−1 intervals; vol/Sharpe exclude entry row | `test_route_annualizes_elapsed_intervals_including_initial_cost` |
| Old results could remain beneath changed inputs | Every form change invalidates output; full fieldset disabled while calculating | Reviewer source inspection and actual browser interaction regression |

The reviewer reran the 12 backtest guardrail tests and confirmed all three findings closed.
The bounded review also checked risk nonfinite-input handling and adjusted-price/cache paths;
no additional material core security issue was identified. This is not an exhaustive penetration
test, investment-model certification, or a claim that every possible financial risk is covered.
