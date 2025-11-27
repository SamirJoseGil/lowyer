import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { identifyLegalArea, getLegalContext } from "./legal-knowledge.server";
import { getCachedResponse, cacheResponse, logConsultation } from "./ai-cache.server";

// Validar y configurar la API key de forma más robusta
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

console.log(`🔑 Gemini API Key status: ${GEMINI_API_KEY ? `Present (${GEMINI_API_KEY.substring(0, 8)}...${GEMINI_API_KEY.slice(-4)})` : 'MISSING'}`);
console.log(`🔑 Raw env value length: ${process.env.GEMINI_API_KEY?.length || 0}`);
console.log(`🔑 Cleaned value length: ${GEMINI_API_KEY?.length || 0}`);

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

if (!GEMINI_API_KEY.startsWith('AIza')) {
  console.warn(`⚠️ Gemini API key format seems incorrect. Expected to start with 'AIza', got: ${GEMINI_API_KEY.substring(0, 8)}...`);
}

// Configurar Gemini con validación adicional
let genAI: GoogleGenerativeAI;
try {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log(`✅ GoogleGenerativeAI client initialized successfully`);
} catch (error) {
  console.error(`💥 Failed to initialize GoogleGenerativeAI:`, error);
  throw error;
}

// Modelos disponibles actualizados (basado en la documentación)
const AVAILABLE_MODELS = {
  FLASH_2_5: "gemini-2.5-flash",
  FLASH_LITE_2_5: "gemini-2.5-flash-lite", 
  PRO_2_5: "gemini-2.5-pro"
} as const;

// Usar el modelo más eficiente para chat (Flash es más rápido y económico)
const DEFAULT_MODEL = AVAILABLE_MODELS.FLASH_2_5;

// Prompt especializado para contexto legal colombiano
const LEGAL_SYSTEM_PROMPT = `
Eres un asistente legal especializado en derecho colombiano. Tu objetivo es proporcionar información legal precisa y útil a usuarios que buscan orientación jurídica.

INSTRUCCIONES IMPORTANTES:
1. Siempre aclarar que tu respuesta NO constituye asesoría legal formal
2. Recomendar consultar con un abogado para casos específicos
3. Enfocarte en derecho colombiano y sus leyes vigentes
4. Usar lenguaje claro y accesible para personas sin formación jurídica
5. Proporcionar información sobre procesos, derechos y obligaciones
6. Incluir referencias a códigos y leyes cuando sea relevante

ÁREAS DE ESPECIALIZACIÓN:
- Derecho Civil y Comercial
- Derecho Laboral
- Derecho Penal
- Derecho de Familia
- Derecho Administrativo
- Procedimientos judiciales colombianos

LIMITACIONES:
- No dar consejos específicos sobre casos en curso
- No interpretar documentos legales complejos
- No predecir resultados de procesos judiciales
- Siempre recomendar asesoría profesional para casos complejos

Responde de manera profesional, empática y educativa.
`;

export async function getGeminiResponse(
  userMessage: string, 
  conversationHistory: string[] = [],
  options: {
    userId?: string;
    sessionId?: string;
    useCache?: boolean;
  } = {}
): Promise<{ success: boolean; response?: string; error?: string; fromCache?: boolean; legalArea?: string }> {
  
  console.log(`🤖 Gemini API called with message: "${userMessage.substring(0, 100)}..."`);
  console.log(`📚 Conversation history length: ${conversationHistory.length}`);
  console.log(`⚙️ Options:`, options);
  
  const startTime = Date.now();
  
  try {
    // Verificar cache primero si está habilitado
    if (options.useCache !== false) {
      const cachedResult = await getCachedResponse(userMessage);
      if (cachedResult) {
        console.log(`⚡ Returning cached response`);
        
        // Log la consulta aún si viene del cache
        if (options.userId) {
          await logConsultation(options.userId, userMessage, cachedResult.response, {
            legalAreaName: cachedResult.legalArea ?? undefined,
            sessionId: options.sessionId,
            responseTime: Date.now() - startTime,
            aiModel: 'gemini-cached'
          });
        }
        
        return {
          success: true,
          response: cachedResult.response,
          fromCache: true,
          legalArea: cachedResult.legalArea
        };
      }
    }
    
    // Identificar área legal de la consulta
    const identifiedArea = await identifyLegalArea(userMessage);
    let legalContext = "";
    
    if (identifiedArea) {
      console.log(`📋 Identified legal area: ${identifiedArea}`);
      legalContext = await getLegalContext(identifiedArea);
    }
    
    // Construir prompt mejorado con contexto legal específico
    let enhancedPrompt = LEGAL_SYSTEM_PROMPT;
    
    if (legalContext) {
      enhancedPrompt += `\n\nCONTEXTO LEGAL ESPECÍFICO:\n${legalContext}\n`;
    }
    
    if (conversationHistory.length > 0) {
      enhancedPrompt += `\nCONTEXTO DE LA CONVERSACIÓN:\n${conversationHistory.join('\n')}\n\n`;
      console.log(`📖 Using conversation context with ${conversationHistory.length} messages`);
    }
    
    enhancedPrompt += `CONSULTA DEL USUARIO: ${userMessage}`;
    
    console.log(`🎯 Sending enhanced request to ${DEFAULT_MODEL} with prompt length: ${enhancedPrompt.length} characters`);

    // Verificar que la API key esté configurada correctamente
    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
      console.log(`❌ GEMINI_API_KEY is empty or undefined`);
      throw new Error("GEMINI_API_KEY no está configurada correctamente");
    }

    // Test the API key format one more time
    if (GEMINI_API_KEY.includes('tu-api-key')) {
      console.log(`❌ API key contains placeholder text`);
      throw new Error("API key still contains placeholder text");
    }

    // Usar el modelo Gemini 2.5 Flash (nuevo modelo actualizado)
    console.log(`🎯 Initializing ${DEFAULT_MODEL} model...`);
    const model = genAI.getGenerativeModel({ 
      model: DEFAULT_MODEL,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, 
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Generar respuesta con manejo de errores mejorado
    const result = await model.generateContent(enhancedPrompt);
    
    if (!result) {
      console.log(`❌ No result returned from Gemini`);
      throw new Error("No response from Gemini API");
    }

    console.log(`📨 Raw Gemini result received`);
    
    const response = await result.response;
    
    if (!response) {
      console.log(`❌ No response object from Gemini result`);
      throw new Error("No response object from Gemini");
    }

    const text = response.text();
    console.log(`📝 Gemini response text length: ${text?.length || 0} characters`);

    if (!text || text.trim().length === 0) {
      console.log(`❌ Empty response text from Gemini`);
      return {
        success: false,
        error: "No se pudo generar una respuesta. Por favor, intenta reformular tu consulta."
      };
    }

    const finalResponse = formatLegalResponse(text.trim());
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Gemini response generated successfully in ${responseTime}ms`);
    
    // Cachear la respuesta para consultas futuras
    if (options.useCache !== false) {
      await cacheResponse(userMessage, finalResponse, identifiedArea || undefined);
    }
    
    // Log la consulta
    if (options.userId) {
      await logConsultation(options.userId, userMessage, finalResponse, {
        legalAreaName: identifiedArea ?? undefined,
        sessionId: options.sessionId,
        responseTime,
        aiModel: DEFAULT_MODEL
      });
    }
    
    return {
      success: true,
      response: finalResponse,
      fromCache: false,
      legalArea: identifiedArea ?? undefined
    };

  } catch (error) {
    console.error("💥 Detailed Gemini API error:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.constructor.name : 'Unknown',
      apiKeyLength: GEMINI_API_KEY.length,
      apiKeyStart: GEMINI_API_KEY.substring(0, 8),
    });
    
    // Manejar diferentes tipos de errores con más detalle
    if (error instanceof Error) {
      if (error.message.includes("models/gemini-pro is not found") || 
          error.message.includes("404 Not Found") ||
          error.message.includes("not supported for generateContent")) {
        console.log(`🔄 Model not found error - trying fallback model`);
        
        // Intentar con modelo alternativo
        try {
          console.log(`🔄 Trying fallback model: ${AVAILABLE_MODELS.FLASH_LITE_2_5}`);
          const fallbackModel = genAI.getGenerativeModel({ 
            model: AVAILABLE_MODELS.FLASH_LITE_2_5,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          });
          
          let contextualPrompt = LEGAL_SYSTEM_PROMPT;
          if (conversationHistory.length > 0) {
            contextualPrompt += `\n\nCONTEXTO DE LA CONVERSACIÓN:\n${conversationHistory.join('\n')}\n\n`;
          }
          contextualPrompt += `CONSULTA DEL USUARIO: ${userMessage}`;
          
          const fallbackResult = await fallbackModel.generateContent(contextualPrompt);
          const fallbackResponse = await fallbackResult.response;
          const fallbackText = fallbackResponse.text();
          
          if (fallbackText && fallbackText.trim().length > 0) {
            console.log(`✅ Fallback model successful`);
            return {
              success: true,
              response: fallbackText.trim()
            };
          }
        } catch (fallbackError) {
          console.error(`💥 Fallback model also failed:`, fallbackError);
        }
        
        return {
          success: false,
          error: "El modelo de IA no está disponible temporalmente. Por favor, intenta más tarde o contacta con un abogado."
        };
      }
      
      if (error.message.includes("API_KEY_INVALID") || error.message.includes("API key not valid")) {
        console.log(`🔑 Specific API key error detected`);
        return {
          success: false,
          error: "Error de configuración del servicio de IA. La clave API no es válida."
        };
      }
      
      if (error.message.includes("quota") || error.message.includes("rate")) {
        console.log(`⏰ Rate limit or quota error`);
        return {
          success: false,
          error: "El servicio está temporalmente sobrecargado. Por favor, intenta en unos minutos."
        };
      }

      if (error.message.includes("SAFETY")) {
        console.log(`🛡️ Safety filter triggered`);
        return {
          success: false,
          error: "Tu consulta activó filtros de seguridad. Por favor, reformúlala de manera más general."
        };
      }
    }

    console.log(`🚨 General Gemini API error`);
    return {
      success: false,
      error: "Error interno del asistente de IA. Por favor, intenta nuevamente o contacta a un abogado."
    };
  }
}

// Función para probar la conexión con Gemini usando el nuevo modelo
export async function testGeminiConnection(): Promise<{ success: boolean; error?: string }> {
  console.log(`🧪 Testing Gemini connection with ${DEFAULT_MODEL}...`);
  
  try {
    const testResponse = await getGeminiResponse("Hola, ¿puedes ayudarme con una consulta legal básica?");
    
    if (testResponse.success) {
      console.log(`✅ Gemini connection test successful with ${DEFAULT_MODEL}`);
      return { success: true };
    } else {
      console.log(`❌ Gemini connection test failed: ${testResponse.error}`);
      return { success: false, error: testResponse.error };
    }
  } catch (error) {
    console.error(`💥 Gemini connection test error:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error during test" 
    };
  }
}

// Función para listar modelos disponibles (útil para debugging)
export async function listAvailableModels(): Promise<{ success: boolean; models?: string[]; error?: string }> {
  try {
    console.log(`📋 Listing available Gemini models...`);
    
    // Esta es una función de utilidad para verificar qué modelos están disponibles
    const availableModels = Object.values(AVAILABLE_MODELS);
    
    console.log(`📋 Currently configured models:`, availableModels);
    
    return {
      success: true,
      models: availableModels
    };
  } catch (error) {
    console.error(`💥 Error listing models:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function validateLegalQuery(query: string): Promise<{ isValid: boolean; reason?: string }> {
  // Validaciones básicas para consultas legales
  const prohibitedPatterns = [
    /solicito.*ayuda.*suicidio/i,
    /como.*cometer.*delito/i,
    /evadir.*impuestos/i,
    /lavado.*dinero/i,
    /falsificar.*documento/i
  ];

  for (const pattern of prohibitedPatterns) {
    if (pattern.test(query)) {
      return {
        isValid: false,
        reason: "La consulta contiene contenido que no puedo asesorar por motivos éticos y legales."
      };
    }
  }

  // Verificar longitud mínima y máxima
  if (query.trim().length < 10) {
    return {
      isValid: false,
      reason: "La consulta es muy corta. Por favor, proporciona más detalles."
    };
  }

  if (query.length > 2000) {
    return {
      isValid: false,
      reason: "La consulta es muy larga. Por favor, resume tu pregunta."
    };
  }

  return { isValid: true };
}

export function formatLegalResponse(response: string): string {
  // Agregar disclaimer al final si no lo tiene
  const disclaimer = "\n\n⚖️ **Importante**: Esta información es de carácter general y no constituye asesoría legal formal. Para casos específicos, recomendamos consultar con un abogado especializado.";
  
  if (!response.includes("asesoría legal") && !response.includes("consultar con un abogado")) {
    return response + disclaimer;
  }
  
  return response;
}
