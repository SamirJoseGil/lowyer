import { db } from "../db.server";

export type FAQEstado = "pendiente" | "revisada" | "publicada" | "rechazada";

export interface CreateFAQInput {
  pregunta: string;
  categoria: string;
  usuarioEmail?: string;
  usuarioNombre?: string;
}

export async function createFAQ(input: CreateFAQInput) {
  const faq = await db.fAQ.create({
    data: {
      pregunta: input.pregunta,
      categoria: input.categoria,
      usuarioEmail: input.usuarioEmail,
      usuarioNombre: input.usuarioNombre,
      estado: "pendiente",
    },
  });

  console.log(`✅ FAQ created: ${faq.id}`);
  return faq;
}

export async function getTopFAQs(options: {
  categoria?: string;
  limit?: number;
} = {}) {
  const { categoria, limit = 10 } = options;

  return db.fAQ.findMany({
    where: {
      publicada: true,
      ...(categoria && { categoria }),
    },
    orderBy: [
      { relevancia: "desc" },
      { vistas: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
  });
}

export async function getFAQById(id: string) {
  return db.fAQ.findUnique({
    where: { id },
    include: {
      revisor: {
        select: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
}

export async function incrementFAQViews(id: string) {
  return db.fAQ.update({
    where: { id },
    data: {
      vistas: {
        increment: 1,
      },
    },
  });
}

export async function getRelatedFAQs(faqId: string, categoria: string) {
  return db.fAQ.findMany({
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
    take: 3,
  });
}

export async function voteFAQ(
  faqId: string,
  ipAddress: string,
  util: boolean,
  userId?: string
) {
  try {
    // Crear o actualizar voto
    await db.fAQVote.upsert({
      where: {
        faqId_ipAddress: {
          faqId,
          ipAddress,
        },
      },
      create: {
        faqId,
        ipAddress,
        util,
        userId,
      },
      update: {
        util,
      },
    });

    // Recalcular votos útiles
    const votosUtiles = await db.fAQVote.count({
      where: {
        faqId,
        util: true,
      },
    });

    // Actualizar contador en FAQ
    await db.fAQ.update({
      where: { id: faqId },
      data: {
        votosUtiles,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error voting FAQ:", error);
    return { success: false, error: "Error al registrar voto" };
  }
}

export async function hasUserVoted(faqId: string, ipAddress: string) {
  const vote = await db.fAQVote.findUnique({
    where: {
      faqId_ipAddress: {
        faqId,
        ipAddress,
      },
    },
  });

  return vote ? vote.util : null;
}

export async function submitFAQQuestion(data: {
  pregunta: string;
  categoria: string;
  usuarioNombre: string | null;
  usuarioEmail: string | null;
  ipAddress: string;
}) {
  return db.fAQ.create({
    data: {
      pregunta: data.pregunta,
      categoria: data.categoria,
      usuarioNombre: data.usuarioNombre,
      usuarioEmail: data.usuarioEmail,
      estado: "pendiente",
      publicada: false,
    },
  });
}

export async function updateFAQ(
  id: string,
  data: {
    respuesta?: string;
    categoria?: string;
    relevancia?: number;
    estado?: FAQEstado;
    revisadaPor?: string;
  }
) {
  return db.fAQ.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function publishFAQ(id: string, adminId: string) {
  return db.fAQ.update({
    where: { id },
    data: {
      estado: "publicada",
      publicada: true,
      publicadaAt: new Date(),
      revisadaPor: adminId,
    },
  });
}

export async function incrementViews(id: string) {
  return db.fAQ.update({
    where: { id },
    data: {
      vistas: {
        increment: 1,
      },
    },
  });
}

export async function getFAQsByCategory(categoria: string) {
  return db.fAQ.findMany({
    where: {
      categoria,
      publicada: true,
    },
    orderBy: {
      relevancia: "desc",
    },
  });
}

export async function searchFAQs(query: string, categoria?: string) {
  const whereClause: any = {
    publicada: true,
    OR: [
      { pregunta: { contains: query, mode: "insensitive" } },
      { respuesta: { contains: query, mode: "insensitive" } },
    ],
  };

  if (categoria) {
    whereClause.categoria = categoria;
  }

  return db.fAQ.findMany({
    where: whereClause,
    orderBy: [
      { relevancia: "desc" },
      { vistas: "desc" },
    ],
    take: 20,
  });
}

export async function deleteFAQ(id: string) {
  return db.fAQ.delete({
    where: { id },
  });
}

export async function getFAQStats() {
  const [total, publicadas, pendientes, procesadasPorIA] = await Promise.all([
    db.fAQ.count(),
    db.fAQ.count({ where: { publicada: true } }),
    db.fAQ.count({ where: { estado: "pendiente" } }),
    db.fAQ.count({ where: { procesadaPorIA: true } }),
  ]);

  return {
    total,
    publicadas,
    pendientes,
    procesadasPorIA,
  };
}
