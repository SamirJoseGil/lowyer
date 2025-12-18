import { db } from "../db.server";

export async function getFAQsPendientes(options: {
  limit?: number;
  offset?: number;
} = {}) {
  const { limit = 50, offset = 0 } = options;

  return db.fAQ.findMany({
    where: {
      OR: [
        { estado: "pendiente" },
        { estado: "revisada" },
      ],
    },
    include: {
      revisor: {
        select: {
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: [
      { procesadaPorIA: "desc" },
      { createdAt: "asc" },
    ],
    take: limit,
    skip: offset,
  });
}

export async function getFAQById(id: string) {
  return db.fAQ.findUnique({
    where: { id },
    include: {
      revisor: {
        select: {
          email: true,
          profile: true,
        },
      },
    },
  });
}

export async function updateFAQ(
  id: string,
  data: {
    respuesta?: string;
    categoria?: string;
    relevancia?: number;
    estado?: string;
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
      updatedAt: new Date(),
    },
  });
}

export async function rejectFAQ(id: string, adminId: string, reason?: string) {
  return db.fAQ.update({
    where: { id },
    data: {
      estado: "rechazada",
      revisadaPor: adminId,
      updatedAt: new Date(),
    },
  });
}

export async function getFAQStats() {
  const [
    total,
    publicadas,
    pendientes,
    procesadasPorIA,
    totalVistas,
    totalVotos,
  ] = await Promise.all([
    db.fAQ.count(),
    db.fAQ.count({ where: { publicada: true } }),
    db.fAQ.count({ where: { estado: "pendiente" } }),
    db.fAQ.count({ where: { procesadaPorIA: true } }),
    db.fAQ.aggregate({
      _sum: { vistas: true },
    }),
    db.fAQ.aggregate({
      _sum: { votosUtiles: true },
    }),
  ]);

  return {
    total,
    publicadas,
    pendientes,
    procesadasPorIA,
    totalVistas: totalVistas._sum.vistas || 0,
    totalVotos: totalVotos._sum.votosUtiles || 0,
  };
}

export async function getTopFAQsByCategory() {
  const categorias = await db.fAQ.groupBy({
    by: ["categoria"],
    _count: { id: true },
    _avg: { vistas: true },
    where: {
      publicada: true,
    },
  });

  return categorias.map((cat) => ({
    nombre: cat.categoria,
    cantidad: cat._count.id,
    promedioVistas: Math.round(cat._avg.vistas || 0),
  }));
}

export async function getMostSearchedQueries() {
  return db.fAQSearch.groupBy({
    by: ["query"],
    _count: { id: true },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 10,
  });
}
