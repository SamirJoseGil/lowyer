import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { createChatSession } from "~/lib/chat.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const user = await requireUser(request);
    const formData = await request.formData();
    
    const chatType = formData.get("chatType")?.toString() as "ia" | "lawyer";

    if (!chatType || !["ia", "lawyer"].includes(chatType)) {
      return json({ 
        success: false, 
        error: "Tipo de chat inválido" 
      }, { status: 400 });
    }

    const result = await createChatSession(user.id, chatType);

    return json(result);

  } catch (error) {
    console.error("Error in session create API:", error);
    return json({ 
      success: false, 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
};
