import { db } from "./db.server";

/**
 * Marca licencias expiradas automáticamente
 * Debe ejecutarse periódicamente (cada hora o diariamente)
 */
export async function markExpiredLicenses(): Promise<{ marked: number }> {
    console.log(`🔍 Checking for expired licenses...`);
    
    const now = new Date();
    
    try {
        // Buscar licencias activas que deberían estar expiradas
        const expiredLicenses = await db.userLicense.updateMany({
            where: {
                status: "active",
                OR: [
                    // Expiradas por fecha
                    {
                        expiresAt: {
                            lte: now
                        }
                    },
                    // Expiradas por horas agotadas
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
        
        console.log(`✅ Marked ${expiredLicenses.count} expired licenses`);
        
        return { marked: expiredLicenses.count };
    } catch (error) {
        console.error(`❌ Error marking expired licenses:`, error);
        return { marked: 0 };
    }
}

/**
 * Obtiene licencias próximas a expirar (para notificaciones)
 */
export async function getExpiringLicenses(hoursThreshold: number = 1): Promise<any[]> {
    const now = new Date();
    const soon = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 horas
    
    return db.userLicense.findMany({
        where: {
            status: "active",
            OR: [
                // Por fecha
                {
                    expiresAt: {
                        gte: now,
                        lte: soon
                    }
                },
                // Por horas
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
