import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/lib/db.server";

/**
 * Endpoint de testing para marcar licencias expiradas manualmente
 * Solo para desarrollo local
 * 
 * Llamar desde: http://localhost:5173/api/test/expire-licenses
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === "production") {
        return json({ error: "Not available in production" }, { status: 403 });
    }

    console.log(`🧪 [TEST] Starting manual license expiration check...`);
    
    const now = new Date();
    
    try {
        // Buscar licencias que deberían estar expiradas
        const expiredByDate = await db.userLicense.findMany({
            where: {
                status: "active",
                expiresAt: {
                    lte: now
                }
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

        const expiredByHours = await db.userLicense.findMany({
            where: {
                status: "active",
                hoursRemaining: {
                    lte: 0
                }
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

        console.log(`📊 [TEST] Found ${expiredByDate.length} licenses expired by date`);
        console.log(`📊 [TEST] Found ${expiredByHours.length} licenses expired by hours`);

        // Marcar como expiradas
        const updateResult = await db.userLicense.updateMany({
            where: {
                status: "active",
                OR: [
                    {
                        expiresAt: {
                            lte: now
                        }
                    },
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

        console.log(`✅ [TEST] Marked ${updateResult.count} licenses as expired`);

        // Obtener todas las licencias para mostrar estado
        const allLicenses = await db.userLicense.findMany({
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                license: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const summary = {
            total: allLicenses.length,
            active: allLicenses.filter(l => l.status === 'active').length,
            expired: allLicenses.filter(l => l.status === 'expired').length,
            trial: allLicenses.filter(l => l.status === 'trial').length
        };

        console.log(`📊 [TEST] License Summary:`, summary);

        return json({
            success: true,
            marked: updateResult.count,
            expiredByDate: expiredByDate.length,
            expiredByHours: expiredByHours.length,
            summary,
            licenses: allLicenses.map(l => ({
                id: l.id,
                user: l.user.email,
                licenseName: l.license.name,
                status: l.status,
                hoursRemaining: Number(l.hoursRemaining),
                expiresAt: l.expiresAt,
                isExpired: l.status === 'expired'
            })),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`💥 [TEST] Error marking expired licenses:`, error);
        return json({ 
            error: "Internal error", 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
};
