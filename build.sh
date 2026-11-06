#!/bin/bash
# Script para construir la imagen Docker con buildx

echo "Construyendo aplicación..."
npm run build

echo "Construyendo imagen Docker..."
docker build -t image-converter:latest .

echo "¡Listo! Imagen construida como 'image-converter:latest'"
echo "Ejecuta: docker run -p 3000:3000 image-converter"
