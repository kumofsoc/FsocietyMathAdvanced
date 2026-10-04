FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@11.28.4 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_API_TIMEOUT_MS=12000
ARG VITE_ERROR_REPORTING_URL=
ARG VITE_APP_RELEASE=container

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_TIMEOUT_MS=${VITE_API_TIMEOUT_MS}
ENV VITE_ERROR_REPORTING_URL=${VITE_ERROR_REPORTING_URL}
ENV VITE_APP_RELEASE=${VITE_APP_RELEASE}

RUN test -n "$VITE_API_BASE_URL"     && pnpm typecheck     && pnpm build

FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:8080/healthz >/dev/null || exit 1
