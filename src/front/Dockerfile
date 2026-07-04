# Front LoiHub (Next 16) — build de production
FROM node:22-alpine

# Prisma a besoin d'openssl + compat libc sur Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# deps (prisma/ copié avant pour que le postinstall `prisma generate` réussisse)
COPY package.json ./
COPY prisma ./prisma
RUN npm install --no-audit --no-fund

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
