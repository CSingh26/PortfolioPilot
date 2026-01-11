from fastapi import FastAPI

from .routers import backtest, health, optimize, risk

app = FastAPI(title="PortfolioPilot Quant", version="0.1.0")

app.include_router(health.router, prefix="/v1", tags=["health"])
app.include_router(backtest.router, prefix="/v1", tags=["backtest"])
app.include_router(optimize.router, prefix="/v1", tags=["optimize"])
app.include_router(risk.router, prefix="/v1", tags=["risk"])
