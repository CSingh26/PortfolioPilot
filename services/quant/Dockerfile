FROM python:3.12-slim

WORKDIR /app

COPY services/quant/pyproject.toml services/quant/pyproject.toml
COPY services/quant/app services/quant/app

RUN pip install --no-cache-dir -e services/quant
RUN mkdir -p /app/data/cache /app/data/runs

ENV PORT=8000
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
