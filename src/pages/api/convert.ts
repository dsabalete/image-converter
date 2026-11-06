import { conversionStore, ConversionData } from '../../lib/storage';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

// Tamaño máximo de archivo: 20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Formatos soportados por Sharp
const SUPPORTED_FORMATS = new Set([
  'png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'tiff', 'avif'
]);

// Extensiones de imagen soportadas
const IMAGE_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'tiff', 'tif', 'avif'
]);

// GET para obtener información de formatos soportados
export async function GET() {
  return new Response(JSON.stringify({ 
    supportedFormats: Array.from(SUPPORTED_FORMATS),
    maxFileSize: MAX_FILE_SIZE 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// POST para convertir la imagen
export async function POST({ request }: { request: Request }) {
  try {
    // Parsear el formulario multipart
    const formData = await request.formData();
    const image = formData.get('image');
    const format = formData.get('format') as string;

    // Validaciones
    if (!image) {
      return new Response(JSON.stringify({ error: 'No se proporcionó ninguna imagen' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!format || !SUPPORTED_FORMATS.has(format.toLowerCase())) {
      return new Response(JSON.stringify({ 
        error: `Formato no soportado. Formatos válidos: ${Array.from(SUPPORTED_FORMATS).join(', ')}` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (image.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ 
        error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / (1024*1024)}MB` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar que sea una imagen
    const extension = image.name.split('.').pop()?.toLowerCase();
    if (!extension || !IMAGE_EXTENSIONS.has(extension)) {
      return new Response(JSON.stringify({ 
        error: 'El archivo no es una imagen válida' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Leer el contenido del archivo
    const arrayBuffer = await image.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    console.log('Input image size:', inputBuffer.length);
    console.log('Input header:', inputBuffer.slice(0, 4).toString('hex'));

    // Normalizar el nombre del formato
    let targetFormat = format.toLowerCase();
    if (targetFormat === 'jpeg') targetFormat = 'jpeg';

    // Obtener metadata con Sharp
    const metadata = await sharp(inputBuffer).metadata();
    console.log('Metadata:', metadata.format, metadata.width, 'x', metadata.height);

    // Calidad por defecto
    let quality = 90;

    // Realizar la conversión
    const transformer = sharp(inputBuffer);
    
    // Aplicar conversión según el formato usando métodos de cadena
    let outputBuffer: Buffer;
    
    switch (targetFormat as keyof typeof sharp.outputFormats) {
      case 'jpeg':
        outputBuffer = await transformer.jpeg({ quality: 85 }).toBuffer();
        break;
      case 'png':
        outputBuffer = await sharp(inputBuffer).png({ quality: 85 }).toBuffer();
        break;
      case 'webp':
        outputBuffer = await sharp(inputBuffer).webp({ quality: 85 }).toBuffer();
        break;
      case 'bmp':
        outputBuffer = await sharp(inputBuffer).bmp().toBuffer();
        break;
      case 'tiff':
        outputBuffer = await sharp(inputBuffer).tiff().toBuffer();
        break;
      case 'gif':
        // GIF no se puede convertir bien con Sharp, usar PNG
        outputBuffer = await sharp(inputBuffer).png({ quality: 85 }).toBuffer();
        targetFormat = 'png'; // Cambiar el formato de salida
        break;
      case 'avif':
        outputBuffer = await sharp(inputBuffer).avif({ quality: 85 }).toBuffer();
        break;
      default:
        outputBuffer = await sharp(inputBuffer).png({ quality: 85 }).toBuffer();
    }

    console.log('Output buffer size:', outputBuffer.length);
    console.log('Output header:', outputBuffer.slice(0, 4).toString('hex'));

    // Generar un ID único para el archivo
    const conversionId = randomUUID();
    
    // Guardar en el almacenamiento
    const conversionData: ConversionData = {
      buffer: outputBuffer,
      format: targetFormat,
      size: outputBuffer.length,
      timestamp: Date.now()
    };
    conversionStore.set(conversionId, conversionData);

    // URLs para descarga y preview (usando query params)
    const downloadUrl = `/api/download?id=${conversionId}`;
    const previewUrl = `/api/preview?id=${conversionId}`;

    return new Response(JSON.stringify({
      success: true,
      conversionId,
      downloadUrl,
      previewUrl,
      originalFormat: metadata.format,
      targetFormat,
      outputSize: outputBuffer.length,
      width: metadata.width,
      height: metadata.height,
      originalName: image.name
    }), {
      headers: { 
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error en conversión:', error);
    return new Response(JSON.stringify({ 
      error: 'Error interno del servidor al procesar la imagen: ' + String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}