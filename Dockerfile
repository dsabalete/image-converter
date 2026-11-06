# ============ BUILD STAGE ============
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias de build necesarias para sharp
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Copiar package.json
COPY package*.json ./

# Instalar todas las dependencias (incluidas opcionales)
RUN npm install --include=optional

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Limpiar dependencias de desarrollo
RUN npm prune --production

# ============ PRODUCTION STAGE ============
FROM node:22-alpine AS runtime

WORKDIR /app

# Copiar solo los archivos necesarios desde el build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Crear usuario no root por seguridad
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
USER nextjs

# Exponer puerto 1234
EXPOSE 1234

# Variables de entorno
ENV HOST=0.0.0.0
ENV PORT=1234
ENV NODE_ENV=production

# Iniciar el servidor
CMD ["node", "dist/server/entry.mjs"]
