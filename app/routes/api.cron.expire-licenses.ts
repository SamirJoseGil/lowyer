import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { markExpiredLicenses } from "~/lib/licenses-scheduler.server";

/**
 * Endpoint para cron job que marca licencias expiradas
 * Llamar cada hora o diariamente desde un servicio de cron
 */
export const action = async ({ request }: ActionFunctionArgs) => {
    // Verificar cron secret para seguridad
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        const result = await markExpiredLicenses();
        
        return json({
            success: true,
            marked: result.marked,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error in cron job:", error);
        return json({ error: "Internal error" }, { status: 500 });
    }
};

export const loader = () => {
    return json({ message: "Use POST method" }, { status: 405 });
};
