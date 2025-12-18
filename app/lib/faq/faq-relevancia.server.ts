import { db } from "../db.server";

const PESO_VISTAS = 0.3;
const PESO_VOTOS = 0.5;
const PESO_RECIENTE = 0.2;

export function calcularRelevancia(faq: {
  vistas: number;
  votosUtiles: number;
  publicadaAt: Date | null;
  createdAt: Date;
}): number {
  // Normalizar vistas (max 1000 vistas = 100 puntos)
  const puntajeVistas = Math.min(faq.vistas / 10, 100) * PESO_VISTAS;

  // Votos útiles (cada voto = 1 punto, max 100)
  const puntajeVotos = Math.min(faq.votosUtiles, 100) * PESO_VOTOS;

  // Reciente (últimos 30 días = 100 puntos, decae linealmente)
  const fechaPublicacion = faq.publicadaAt || faq.createdAt;
  const diasDesdePublicacion =
    (Date.now() - fechaPublicacion.getTime()) / (1000 * 60 * 60 * 24);
  const puntajeReciente =
    Math.max(0, 100 - (diasDesdePublicacion / 30) * 100) * PESO_RECIENTE;

  return Math.round(puntajeVistas + puntajeVotos + puntajeReciente);
}

export async function recalcularRelevanciaGlobal() {
  console.log("🔄 Recalculando relevancia de todas las FAQs...");

  const faqs = await db.fAQ.findMany({
    where: {
      publicada: true,
    },
    select: {
      id: true,
      vistas: true,
      votosUtiles: true,
      publicadaAt: true,
      createdAt: true,
    },
  });

  let actualizadas = 0;

  for (const faq of faqs) {
    const nuevaRelevancia = calcularRelevancia(faq);

    await db.fAQ.update({
      where: { id: faq.id },
      data: { relevancia: nuevaRelevancia },
    });

    actualizadas++;
  }

  console.log(`✅ Relevancia recalculada para ${actualizadas} FAQs`);

  return { actualizadas };
}

export async function getFAQsRelacionadas(faqId: string, categoria: string, limite: number = 3) {
  const relacionadas = await db.fAQ.findMany({
    where: {
      publicada: true,
      categoria,
      id: {
        not: faqId,
      },
    },
    orderBy: [
      { relevancia: "desc" },
      { vistas: "desc" },
    ],
    take: limite,
  });

  return relacionadas;
}
