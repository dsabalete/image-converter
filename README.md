# Convertidor de Imágenes

Una web sencilla para subir imágenes y convertirlas entre diferentes formatos.

## 🚀 Características

- Subida de archivos de imagen
- Conversión entre formatos de imágenes
- Vista previa de la imagen convertida
- Descarga directa del archivo convertido
- **Containerizada con Docker**

## 🛠️ Tecnologías

- **Frontend**: Astro 7.x con islands architecture
- **Backend**: Astro Server API + Node.js adapter
- **Conversión de imágenes**: Sharp
- **UI**: HTML/CSS con transiciones suaves

## 📦 Instalación local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar la build
npm run preview
```

## 🐳 Docker - Uso y despliegue

### Opción 1: Usar Docker Compose (recomendado)

```bash
# Construir y ejecutar
docker-compose up --build

# O en segundo plano
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

La aplicación estará disponible en: http://localhost:3000

### Opción 2: Usar Docker directamente

```bash
# Construir la imagen
docker build -t image-converter .

# Ejecutar el contenedor
docker run -p 3000:3000 image-converter

# Ejecutar con nombre personalizado
docker run --name mi-conversor -p 3000:3000 image-converter
```

### Opciones de Docker

```bash
# Construir con más recursos (más rápido)
DOCKER_BUILDKIT=1 docker build -t image-converter .

# Ejecutar en otro puerto
docker run -p 8080:3000 image-converter

# Ejecutar con reinicio automático
docker run --restart unless-stopped -p 3000:3000 image-converter

# Ejecutar con volumen persistente (para logs/caché)
docker run -p 3000:3000 -v ./data:/app/data image-converter
```

### Actualizar la imagen

```bash
# Reconstruir y reiniciar
docker-compose down
docker-compose up --build -d
```

## 🔌 API Endpoints

### GET /api/convert
Retorna información sobre los formatos soportados.

### POST /api/convert
Convierte una imagen a un formato especificado.

**Parámetros:**
- `image`: Archivo de imagen (PNG, JPG, WebP, BMP, GIF, TIFF, AVIF)
- `format`: Formato de salida

**Respuesta:**
```json
{
  "success": true,
  "conversionId": "uuid",
  "downloadUrl": "/api/download?id=uuid",
  "previewUrl": "/api/preview?id=uuid",
  "originalFormat": "png",
  "targetFormat": "webp",
  "outputSize": 108,
  "width": 100,
  "height": 100,
  "originalName": "imagen.png"
}
```

### GET /api/download?id=<conversionId>
Descarga la imagen convertida.

### GET /api/preview?id=<conversionId>
Obtiene una vista previa de la imagen convertida.

## 📁 Formatos Soportados

| Formato de entrada | Formatos de salida |
|-------------------|-------------------|
| PNG, JPG, WebP, BMP, GIF, TIFF, AVIF | PNG, JPG, WebP, BMP |

### Detalles por formato:
- **PNG**: Conserva transparencia y calidad
- **JPG** (JPEG): Compresión con pérdida, ideal para fotos
- **WebP**: Formato moderno con excelente compresión
- **BMP**: Formato sin compresión
- **GIF**: Se convierte a PNG
- **TIFF/AVIF**: Formatos especializados

## 🖥️ Uso web

1. Abrir http://localhost:3000 (o el puerto configurado) en el navegador
2. Hacer clic en "📁 Seleccionar imagen"
3. Elegir una imagen desde el equipo
4. Seleccionar el formato de salida deseado
5. Hacer clic en "🚀 Convertir Imagen"
6. Descargar o visualizar la imagen convertida

## 📄 Archivos incluidos

```
image-converter/
├── Dockerfile              # Imagen Docker
├── docker-compose.yml      # Orquestación Docker Compose
├── .dockerignore          # Archivos a ignorar en Docker
├── README.md              # Este archivo
├── src/
│   ├── pages/
│   │   ├── index.astro   # Página principal
│   │   └── api/          # Endpoints API
│   ├── components/       # Componentes Reactiva
│   └── lib/              # Librerías auxiliares
├── astro.config.mjs       # Configuración Astro
├── package.json           # Dependencias
└── dist/                # Build de producción (generado)
```

## 📥 Descarga rápida

Para usuarios que solo quieren descargar y ejecutar:

```bash
# Clonar el repositorio
git clone <repo-url>
cd image-converter

# Ejecutar con Docker
docker-compose up -d --build

# ¡Listo! En http://localhost:3000
```

## 🚀 Despliegue en producción

### En servidor local con systemd (Linux)

```bash
# Crear servicio systemd
sudo nano /etc/systemd/system/image-converter.service
```

```ini
[Unit]
Description=Image Converter Web App
After=network.target

[Service]
Type=simple
User=docker
WorkingDirectory=/app/image-converter
ExecStart=/usr/bin/docker-compose up
Restart=unless-stopped
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar y arrancar
sudo systemctl daemon-reload
sudo systemctl enable image-converter
sudo systemctl start image-converter
```

### En otros servidores

- **Vercel**: `vercel` (requiere ajustes de configuración)
- **Netlify**: Subir carpeta `dist/` como sitio estático con functions
- **Cloudflare**: Usar Worker o Page Functions
- **AWS**: EC2 o ECS con la imagen Docker
- **DigitalOcean**: Droplet con Docker instalado