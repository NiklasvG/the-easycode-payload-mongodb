FROM node:24.22.2-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends util-linux && rm -rf /var/lib/apt/lists/*
COPY --chown=node:node coordinator.mjs health.cjs ./
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s CMD ["node", "health.cjs"]
CMD ["flock", "--nonblock", "--no-fork", "/data/coordinator.lock", "node", "coordinator.mjs"]
