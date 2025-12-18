import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../db.server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CATEGORIAS_CONTEXTO: Record<string, string> = {
  civil: "Derecho Civil colombiano, incluyendo obligaciones, contratos, responsabilidad civil, propiedad y derechos reales",
  laboral: "Derecho Laboral colombiano, incluyendo contratos de trabajo, prestaciones sociales, despidos, acoso laboral",
  penal: "Derecho Penal colombiano, incluyendo delitos, penas, procedimiento penal, imputabilidad",
  familia: "Derecho de Familia colombiano, incluyendo matrimonio, divorcio, custodia, alimentos, sucesiones",
  contratos: "Derecho de Contratos colombiano, incluyendo formación, ejecución, incumplimiento y terminación de contratos",
  propiedad: "Derecho de Propiedad e Inmuebles colombiano, incluyendo compraventa, arrendamiento, registro, hipotecas",
  comercial: "Derecho Comercial colombiano, incluyendo sociedades, títulos valores, contratos mercantiles, insolvencia",
  tributario: "Derecho Tributario colombiano, incluyendo impuestos, declaraciones, sanciones, procedimiento tributario",
  consumidor: "Derecho del Consumidor colombiano, incluyendo garantías, devoluciones, publicidad engañosa, protección al consumidor",
  otros: "Derecho colombiano en general y otras áreas no especificadas"
};

function generarPromptFAQ(pregunta: string, categoria: string): string {
  const contexto = CATEGORIAS_CONTEXTO[categoria] || CATEGORIAS_CONTEXTO.otros;
  
  return `Eres un asistente legal especializado en derecho colombiano, específicamente en: ${contexto}.

**PREGUNTA DEL USUARIO:**
${pregunta}

**INSTRUCCIONES ESTRICTAS:**
1. Responde de forma clara, concisa y profesional (máximo 400 palabras)
2. Usa un tono accesible pero manteniendo rigor jurídico
3. Cita normas específicas de Colombia cuando sea relevante (Códigos, Leyes, Decretos)
4. SIEMPRE incluye un disclaimer indicando que esta es información general y NO sustituye asesoría legal personalizada
5. NO des consejos legales específicos para casos particulares
6. NO hagas suposiciones sobre circunstancias específicas del caso
7. Recomienda consultar con un abogado para situaciones específicas
8. Usa formato Markdown para mejor legibilidad

**FORMATO DE RESPUESTA:**

## Respuesta General

[Responde la pregunta de forma directa y clara en 1-2 párrafos]

## Marco Legal Aplicable

[Lista las principales normas colombianas relevantes con artículos específicos si aplica]

## Consideraciones Importantes

[Puntos clave que el usuario debe tener en cuenta, en formato de lista]

## Cuándo Consultar un Abogado

[Situaciones específicas que requieren asesoría legal personalizada]

---
**Disclaimer:** Esta información es de carácter general e informativo. No constituye asesoría legal específica y no debe ser utilizada como sustituto de la consulta con un abogado colegiado que pueda evaluar los detalles de su situación particular.

**RESPONDE AHORA DE FORMA ESTRUCTURADA:**`;
}

export async function procesarFAQConIA(faqId: string): Promise<{
  success: boolean;
  respuestaIA?: string;
  confianza?: number;
  error?: string;
}> {
  try {
    const faq = await db.fAQ.findUnique({
      where: { id: faqId },
    });

    if (!faq) {
      return { success: false, error: "FAQ no encontrada" };
    }

    if (faq.procesadaPorIA) {
      return { 
        success: false, 
        error: "Esta FAQ ya fue procesada por IA" 
      };
    }

    console.log(`🤖 Procesando FAQ con IA: ${faqId}`);
    console.log(`📝 Pregunta: ${faq.pregunta}`);
    console.log(`📂 Categoría: ${faq.categoria}`);

    // Configurar modelo de IA
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    // Generar prompt
    const prompt = generarPromptFAQ(faq.pregunta, faq.categoria);

    // Llamar a la IA
    const result = await model.generateContent(prompt);
    const response = result.response;
    const respuestaIA = response.text();

    if (!respuestaIA || respuestaIA.length < 100) {
      return { 
        success: false, 
        error: "Respuesta de IA muy corta o vacía" 
      };
    }

    // Calcular confianza básica (basado en longitud y estructura)
    let confianza = 0.5; // Base

    // Aumentar confianza si tiene estructura Markdown
    if (respuestaIA.includes("##")) confianza += 0.1;
    if (respuestaIA.includes("**Disclaimer:**")) confianza += 0.15;
    if (respuestaIA.match(/Ley \d+/i)) confianza += 0.1;
    if (respuestaIA.match(/Código/i)) confianza += 0.1;
    if (respuestaIA.length > 300) confianza += 0.05;

    confianza = Math.min(confianza, 0.95); // Max 95%

    // Determinar estado basado en confianza
    const nuevoEstado = confianza >= 0.75 ? "revisada" : "pendiente";

    // Actualizar FAQ en BD
    await db.fAQ.update({
      where: { id: faqId },
      data: {
        respuestaIA,
        procesadaPorIA: true,
        confianzaIA: confianza,
        estado: nuevoEstado,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ FAQ procesada exitosamente`);
    console.log(`🎯 Confianza: ${(confianza * 100).toFixed(1)}%`);
    console.log(`📊 Estado: ${nuevoEstado}`);

    return {
      success: true,
      respuestaIA,
      confianza,
    };
  } catch (error) {
    console.error("❌ Error procesando FAQ con IA:", error);
    
    // Marcar FAQ como procesada pero con error
    await db.fAQ.update({
      where: { id: faqId },
      data: {
        procesadaPorIA: true,
        confianzaIA: 0,
        estado: "pendiente",
      },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function procesarFAQsPendientes(): Promise<{
  procesadas: number;
  exitosas: number;
  fallidas: number;
}> {
  console.log("🔄 Iniciando procesamiento de FAQs pendientes...");

  const faqsPendientes = await db.fAQ.findMany({
    where: {
      procesadaPorIA: false,
      estado: "pendiente",
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 10, // Procesar max 10 a la vez
  });

  console.log(`📋 FAQs pendientes encontradas: ${faqsPendientes.length}`);

  let exitosas = 0;
  let fallidas = 0;

  for (const faq of faqsPendientes) {
    const resultado = await procesarFAQConIA(faq.id);
    
    if (resultado.success) {
      exitosas++;
    } else {
      fallidas++;
    }

    // Pequeña pausa entre requests para no saturar API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`✅ Procesamiento completado:`);
  console.log(`   Exitosas: ${exitosas}`);
  console.log(`   Fallidas: ${fallidas}`);

  return {
    procesadas: faqsPendientes.length,
    exitosas,
    fallidas,
  };
}

export async function reprocesarFAQ(faqId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Resetear estado de procesamiento
    await db.fAQ.update({
      where: { id: faqId },
      data: {
        procesadaPorIA: false,
        respuestaIA: null,
        confianzaIA: null,
      },
    });

    // Procesar nuevamente
    const resultado = await procesarFAQConIA(faqId);

    return {
      success: resultado.success,
      message: resultado.success 
        ? "FAQ reprocesada exitosamente" 
        : resultado.error || "Error al reprocesar",
    };
  } catch (error) {
    console.error("Error reprocesando FAQ:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
