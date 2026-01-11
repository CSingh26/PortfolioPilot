.PHONY: install dev lint typecheck test build docker-up docker-down

install:
	pnpm install

dev:
	pnpm dev

lint:
	pnpm lint

typecheck:
	pnpm typecheck

test:
	pnpm test
	python3 -m pytest services/quant/tests

build:
	pnpm build

docker-up:
	docker compose -f infra/docker-compose.yml up -d --build

docker-down:
	docker compose -f infra/docker-compose.yml down
