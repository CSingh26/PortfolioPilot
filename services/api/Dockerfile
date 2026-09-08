FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY services/api/package.json services/api/

RUN npm install -g pnpm@11.19.0 && pnpm install --filter @portfoliopilot/api... --frozen-lockfile

COPY packages/shared packages/shared
COPY services/api services/api

WORKDIR /app/services/api
ENV PORT=4000
RUN pnpm prisma:generate
RUN pnpm build

CMD ["node", "dist/index.js"]
