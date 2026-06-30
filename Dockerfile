FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/worker/package.json ./apps/worker/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/integrations/package.json ./packages/integrations/
COPY packages/types/package.json ./packages/types/

RUN npm ci

COPY . .

CMD ["node_modules/.bin/ts-node-dev", "--transpile-only", "--project", "apps/worker/tsconfig.json", "apps/worker/src/index.ts"]
