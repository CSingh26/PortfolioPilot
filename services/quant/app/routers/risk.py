from __future__ import annotations

from fastapi import APIRouter

from ..models import RiskMetrics, RiskRequest

router = APIRouter()


@router.post("/risk/metrics", response_model=RiskMetrics)
def risk_metrics(request: RiskRequest) -> RiskMetrics:
    return RiskMetrics(var=-0.02, cvar=-0.03, volatility=0.18)
