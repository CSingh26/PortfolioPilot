FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/

RUN npm install -g pnpm@11.19.0 && pnpm install --filter @portfoliopilot/web... --frozen-lockfile

COPY apps/web apps/web
COPY packages/shared packages/shared
COPY docs docs

WORKDIR /app/apps/web
ENV PORT=3000
RUN pnpm build

CMD ["pnpm", "start", "-p", "3000"]
