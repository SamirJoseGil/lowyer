import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "./db.server";
import { getContextForQuery } from "./legal-knowledge-advanced.server";

type AIModel = "gemini" | "openai" | "claude";

/**
 * Sistema multi-modelo para IA Legal
 * Soporta Gemini, OpenAI y Claude
 */

// ============= CONFIGURACIÓN =============

export async function getActiveAIConfig() {
  let config = await db.configuracionIA.findFirst();
  
  if (!config) {
    // Crear configuración por defecto
    config = await db.configuracionIA.create({
      data: {
        modeloActivo: "gemini",
        apiKeyGemini: process.env.GEMINI_API_KEY,
        temperaturaGlobal: 0.7,
        maxTokensRespuesta: 2048,
        ventanaContexto: 20
      }
    });
  }
  
  return config;
}

export async function updateAIConfig(data: {
  modeloActivo?: AIModel;
  apiKeyOpenAI?: string;
  apiKeyClaude?: string;
  apiKeyGemini?: string;
  temperaturaGlobal?: number;
  maxTokensRespuesta?: number;
  ventanaContexto?: number;
}) {
  let config = await db.configuracionIA.findFirst();
  
  if (!config) {
    config = await db.configuracionIA.create({ data: data as any });
  } else {
    config = await db.configuracionIA.update({
      where: { id: config.id },
      data
    });
  }
  
  console.log(`⚙️ AI config updated: Active model = ${config.modeloActivo}`);
  return config;
}

// ============= GENERACIÓN DE RESPUESTAS =============

export async function generateAIResponse(
  userQuery: string,
  conversationHistory: string[],
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{ success: boolean; response?: string; error?: string; model?: string }> {
  
  const config = await getActiveAIConfig();
  
  console.log(`🤖 Generating response with ${config.modeloActivo.toUpperCase()}`);
  
  // Obtener contexto legal relevante
  const legalContext = await getContextForQuery(userQuery);
  
  // Construir prompt con contexto
  const systemPrompt = buildLegalSystemPrompt(legalContext);
  
  // Generar respuesta según modelo activo
  switch (config.modeloActivo) {
    case "gemini":
      return generateGeminiResponse(
        userQuery,
        conversationHistory,
        systemPrompt,
        config
      );
    
    case "openai":
      return generateOpenAIResponse(
        userQuery,
        conversationHistory,
        systemPrompt,
        config
      );
    
    case "claude":
      return generateClaudeResponse(
        userQuery,
        conversationHistory,
        systemPrompt,
        config
      );
    
    default:
      return {
        success: false,
        error: `Modelo no soportado: ${config.modeloActivo}`
      };
  }
}

// ============= GEMINI =============

async function generateGeminiResponse(
  userQuery: string,
  history: string[],
  systemPrompt: string,
  config: any
): Promise<{ success: boolean; response?: string; error?: string; model: string }> {
  
  try {
    const apiKey = config.apiKeyGemini || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: "Gemini API key not configured",
        model: "gemini"
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: config.temperaturaGlobal,
        maxOutputTokens: config.maxTokensRespuesta
      }
    });

    const prompt = `${systemPrompt}\n\nHISTORIAL DE CONVERSACIÓN:\n${history.join('\n')}\n\nCONSULTA ACTUAL: ${userQuery}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return {
      success: true,
      response: response.trim(),
      model: "gemini"
    };
    
  } catch (error) {
    console.error(`❌ Gemini error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      model: "gemini"
    };
  }
}

// ============= OPENAI (Placeholder) =============

async function generateOpenAIResponse(
  userQuery: string,
  history: string[],
  systemPrompt: string,
  config: any
): Promise<{ success: boolean; response?: string; error?: string; model: string }> {
  
  // TODO: Implementar cuando se integre OpenAI
  console.log(`🔨 OpenAI integration pending...`);
  
  return {
    success: false,
    error: "OpenAI integration coming soon",
    model: "openai"
  };
}

// ============= CLAUDE (Placeholder) =============

async function generateClaudeResponse(
  userQuery: string,
  history: string[],
  systemPrompt: string,
  config: any
): Promise<{ success: boolean; response?: string; error?: string; model: string }> {
  
  // TODO: Implementar cuando se integre Claude
  console.log(`🔨 Claude integration pending...`);
  
  return {
    success: false,
    error: "Claude integration coming soon",
    model: "claude"
  };
}

// ============= PROMPT ENGINEERING =============

function buildLegalSystemPrompt(legalContext: string): string {
  return `Eres un asistente legal especializado en derecho colombiano.

INSTRUCCIONES IMPORTANTES:
1. Analiza el caso presentado usando tu conocimiento base de jurisprudencia colombiana
2. Cita normas relevantes usando el contexto proporcionado
3. NO inventes información jurídica - si no estás seguro, indícalo claramente
4. Proporciona referencias normativas específicas cuando sea posible
5. Explica conceptos legales de forma clara y accesible
6. Incluye SIEMPRE un disclaimer sobre asesoría legal formal

${legalContext}

FORMATO DE RESPUESTA:
1. Análisis del caso basado en jurisprudencia conocida
2. Normas aplicables (citando del contexto)
3. Conceptos jurídicos relevantes
4. Recomendación general
5. Disclaimer legal obligatorio

Recuerda: Tu rol es informar, no dar consejos legales específicos.`;
}
