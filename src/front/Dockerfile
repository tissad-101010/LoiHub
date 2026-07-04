# Front LoiHub (Next 16) — build de production
FROM node:22-alpine

# Prisma a besoin d'openssl + compat libc sur Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# deps (prisma/ copié avant pour que le postinstall `prisma generate` réussisse)
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Réglages réseau tolérants : le build a déjà échoué sur des ECONNRESET
# transitoires -> on augmente retries et timeouts, et on garde le cache npm
# entre builds pour ne pas re-télécharger.
# NB: `npm install` (pas `npm ci`) car le lockfile est généré sur macos/arm64 et
# n'inclut pas les deps optionnelles natives de linux/alpine (@emnapi/*).
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 4 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 600000
RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund

# code + build
COPY . .
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
# Clé API Mistral (clé de TEST — assumée en clair dans l'image ECR).
# Pour une vraie clé de prod : utiliser plutôt les variables d'env du service App Runner.
ENV MISTRAL_API_KEY="h0BMRp6VI2TBclAGqfHOQGYIuiwiHoW5"
EXPOSE 3000
CMD ["npm", "run", "start"]
