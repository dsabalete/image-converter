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

La aplicación estará disponible en: http://localhost:1234

### Opción 2: Usar Docker directamente

```bash
# Construir la imagen
docker build -t image-converter .

# Ejecutar el contenedor (puerto 1234 en host, 3000 en contenedor)
docker run -p 1234:3000 image-converter

# Ejecutar con nombre personalizado
docker run --name mi-conversor -p 1234:3000 image-converter
```

### Opciones de Docker

```bash
# Ejecutar en otro puerto (ej: 8080 en host, 3000 en contenedor)
docker run -p 8080:3000 image-converter

# Ejecutar con reinicio automático
docker run --restart unless-stopped -p 1234:3000 image-converter

# Ejecutar con volumen persistente
docker run -p 1234:3000 -v ./data:/app/data image-converter
```

### Actualizar la imagen

```bash
# Reconstruir y reiniciar
docker-compose down
docker-compose up -d --build
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

1. Abrir http://localhost:1234 en el navegador
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
├── build.sh               # Script de construcción
├── README.md              # Este archivo
├── src/
│   ├── pages/
│   │   ├── index.astro   # Página principal
│   │   └── api/          # Endpoints API
│   ├── components/       # Componentes
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

# ¡Listo! En http://localhost:1234
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

## ✅ Verificación de la imagen Docker

Una vez construida la imagen, puedes verificar que todo funciona correctamente:

```bash
# Verificar que la imagen se creó
docker images | grep image-converter

# Verificar que Sharp está instalado correctamente
docker run --rm image-converter node -e "require('sharp'); console.log('✓ Sharp loaded successfully')"

# Inspeccionar el contenido del build
docker run --rm image-converter ls -la /app/dist/server/

# Probar la API
docker run -d -p 1234:3000 --name testimg image-converter
sleep 2
curl http://localhost:1234/api/convert
```

### Comando de prueba rápido con archivo de test

```bash
# Crear una imagen de prueba
node -e "
const sharp = require('sharp');
const fs = require('fs');
sharp({
  create: { width: 100, height: 100, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 1 } }
}).png().toBuffer().then(b => fs.writeFileSync('test.png', b)).then(() => console.log('Test image created'));
"

# Convertir vía API
curl -X POST -F "image=@test.png" -F "format=webp" http://localhost:1234/api/convert

# Limpiar
rm test.png
docker stop testimg && docker rm testimg
```