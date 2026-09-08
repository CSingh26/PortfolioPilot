from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .routers import backtest, health, optimize, risk

app = FastAPI(title="PortfolioPilot Quant", version="0.1.0")

app.include_router(health.router, prefix="/v1", tags=["health"])
app.include_router(backtest.router, prefix="/v1", tags=["backtest"])
app.include_router(optimize.router, prefix="/v1", tags=["optimize"])
app.include_router(risk.router, prefix="/v1", tags=["risk"])


@app.exception_handler(ValueError)
async def invalid_calculation(_request: Request, exc: ValueError):
    return JSONResponse(status_code=422, content={"detail": str(exc)})
