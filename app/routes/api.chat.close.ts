import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { closeChatSession } from "~/lib/chat.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const user = await requireUser(request);
    const formData = await request.formData();
    
    const sessionId = formData.get("sessionId")?.toString();
    const summary = formData.get("summary")?.toString();

    if (!sessionId) {
      return json({ 
        success: false, 
        error: "Session ID requerido" 
      }, { status: 400 });
    }

    const result = await closeChatSession(sessionId, user.id, summary);

    if (result.success) {
      return json({ 
        success: true, 
        message: "Sesión cerrada correctamente" 
      });
    } else {
      return json(result, { status: 400 });
    }

  } catch (error) {
    console.error("Error in chat close API:", error);
    return json({ 
      success: false, 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
};
