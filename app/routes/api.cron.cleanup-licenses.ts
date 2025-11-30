import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { cleanupExpiredLicenses, getExpiringLicenses } from "~/lib/license-verification.server";

/**
 * Endpoint para cron job de limpieza de licencias
 * Llamar cada hora desde:
 * - Vercel Cron
 * - GitHub Actions
 * - EasyCron
 * - Cron-job.org
 */
export const action = async ({ request }: ActionFunctionArgs) => {
    // Verificar secret de seguridad
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        console.log(`❌ Unauthorized cron attempt`);
        return json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        console.log(`⏰ Starting scheduled license cleanup...`);
        
        // 1. Marcar licencias expiradas
        const cleanupResult = await cleanupExpiredLicenses();
        
        // 2. Obtener licencias próximas a expirar (para notificaciones futuras)
        const expiringSoon = await getExpiringLicenses();
        
        console.log(`📊 Cleanup stats:`, {
            marked: cleanupResult.marked,
            expiringSoon: expiringSoon.length,
            timestamp: new Date().toISOString()
        });
        
        return json({
            success: true,
            marked: cleanupResult.marked,
            expiringSoon: expiringSoon.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("💥 Error in cron job:", error);
        return json({ error: "Internal error" }, { status: 500 });
    }
};

export const loader = () => {
    return json({ message: "Use POST method" }, { status: 405 });
};
