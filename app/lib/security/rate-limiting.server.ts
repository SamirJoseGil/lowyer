import { LRUCache } from "lru-cache";

type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
};

// Cache en memoria (para desarrollo)
// TODO: Migrar a Redis en producción
const rateLimitCache = new LRUCache<string, number[]>({
  max: 10000,
  ttl: 60 * 60 * 1000, // 1 hora
});

export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 10, windowMs: 60000 }
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  
  const now = Date.now();
  const windowStart = now - options.windowMs;
  
  // Obtener timestamps de requests previos
  const timestamps = rateLimitCache.get(identifier) || [];
  
  // Filtrar solo los requests dentro de la ventana
  const recentRequests = timestamps.filter(ts => ts > windowStart);
  
  // Verificar si excede el límite
  const allowed = recentRequests.length < options.maxRequests;
  
  if (allowed) {
    // Agregar timestamp actual
    recentRequests.push(now);
    rateLimitCache.set(identifier, recentRequests);
  }
  
  const resetAt = new Date(now + options.windowMs);
  const remaining = Math.max(0, options.maxRequests - recentRequests.length);
  
  console.log(`🔒 Rate limit check: ${identifier} - Allowed: ${allowed}, Remaining: ${remaining}`);
  
  return { allowed, remaining, resetAt };
}

export function getRateLimitKey(request: Request, type: string): string {
  // Combinar IP + User ID + tipo de acción
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "unknown";
  
  return `${type}:${ip}`;
}

// Rate limits específicos por acción
export const RATE_LIMITS = {
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 intentos por 15 min
  SIGNUP: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 registros por hora
  CHAT_MESSAGE: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 mensajes por minuto
  AI_QUERY: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 consultas IA por minuto
  API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests por minuto
} as const;

export async function enforceRateLimit(
  request: Request,
  limitType: keyof typeof RATE_LIMITS
): Promise<void> {
  const key = getRateLimitKey(request, limitType);
  const limit = RATE_LIMITS[limitType];
  
  const { allowed, remaining, resetAt } = await checkRateLimit(key, limit);
  
  if (!allowed) {
    console.warn(`⚠️ Rate limit exceeded for ${key}`);
    
    throw new Response(
      JSON.stringify({
        error: "Demasiadas solicitudes. Por favor, intenta más tarde.",
        retryAfter: resetAt.toISOString(),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": limit.maxRequests.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": resetAt.toISOString(),
        },
      }
    );
  }
}
