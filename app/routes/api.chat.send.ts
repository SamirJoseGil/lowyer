import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { sendMessage } from "~/lib/chat.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  console.log(`📡 Chat send API called`);

  try {
    const user = await requireUser(request);
    const formData = await request.formData();
    
    const sessionId = formData.get("sessionId")?.toString();
    const content = formData.get("content")?.toString();
    const senderRole = formData.get("senderRole")?.toString();

    console.log(`📋 API Request - User: ${user.id}, Session: ${sessionId}, Role: ${senderRole}`);

    if (!sessionId || !content || !senderRole) {
      console.log(`❌ Missing required data in API request`);
      return json({ 
        success: false, 
        error: "Faltan datos requeridos" 
      }, { status: 400 });
    }

    const result = await sendMessage(
      sessionId,
      user.id,
      content,
      senderRole as any
    );

    console.log(`📤 Send message result:`, { 
      success: result.success, 
      hasMessage: !!result.message,
      hasAiResponse: !!result.aiResponse,
      error: result.error 
    });

    return json(result);

  } catch (error) {
    console.error("💥 Error in chat send API:", error);
    return json({ 
      success: false, 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
};
