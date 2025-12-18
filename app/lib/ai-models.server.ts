import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
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
      model: "gemini-2.5-flash",
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

// ============= OPENAI INITIALIZATION =============

let openaiClient: OpenAI | null = null;

function getOpenAIClient(apiKey: string): OpenAI {
  if (!openaiClient || openaiClient.apiKey !== apiKey) {
    openaiClient = new OpenAI({
      apiKey: apiKey
    });
    console.log(`✅ OpenAI client initialized successfully`);
  }
  return openaiClient;
}

// ============= OPENAI =============

async function generateOpenAIResponse(
  userQuery: string,
  history: string[],
  systemPrompt: string,
  config: any
): Promise<{ success: boolean; response?: string; error?: string; model: string }> {
  
  try {
    const apiKey = config.apiKeyOpenAI || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.log(`❌ OpenAI API key not configured`);
      return {
        success: false,
        error: "OpenAI API key not configured",
        model: "openai"
      };
    }

    console.log(`🔑 OpenAI API key configured: ${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`);

    const client = getOpenAIClient(apiKey);

    // Construir mensajes para OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Agregar historial de conversación
    if (history.length > 0) {
      console.log(`📚 Adding ${history.length} messages from history`);
      
      for (const msg of history) {
        if (msg.startsWith("Usuario:")) {
          messages.push({
            role: "user",
            content: msg.replace("Usuario: ", "")
          });
        } else if (msg.startsWith("Asistente Legal:")) {
          messages.push({
            role: "assistant",
            content: msg.replace("Asistente Legal: ", "")
          });
        }
      }
    }

    // Agregar consulta actual
    messages.push({
      role: "user",
      content: userQuery
    });

    console.log(`📤 Sending request to OpenAI with ${messages.length} messages`);
    console.log(`⚙️ Config: temp=${config.temperaturaGlobal}, max_tokens=${config.maxTokensRespuesta}`);

    // Generar respuesta
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // Modelo económico y eficiente
      messages: messages,
      temperature: Number(config.temperaturaGlobal) || 0.7,
      max_tokens: config.maxTokensRespuesta || 2048,
      top_p: 0.95,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    });

    console.log(`📨 OpenAI response received successfully`);
    console.log(`💰 Usage - Total tokens: ${completion.usage?.total_tokens || 0}`);
    console.log(`   - Prompt tokens: ${completion.usage?.prompt_tokens || 0}`);
    console.log(`   - Completion tokens: ${completion.usage?.completion_tokens || 0}`);

    const response = completion.choices[0]?.message?.content;

    if (!response || response.trim().length === 0) {
      console.log(`❌ OpenAI returned empty response`);
      return {
        success: false,
        error: "OpenAI returned empty response",
        model: "openai"
      };
    }

    console.log(`✅ OpenAI response generated successfully (${response.length} chars)`);

    return {
      success: true,
      response: response.trim(),
      model: "openai"
    };
    
  } catch (error) {
    console.error(`❌ OpenAI error:`, error);
    
    if (error instanceof OpenAI.APIError) {
      console.error(`❌ OpenAI API Error Details:`, {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type
      });

      // Errores específicos de OpenAI
      if (error.status === 401) {
        return {
          success: false,
          error: "OpenAI API key is invalid",
          model: "openai"
        };
      }

      if (error.status === 429) {
        return {
          success: false,
          error: "OpenAI rate limit exceeded. Please try again later.",
          model: "openai"
        };
      }

      if (error.status === 500) {
        return {
          success: false,
          error: "OpenAI service is temporarily unavailable",
          model: "openai"
        };
      }

      if (error.status === 503) {
        return {
          success: false,
          error: "OpenAI is experiencing high load. Please try again.",
          model: "openai"
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown OpenAI error",
      model: "openai"
    };
  }
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
