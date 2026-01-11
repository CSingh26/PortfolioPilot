from __future__ import annotations

from fastapi import APIRouter

from ..models import OptimizationRequest, OptimizationResult

router = APIRouter()


@router.post("/optimize", response_model=OptimizationResult)
def optimize(request: OptimizationRequest) -> OptimizationResult:
    n = len(request.tickers)
    weights = {ticker: 1 / n for ticker in request.tickers}
    return OptimizationResult(weights=weights, expected_return=0.1, expected_vol=0.15, sharpe=0.67)
