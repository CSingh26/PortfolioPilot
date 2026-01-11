FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/

RUN corepack enable && pnpm install --filter @portfoliopilot/web... --frozen-lockfile

COPY apps/web apps/web
COPY packages/shared packages/shared

WORKDIR /app/apps/web
ENV PORT=3000
RUN pnpm build

CMD ["pnpm", "start", "-p", "3000"]
