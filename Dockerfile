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

RUN node -e 'const fs=require("fs"); const api=(process.env.VITE_API_BASE_URL||"").trim(); let u; try { u=new URL(api) } catch { process.exit(1) } if (!["http:","https:"].includes(u.protocol) || u.username || u.password || u.pathname !== "/" || u.search || u.hash) process.exit(1); const sources=["\x27self\x27"]; for (const raw of [api,(process.env.VITE_ERROR_REPORTING_URL||"").trim()]) { if (!raw) continue; let parsed; try { parsed=new URL(raw) } catch { process.exit(1) } if (!["http:","https:"].includes(parsed.protocol)) process.exit(1); if (!sources.includes(parsed.origin)) sources.push(parsed.origin) } const template=fs.readFileSync("deploy/security-headers.conf","utf8"); if (!template.includes("__VISUALMATH_CONNECT_SRC__")) process.exit(1); fs.writeFileSync("/tmp/security-headers.conf",template.replace("__VISUALMATH_CONNECT_SRC__",sources.join(" ")))' \
    && pnpm typecheck \
    && pnpm build

FROM nginxinc/nginx-unprivileged:stable-alpine3.24

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /tmp/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:8080/healthz >/dev/null || exit 1
