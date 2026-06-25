FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/db/package.json ./packages/db/

RUN npm ci

COPY . .

CMD ["node_modules/.bin/ts-node-dev", "--transpile-only", "--project", "apps/worker/tsconfig.json", "apps/worker/src/index.ts"]
