/**
 * Sistema de verificación de licencias en múltiples capas
 * Combina verificación en tiempo real con limpieza periódica
 */

import { db } from "./db.server";

/**
 * CAPA 1: Verificación en tiempo real (cada request)
 * Esta es la más importante - siempre verifica antes de dar acceso
 */
export async function isLicenseValid(userId: string): Promise<boolean> {
    const now = new Date();
    
    const activeLicense = await db.userLicense.findFirst({
        where: {
            userId,
            status: "active",
            hoursRemaining: { gt: 0 },
            OR: [
                { expiresAt: null }, // Licencias infinitas
                { expiresAt: { gte: now } }
            ]
        }
    });
    
    return !!activeLicense;
}

/**
 * CAPA 2: Limpieza periódica (cron job cada hora)
 * Mantiene la BD limpia y consistente
 */
export async function cleanupExpiredLicenses(): Promise<{ marked: number }> {
    console.log(`🧹 Running license cleanup...`);
    
    const now = new Date();
    
    try {
        // Actualización en una sola query (muy eficiente)
        const result = await db.userLicense.updateMany({
            where: {
                status: "active",
                OR: [
                    // Expiradas por fecha
                    {
                        expiresAt: {
                            lte: now
                        }
                    },
                    // Expiradas por horas
                    {
                        hoursRemaining: {
                            lte: 0
                        }
                    }
                ]
            },
            data: {
                status: "expired"
            }
        });
        
        console.log(`✅ Marked ${result.count} expired licenses`);
        
        return { marked: result.count };
    } catch (error) {
        console.error(`❌ Error in cleanup:`, error);
        return { marked: 0 };
    }
}

/**
 * CAPA 3: Verificación preventiva (opcional)
 * Notifica a usuarios antes de que expire
 */
export async function getExpiringLicenses(hoursThreshold: number = 1): Promise<any[]> {
    const now = new Date();
    const soon = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 horas
    
    return db.userLicense.findMany({
        where: {
            status: "active",
            OR: [
                // Por fecha (próximas 24h)
                {
                    expiresAt: {
                        gte: now,
                        lte: soon
                    }
                },
                // Por horas (menos de 1h restante)
                {
                    hoursRemaining: {
                        lte: hoursThreshold,
                        gt: 0
                    }
                }
            ]
        },
        include: {
            user: {
                include: {
                    profile: true
                }
            },
            license: true
        }
    });
}
