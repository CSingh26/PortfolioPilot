# PortfolioPilot delivery evidence

Verification date: 2026-09-08. Repository: <https://github.com/CSingh26/PortfolioPilot>.
Default branch: `main`. Baseline: `188b886` (20 existing commits, preserved).
Initial implementation/release verification revision: `b1b3da441c973fb63b3ecbfbf3ae17d4f61352c9`
(25 meaningful total commits). Subsequent review fixes and this evidence report are committed after that named revision;
obtain that self-referential delivery SHA with `git rev-parse HEAD`, and compare it with
`git ls-remote origin refs/heads/main`. The orchestrator's final report records that exact SHA.

## Product outcome

A real supplied-price/Yahoo risk workbench extends the existing Next.js → Express → FastAPI
architecture. It validates complete panels, reports source/date/frequency/content hash, explains
annual return/risk and signed daily tails, compares a benchmark using beta/CAPM, attributes
volatility, computes covariance/correlation and user shocks, and exports results. Missing data
raises errors. Synthetic teaching data requires explicit selection and is labeled in the UI.

Backtests now drift holdings, charge entry/cost turnover, warm up estimated strategies, choose
actual final trading observations, use historical exposure for the next interval, and annualize
by elapsed return intervals. Risk parity has a contribution convergence check; optimizer failure
is no longer silently replaced with equal weights. The old fictional overview/live fallback was removed.

## Observed local verification

| Command / check | Observed result |
|---|---|
| `pnpm install --frozen-lockfile` | Installation passes with pinned pnpm 11.19.0 and explicit build allowlist |
| `pnpm --filter @portfoliopilot/api prisma:generate` | Prisma client generated |
| `pnpm lint` | Pass across web, shared and API |
| `pnpm typecheck` | Pass across all TypeScript packages |
| `pnpm test` | 5 TypeScript tests pass |
| `.venv/bin/python -m pytest services/quant/tests -q` | 38 Python tests pass |
| `.venv/bin/python -m ruff check services/quant/app services/quant/tests` | Pass |
| `pnpm build` | API compilation and Next.js production build pass; 10 static pages generated |
| `pnpm audit --audit-level=low` | No known vulnerabilities after direct upgrades and patched transitive overrides |
| `.venv/bin/python -m pip_audit --format=json` | No known vulnerabilities; local environment pip upgraded as well |
| `.venv/bin/python -m pip check` | No broken requirements |
| `python3 scripts/check-secrets.py` | 118 tracked files scanned before this report; zero high-confidence credential/private-key matches |
| `docker compose -f infra/docker-compose.yml config --quiet` | Compose configuration validates; full image builds were not executed |
| `git ls-remote origin refs/heads/main` | Matched local release SHA b1b3da441c973fb63b3ecbfbf3ae17d4f61352c9 |

Python tests emit two upstream Starlette/httpx compatibility deprecation warnings, without test
failures. The scanner is a bounded credential-pattern scan, not a claim that all secrets/security
issues are impossible. Dependency audits only cover published advisories available when executed.

## Independent review and browser evidence

[Independent review](INDEPENDENT_REVIEW.md) records three closed findings: unconstrained tangency
normalization, backtest elapsed intervals, and stale risk output beneath edited controls. The
reviewer independently reran all 12 backtest guardrail tests at the reviewed revision.

A headless Chromium walkthrough ran the actual local Next.js, Express, Redis and FastAPI services:
load labeled teaching data → analyze → await calculated evidence export. No page errors occurred.
Desktop 1440×1000 and mobile 390×844 screenshots were captured; mobile had no horizontal overflow.
An additional actual-browser regression confirmed editing a weight removes prior results and
inputs are disabled while a request is pending. Screenshots contain calculated synthetic teaching
results, not real investment performance or a mocked API response.

- [Desktop workbench](assets/risk-workbench.png)
- [Mobile workbench](assets/risk-mobile.png)

## CI and remote state

The default-branch workflow installs pinned dependencies, runs Node/Python lint, type checks,
TypeScript/Python tests, the production build, Node advisory audit and tracked secret-pattern scan.
Verified review revision CI: [bc0a1bc](https://github.com/CSingh26/PortfolioPilot/actions/runs/34283024665)
completed successfully. Release revision CI:
[b1b3da4](https://github.com/CSingh26/PortfolioPilot/actions/runs/34283394029)
completed successfully.
The final delivery commit's exact-SHA CI and clean remote state are verified separately by
the release agent before completion; this report does not claim a run succeeded before it finished.

Repository description and relevant finance/risk/engineering topics are configured. All existing
history, private/public visibility and license were preserved. No force push was used.

## Material limits / remaining research

This is a local, unauthenticated research tool. Provider data is not guaranteed point-in-time;
upload provenance is user asserted. Tail estimates, covariance and beta are unstable in short
samples/regime changes. Risk snapshots assume cost-free daily constant weights. The chronological
backtest uses simplified signal-close execution, linear turnover costs and zero-yield cash; exact
self-financing cost fixed points, impact, tax, financing and a validated exchange calendar are absent.
Unconstrained optimizer outputs can short; the simulator itself stays unlevered. Backtest
undefined Sharpe/Calmar are now null, with explicit unavailable interpretations. Its compatibility
benchmark field is not used; every response/UI warns that actual benchmark comparisons are in
the risk workbench.

Redis is required by gateway startup/quote monitor; PostgreSQL is required for saving runs. The
supplied-price FastAPI endpoint itself requires neither. Saved-run persistence and external live
market connectivity were not exercised in the final browser walkthrough. Docker configuration was
validated, but image builds were not. Walk-forward allocation, point-in-time universes, uncertainty
bands and shrinkage/regime estimation remain explicitly future research.


## Final orchestrator review correction

After the named initial release checks, the orchestrator requested removing two remaining legacy
ambiguities. Backtest Sharpe/Calmar now return null when undefined; the shared schemas preserve
null and the UI displays Unavailable with the denominator explanation. Every backtest response
and rendered result explicitly warns that the compatibility benchmark field is unused and directs
users to actual benchmark/CAPM comparisons in Risk. New failing-first Python/API and TypeScript
regressions increased the verified totals to 38 and 5. These corrections are included in the final
HEAD verified by CI and reported by the orchestrator; the old named revisions above are prior evidence.

An isolated browser contract check also delivered the actual backend's constant-price test result
to the production UI through a mocked HTTP boundary: null Sharpe and Calmar rendered Unavailable,
the unused-benchmark warning was visible, and no page errors occurred. This is explicitly a UI
contract test, separate from the full-stack teaching-data walkthrough and its screenshots.
