# Usar imagen LTS de Node.js
FROM node:22-alpine

WORKDIR /app

# Copiar package.json primero
COPY package*.json ./

# Instalar dependencias
RUN npm install --include=optional

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Limpiar dependencias de desarrollo
RUN npm prune --production

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Iniciar el servidor
CMD ["sh", "-c", "PORT=$PORT HOST=$HOST node dist/server/entry.mjs"]
