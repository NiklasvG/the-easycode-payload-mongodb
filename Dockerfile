# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN npm install --global pnpm@10.23.0
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
ARG NEXT_PUBLIC_SERVER_URL
ARG APP_ENV=production
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ENV APP_ENV=${APP_ENV}
# Compilation only: frontend routes are dynamic and do not query this database.
# Production credentials are supplied to the runtime container by Coolify.
RUN test -n "$NEXT_PUBLIC_SERVER_URL" \
    && MONGODB_URI=mongodb://127.0.0.1:27017/build-only \
    PAYLOAD_SECRET=build-only-secret-not-used-at-runtime \
    GEMINI_API_KEY=build-only-key-not-used-at-runtime \
    SMTP_PORT=587 \
    pnpm run build

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
