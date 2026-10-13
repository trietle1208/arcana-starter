# syntax=docker/dockerfile:1
# Arcana — one image definition for dev, production and end-to-end tests.
ARG NODE_VERSION=24
ARG PNPM_VERSION=10.34.5

FROM node:${NODE_VERSION}-bookworm-slim AS base
ARG PNPM_VERSION
ENV NEXT_TELEMETRY_DISABLED=1 \
    npm_config_store_dir=/app/.pnpm-store \
    CI=true
RUN npm install -g pnpm@${PNPM_VERSION} && npm cache clean --force
WORKDIR /app

# ---- dev: the project is bind-mounted at /app, see compose.yaml ----
FROM base AS dev
ENV NODE_ENV=development CI=
USER node
EXPOSE 3000
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm dev"]

# ---- e2e: dev tooling + Chromium for Playwright (keep PLAYWRIGHT_VERSION = package.json) ----
FROM base AS e2e
ARG PLAYWRIGHT_VERSION=1.64.0
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright CI=
RUN npx --yes playwright@${PLAYWRIGHT_VERSION} install --with-deps chromium \
    && chmod -R a+rX /ms-playwright && rm -rf /var/lib/apt/lists/* /root/.npm
USER node
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm test:e2e"]

# ---- production build ----
FROM base AS build
ENV ARCANA_STANDALONE=1
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:${NODE_VERSION}-bookworm-slim AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# The SQL migrations. The server applies them itself as it boots (src/instrumentation.ts): this
# image has no pnpm to run `db:migrate`, and the standalone output carries only what the server
# imports, which is also why the migrate script is not copied.
COPY --from=build --chown=node:node /app/drizzle ./drizzle
USER node
EXPOSE 3000
CMD ["node", "server.js"]
