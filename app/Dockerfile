FROM node:lts-slim

# LABEL authors="jeftomaz"
# ENTRYPOINT ["top", "-b"]

# curl para o HEALTHCHECK
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# substitui o npm install - install o package-lock.json sem variações
COPY package*.json ./
# pula depnedências de desenvolvimento - boa prática
RUN npm ci --omit=dev

COPY src/ ./src/

EXPOSE 3000

# fará o container aparecer healthy ou unhealthy para o DD
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]