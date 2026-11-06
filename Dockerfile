# Build stage - usando imagen completa de Node.js
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Instalar solo lo necesario
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias
COPY package*.json ./
RUN npm install --no-optional || npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Production stage
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Copiar archivos necesarios
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Exponer puerto
EXPOSE 3000

# Variable de entorno
ENV PORT=3000
ENV NODE_ENV=production

# Usar usuario no root
RUN adduser -D -u 1001 nodejs
USER nodejs

# Comando de inicio
CMD ["node", "dist/server/entry.mjs"]
