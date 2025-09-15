import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { getChatMessages } from "~/lib/chat.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const user = await requireUser(request);
    const url = new URL(request.url);
    
    const sessionId = url.searchParams.get("sessionId");
    const after = url.searchParams.get("after"); // ID del último mensaje conocido
    
    if (!sessionId) {
      return json({ error: "Session ID requerido" }, { status: 400 });
    }

    // Obtener mensajes desde el último mensaje conocido
    const messages = await getChatMessages(sessionId, user.id);
    
    // Si hay un ID "after", filtrar solo mensajes nuevos
    let newMessages = messages;
    if (after) {
      const afterIndex = messages.findIndex(msg => msg.id === after);
      if (afterIndex !== -1) {
        newMessages = messages.slice(afterIndex + 1);
      }
    }

    return json(newMessages);

  } catch (error) {
    console.error("Error in chat messages API:", error);
    return json({ error: "Error interno del servidor" }, { status: 500 });
  }
};
