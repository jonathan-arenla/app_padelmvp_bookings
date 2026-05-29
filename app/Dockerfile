FROM node:20-alpine

RUN apk add --no-cache git bash python3 make g++

WORKDIR /app

RUN npm config set fetch-retries 10 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 600000 && \
    npm config set maxsockets 3

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund 2>/dev/null || npm install --legacy-peer-deps --no-audit --no-fund

COPY . .

EXPOSE 8081 19000 19001 19002

ENV CI=1 \
    EXPO_NO_TELEMETRY=1 \
    REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

CMD ["npx", "expo", "start", "--web", "--port", "8081", "--host", "lan"]
