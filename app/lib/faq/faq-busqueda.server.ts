import { db } from "../db.server";

export async function buscarFAQs(options: {
  query: string;
  categoria?: string;
  limite?: number;
  userId?: string;
  ipAddress?: string;
}) {
  const { query, categoria, limite = 20, userId, ipAddress } = options;

  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.trim().toLowerCase();

  // Búsqueda con filtro SQL LIKE para compatibilidad
  const resultados = await db.fAQ.findMany({
    where: {
      publicada: true,
      AND: [
        {
          OR: [
            {
              pregunta: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              respuesta: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
        },
        categoria ? { categoria } : {},
      ],
    },
    orderBy: [
      { relevancia: "desc" },
      { vistas: "desc" },
    ],
    take: limite,
  });

  // Registrar búsqueda para analytics
  try {
    await db.fAQSearch.create({
      data: {
        query: searchTerm,
        resultados: resultados.length,
        userId,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Error registrando búsqueda:", error);
  }

  return resultados;
}

export async function getBusquedasPopulares(limite: number = 10) {
  const busquedas = await db.fAQSearch.groupBy({
    by: ["query"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: limite,
  });

  return busquedas.map((b) => ({
    query: b.query,
    cantidad: b._count.id,
  }));
}

export async function getSugerenciasBusqueda(query: string, limite: number = 5) {
  if (!query || query.length < 2) {
    return [];
  }

  const busquedas = await db.fAQSearch.findMany({
    where: {
      query: {
        startsWith: query.toLowerCase(),
      },
    },
    select: {
      query: true,
    },
    distinct: ["query"],
    take: limite,
    orderBy: {
      createdAt: "desc",
    },
  });

  return busquedas.map((b) => b.query);
}
