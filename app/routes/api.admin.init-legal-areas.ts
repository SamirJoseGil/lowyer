import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { isAdmin } from "~/lib/permissions.server";
import { initializeLegalAreas } from "~/lib/legal-knowledge.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
      return json({ error: "No autorizado" }, { status: 403 });
    }

    console.log(`🏛️ Admin ${user.email} initializing legal areas...`);

    const result = await initializeLegalAreas();

    if (result.success) {
      return json({
        success: true,
        message: `Áreas legales inicializadas correctamente. Creadas: ${result.created}`,
        created: result.created
      });
    } else {
      return json({
        success: false,
        error: result.error || "Error al inicializar áreas legales"
      }, { status: 500 });
    }

  } catch (error) {
    console.error("💥 Error in init-legal-areas API:", error);
    return json({
      success: false,
      error: "Error interno del servidor"
    }, { status: 500 });
  }
};
