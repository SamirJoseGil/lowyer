import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin } from "~/lib/permissions.server";
import { generateAIResponse, updateAIConfig } from "~/lib/ai-models.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  if (!isSuperAdmin(user)) {
    return json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    console.log(`🧪 Starting OpenAI test...`);

    // Cambiar temporalmente a OpenAI
    await updateAIConfig({ modeloActivo: "openai" });
    console.log(`✅ Switched to OpenAI model`);

    // Hacer consulta de prueba
    const testQuery = "¿Qué es el derecho civil en Colombia? Dame una explicación breve.";
    console.log(`📝 Test query: ${testQuery}`);

    const result = await generateAIResponse(
      testQuery,
      [],
      { temperature: 0.7, maxTokens: 500 }
    );

    console.log(`📊 Test result:`, {
      success: result.success,
      model: result.model,
      hasResponse: !!result.response,
      responseLength: result.response?.length || 0,
      error: result.error
    });

    return json({
      success: result.success,
      model: result.model,
      response: result.response?.substring(0, 500) + (result.response && result.response.length > 500 ? "..." : ""),
      fullResponseLength: result.response?.length || 0,
      error: result.error,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("💥 Test error:", error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
};
