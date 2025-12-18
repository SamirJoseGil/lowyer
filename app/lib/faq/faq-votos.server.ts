import { db } from "../db.server";
import { calcularRelevancia } from "./faq-relevancia.server";

export async function voteFAQ(
  faqId: string,
  ipAddress: string,
  util: boolean,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar si ya votó
    const existingVote = await db.fAQVote.findUnique({
      where: {
        faqId_ipAddress: {
          faqId,
          ipAddress,
        },
      },
    });

    if (existingVote) {
      return { success: false, error: "Ya has votado en esta FAQ" };
    }

    // Crear voto
    await db.fAQVote.create({
      data: {
        faqId,
        ipAddress,
        util,
        userId,
      },
    });

    // Actualizar contador en FAQ
    if (util) {
      await db.fAQ.update({
        where: { id: faqId },
        data: {
          votosUtiles: {
            increment: 1,
          },
        },
      });
    }

    // Recalcular relevancia
    await calcularRelevancia(faqId);

    console.log(`✅ Vote registered for FAQ ${faqId}: ${util ? "útil" : "no útil"}`);

    return { success: true };
  } catch (error) {
    console.error(`❌ Error voting FAQ:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getVoteStats(faqId: string) {
  const votes = await db.fAQVote.findMany({
    where: { faqId },
  });

  const totalVotes = votes.length;
  const utilVotes = votes.filter((v) => v.util).length;
  const noUtilVotes = totalVotes - utilVotes;

  return {
    total: totalVotes,
    utiles: utilVotes,
    noUtiles: noUtilVotes,
    porcentajeUtil: totalVotes > 0 ? (utilVotes / totalVotes) * 100 : 0,
  };
}
