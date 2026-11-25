FROM node:22-bookworm-slim AS frontend
WORKDIR /app/Frontend
COPY Frontend/package*.json ./
RUN npm ci
COPY Frontend/ ./
ENV VITE_API_URL=/api VITE_PUBLIC_DEMO=true
RUN npm run build

FROM node:22-bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends mariadb-server chromium fonts-liberation gosu tini \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app/Backend
ENV NODE_ENV=production PUPPETEER_SKIP_DOWNLOAD=true PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
COPY Backend/package*.json ./
RUN npm ci --omit=dev
COPY Backend/ ./
COPY --from=frontend /app/Frontend/dist /app/Frontend/dist
COPY deploy/start-demo.sh /usr/local/bin/start-demo
ENV DEMO_MODE=true PORT=10000 TZ=Asia/Jakarta
EXPOSE 10000
ENTRYPOINT ["tini", "--", "bash", "/usr/local/bin/start-demo"]
