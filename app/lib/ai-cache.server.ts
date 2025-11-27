import { db } from "./db.server";
import crypto from "crypto";

export interface CacheOptions {
  expirationHours?: number;
  minSimilarity?: number;
}

const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  expirationHours: 24 * 7, // 7 días
  minSimilarity: 0.8
};

export function generateQueryHash(query: string): string {
  // Normalizar la consulta antes de hacer hash
  const normalized = query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .replace(/[^\w\s]/g, ''); // Remover puntuación
  
  return crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex');
}

export async function getCachedResponse(
  query: string, 
  options: CacheOptions = DEFAULT_CACHE_OPTIONS
): Promise<{ response: string; fromCache: boolean; legalArea?: string } | null> {
  
  console.log(`🔍 Checking cache for query: "${query.substring(0, 50)}..."`);
  
  try {
    const queryHash = generateQueryHash(query);
    
    // Buscar respuesta exacta en cache
    const cached = await db.aiResponseCache.findUnique({
      where: { queryHash },
      include: { legalArea: true }
    });
    
    if (cached) {
      // Verificar si no ha expirado
      if (cached.expiresAt && cached.expiresAt < new Date()) {
        console.log(`⌛ Cache entry expired, removing...`);
        await db.aiResponseCache.delete({ where: { id: cached.id } });
        return null;
      }
      
      // Actualizar estadísticas de uso
      await db.aiResponseCache.update({
        where: { id: cached.id },
        data: {
          hitCount: { increment: 1 },
          lastUsed: new Date()
        }
      });
      
      console.log(`✅ Cache hit! Hit count: ${cached.hitCount + 1}`);
      return {
        response: cached.response,
        fromCache: true,
        legalArea: cached.legalArea?.name
      };
    }
    
    console.log(`❌ Cache miss for query hash: ${queryHash.substring(0, 8)}...`);
    return null;
    
  } catch (error) {
    console.error("💥 Error checking cache:", error);
    return null;
  }
}

export async function cacheResponse(
  query: string,
  response: string,
  legalAreaName?: string,
  options: CacheOptions = DEFAULT_CACHE_OPTIONS
): Promise<{ success: boolean; error?: string }> {
  
  console.log(`💾 Caching response for query: "${query.substring(0, 50)}..."`);
  
  try {
    const queryHash = generateQueryHash(query);
    
    // Buscar el área legal si se proporcionó
    let legalAreaId: string | undefined;
    if (legalAreaName) {
      const legalArea = await db.legalArea.findUnique({
        where: { name: legalAreaName }
      });
      legalAreaId = legalArea?.id;
    }
    
    // Calcular fecha de expiración
    const expiresAt = options.expirationHours 
      ? new Date(Date.now() + options.expirationHours * 60 * 60 * 1000)
      : null;
    
    // Guardar en cache (upsert para evitar duplicados)
    await db.aiResponseCache.upsert({
      where: { queryHash },
      update: {
        response,
        legalAreaId,
        hitCount: 1,
        lastUsed: new Date(),
        expiresAt
      },
      create: {
        queryHash,
        query,
        response,
        legalAreaId,
        expiresAt
      }
    });
    
    console.log(`✅ Response cached successfully`);
    return { success: true };
    
  } catch (error) {
    console.error("💥 Error caching response:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function logConsultation(
  userId: string,
  query: string,
  response: string,
  options: {
    legalAreaName?: string;
    sessionId?: string;
    responseTime?: number;
    aiModel?: string;
  } = {}
): Promise<{ success: boolean; error?: string }> {
  
  console.log(`📝 Logging consultation for user: ${userId}`);
  
  try {
    // Buscar el área legal si se proporcionó
    let legalAreaId: string | undefined;
    if (options.legalAreaName) {
      const legalArea = await db.legalArea.findUnique({
        where: { name: options.legalAreaName }
      });
      legalAreaId = legalArea?.id;
    }
    
    await db.legalConsultation.create({
      data: {
        userId,
        query,
        response,
        legalAreaId,
        sessionId: options.sessionId,
        responseTime: options.responseTime,
        aiModel: options.aiModel || 'gemini'
      }
    });
    
    console.log(`✅ Consultation logged successfully`);
    return { success: true };
    
  } catch (error) {
    console.error("💥 Error logging consultation:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function cleanExpiredCache(): Promise<{ success: boolean; cleaned: number; error?: string }> {
  console.log(`🧹 Cleaning expired cache entries...`);
  
  try {
    const result = await db.aiResponseCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    
    console.log(`✅ Cleaned ${result.count} expired cache entries`);
    return { success: true, cleaned: result.count };
    
  } catch (error) {
    console.error("💥 Error cleaning cache:", error);
    return { 
      success: false, 
      cleaned: 0,
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export async function getCacheStats() {
  try {
    const [totalEntries, hitStats, areaStats] = await Promise.all([
      db.aiResponseCache.count(),
      db.aiResponseCache.aggregate({
        _sum: { hitCount: true },
        _avg: { hitCount: true }
      }),
      db.aiResponseCache.groupBy({
        by: ['legalAreaId'],
        _count: true,
        _sum: { hitCount: true }
      })
    ]);
    
    return {
      totalEntries,
      totalHits: hitStats._sum.hitCount || 0,
      averageHits: Math.round(hitStats._avg.hitCount || 0),
      areaDistribution: areaStats
    };
    
  } catch (error) {
    console.error("💥 Error getting cache stats:", error);
    return null;
  }
}
