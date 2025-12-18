import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { sendMessage } from "~/lib/chat.server";
import { enforceRateLimit } from "~/lib/security/rate-limiting.server";
import { validateMessageContent } from "~/lib/security/input-sanitizer.server";
import { moderateMessage } from "~/lib/security/moderation.server";
import { logAuditEvent } from "~/lib/security/audit-log.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  // Rate limiting
  await enforceRateLimit(request, "CHAT_MESSAGE");

  console.log(`📡 Chat send API called`);
  console.log(`📋 Request Content-Type: ${request.headers.get("content-type")}`);

  try {
    const user = await requireUser(request);
    
    // Intentar parsear como JSON primero
    let requestData;
    const contentType = request.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      console.log(`📝 Parsing request as JSON`);
      requestData = await request.json();
    } else if (contentType?.includes("multipart/form-data") || contentType?.includes("application/x-www-form-urlencoded")) {
      console.log(`📝 Parsing request as FormData`);
      const formData = await request.formData();
      requestData = {
        sessionId: formData.get("sessionId")?.toString(),
        content: formData.get("content")?.toString(),
        senderRole: formData.get("senderRole")?.toString()
      };
    } else {
      console.log(`❌ Unsupported Content-Type: ${contentType}`);
      return json({ 
        success: false, 
        error: "Content-Type no soportado" 
      }, { status: 400 });
    }
    
    const { sessionId, content, senderRole } = requestData;

    console.log(`📋 API Request - User: ${user.id}, Session: ${sessionId}, Role: ${senderRole}`);

    if (!sessionId || !content || !senderRole) {
      console.log(`❌ Missing required data in API request`);
      return json({ 
        success: false, 
        error: "Faltan datos requeridos" 
      }, { status: 400 });
    }

    // Sanitizar y validar contenido
    const validation = validateMessageContent(content);
    
    if (!validation.isValid) {
      console.warn(`⚠️ Message content validation failed: ${validation.violations.join(", ")}`);
    }
    
    // Usar contenido sanitizado
    const sanitizedContent = validation.sanitized;

    const result = await sendMessage(
      sessionId,
      user.id,
      sanitizedContent,
      senderRole as any
    );
    
    // Moderar mensaje si fue creado
    if (result.success && result.message) {
      await moderateMessage(result.message.id, sanitizedContent);
      
      // Log de auditoría
      await logAuditEvent(user.id, "chat.message", {
        sessionId,
        messageId: result.message.id,
        violations: validation.violations,
      });
    }

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
