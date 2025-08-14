FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV NODE_ENV=production
# Install dependencies based on the lockfile if present for reproducibility
COPY package*.json ./
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --no-audit --no-fund
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
