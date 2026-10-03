# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN npm install --global pnpm@10.23.0
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM deps AS build-input
COPY . .

FROM build-input AS builder
ARG NEXT_PUBLIC_SERVER_URL
ARG APP_ENV=production
ARG NEXT_BUNDLER=webpack
ARG UMAMI_SCRIPT_URL
ARG UMAMI_WEBSITE_ID
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ENV APP_ENV=${APP_ENV}
# Read published CMS content during static generation. Supply credentials as
# BuildKit secrets; they are not persisted as build arguments or image ENV.
RUN --mount=type=secret,id=MONGODB_URI,env=MONGODB_URI,required=true \
    --mount=type=secret,id=PAYLOAD_SECRET,env=PAYLOAD_SECRET,required=true \
    --mount=type=secret,id=NEXT_PUBLIC_SERVER_URL,env=BUILD_NEXT_PUBLIC_SERVER_URL \
    --mount=type=secret,id=APP_ENV,env=BUILD_APP_ENV \
    --mount=type=secret,id=NEXT_BUNDLER,env=BUILD_NEXT_BUNDLER \
    --mount=type=secret,id=UMAMI_SCRIPT_URL,env=BUILD_UMAMI_SCRIPT_URL \
    --mount=type=secret,id=UMAMI_WEBSITE_ID,env=BUILD_UMAMI_WEBSITE_ID \
    normalize_secret() { \
      case "$1" in \'*\') value="${1#\'}"; printf '%s' "${value%\'}" ;; *) printf '%s' "$1" ;; esac; \
    } \
    && export MONGODB_URI="$(normalize_secret "$MONGODB_URI")" \
    PAYLOAD_SECRET="$(normalize_secret "$PAYLOAD_SECRET")" \
    NEXT_PUBLIC_SERVER_URL="$(normalize_secret "${BUILD_NEXT_PUBLIC_SERVER_URL:-$NEXT_PUBLIC_SERVER_URL}")" \
    APP_ENV="$(normalize_secret "${BUILD_APP_ENV:-$APP_ENV}")" \
    NEXT_BUNDLER="$(normalize_secret "${BUILD_NEXT_BUNDLER:-$NEXT_BUNDLER}")" \
    UMAMI_SCRIPT_URL="$(normalize_secret "${BUILD_UMAMI_SCRIPT_URL:-$UMAMI_SCRIPT_URL}")" \
    UMAMI_WEBSITE_ID="$(normalize_secret "${BUILD_UMAMI_WEBSITE_ID:-$UMAMI_WEBSITE_ID}")" \
    && if [ -z "$NEXT_PUBLIC_SERVER_URL" ]; then \
      echo 'Missing NEXT_PUBLIC_SERVER_URL: set a build variable or build argument.' >&2; exit 1; \
    fi \
    && for value in "$NEXT_PUBLIC_SERVER_URL" "$APP_ENV" "$NEXT_BUNDLER" "$MONGODB_URI" "$PAYLOAD_SECRET" "$UMAMI_SCRIPT_URL" "$UMAMI_WEBSITE_ID"; do \
      case "$value" in \"*|*\"|\'*|*\') \
        echo 'A build variable contains surrounding quotes. Remove them in Coolify; enter bare values.' >&2; exit 1 ;; \
      esac; \
    done \
    && case "$NEXT_BUNDLER" in webpack|turbopack) ;; *) \
      echo 'Invalid NEXT_BUNDLER: use webpack or turbopack.' >&2; exit 1 ;; esac \
    && AI_CHAT_ENABLED=false \
    EMAIL_TRANSPORT=json \
    SMTP_PORT=587 \
    pnpm exec next build --${NEXT_BUNDLER}

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV PAYLOAD_UPLOAD_DIR=/app/media
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs \
    && mkdir -p /app/media /app/.next \
    && chown -R nextjs:nodejs /app/media /app/.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
