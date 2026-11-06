// Almacenamiento en memoria para conversiones de imágenes
// En producción, considerar usar Redis, base de datos o sistema de archivos temporal

export interface ConversionData {
  buffer: Buffer;
  format: string;
  size: number;
  timestamp: number;
}

// Mapa para almacenar las conversiones
export const conversionStore = new Map<string, ConversionData>();

// TTL en milisegundos (10 minutos)
const TTL = 10 * 60 * 1000;

// Limpieza automática de conversiones expiradas
setInterval(() => {
  const now = Date.now();
  conversionStore.forEach((data, key) => {
    if (now - data.timestamp > TTL) {
      conversionStore.delete(key);
    }
  });
}, 60 * 1000); // Limpiar cada minuto