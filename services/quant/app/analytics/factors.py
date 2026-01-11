from __future__ import annotations

import pandas as pd
import statsmodels.api as sm


def factor_regression(returns: pd.Series, factors: pd.DataFrame) -> dict:
    if returns.empty or factors.empty:
        return {}

    aligned = pd.concat([returns.rename("portfolio"), factors], axis=1, join="inner").dropna()
    if aligned.empty:
        return {}

    y = aligned["portfolio"] - aligned.get("RF", 0)
    factor_cols = [col for col in ["Mkt-RF", "SMB", "HML"] if col in aligned.columns]
    X = sm.add_constant(aligned[factor_cols])
    model = sm.OLS(y, X).fit()

    coefficients = model.params.to_dict()
    tstats = model.tvalues.to_dict()
    return {
        "coefficients": coefficients,
        "tstats": tstats,
        "r2": float(model.rsquared),
    }
