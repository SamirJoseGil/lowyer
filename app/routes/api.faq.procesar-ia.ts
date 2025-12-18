import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin, isAdmin } from "~/lib/permissions.server";
import { procesarFAQConIA, procesarFAQsPendientes, reprocesarFAQ } from "~/lib/faq/faq-ia.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);

  if (!isSuperAdmin(user) && !isAdmin(user)) {
    return json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const action = formData.get("action") as string;
  const faqId = formData.get("faqId") as string;

  try {
    switch (action) {
      case "procesar-una": {
        if (!faqId) {
          return json({ error: "ID de FAQ requerido" }, { status: 400 });
        }

        const resultado = await procesarFAQConIA(faqId);

        if (resultado.success) {
          return json({
            success: true,
            message: "FAQ procesada exitosamente",
            confianza: resultado.confianza,
          });
        } else {
          return json({
            success: false,
            error: resultado.error,
          }, { status: 500 });
        }
      }

      case "procesar-todas": {
        const resultado = await procesarFAQsPendientes();

        return json({
          success: true,
          message: `Procesadas ${resultado.exitosas}/${resultado.procesadas} FAQs`,
          ...resultado,
        });
      }

      case "reprocesar": {
        if (!faqId) {
          return json({ error: "ID de FAQ requerido" }, { status: 400 });
        }

        const resultado = await reprocesarFAQ(faqId);

        return json(resultado);
      }

      default:
        return json({ error: "Acción no válida" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error en API de procesamiento IA:", error);
    return json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
};
