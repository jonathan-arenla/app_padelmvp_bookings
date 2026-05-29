FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

RUN npm config set fetch-retries 10 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 600000 && \
    npm config set maxsockets 3

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

EXPOSE 4001

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run seed && npm run dev"]
