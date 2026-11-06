import { conversionStore } from '../../lib/storage';

export async function GET({ request }: { request: Request }) {
  // Obtener el ID de los query params
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID no proporcionado' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const conversion = conversionStore.get(id);
  
  if (!conversion) {
    return new Response(JSON.stringify({ error: 'Conversión no encontrada o expiró' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Determinar el content-type basado en el formato
  const contentTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'gif': 'image/gif',
    'tiff': 'image/tiff',
    'avif': 'image/avif'
  };

  const contentType = contentTypes[conversion.format] || 'application/octet-stream';

  return new Response(conversion.buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="converted.${conversion.format}"`,
      'Content-Length': conversion.size.toString()
    }
  });
}