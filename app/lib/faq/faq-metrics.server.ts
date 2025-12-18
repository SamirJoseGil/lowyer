import { db } from "../db.server";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function getFAQMetrics(timeRange: "7d" | "30d" | "90d" | "all" = "30d") {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(0); // All time
  }

  const [
    totalFAQs,
    publicadas,
    pendientes,
    procesadasIA,
    totalVistas,
    totalVotos,
    avgConfianzaIA,
    topCategories,
    recentSearches
  ] = await Promise.all([
    // Total FAQs
    db.fAQ.count(),

    // Publicadas
    db.fAQ.count({ where: { publicada: true } }),

    // Pendientes
    db.fAQ.count({ where: { estado: "pendiente" } }),

    // Procesadas por IA
    db.fAQ.count({ where: { procesadaPorIA: true } }),

    // Total vistas
    db.fAQ.aggregate({ _sum: { vistas: true } }),

    // Total votos
    db.fAQ.aggregate({ _sum: { votosUtiles: true } }),

    // Promedio confianza IA
    db.fAQ.aggregate({
      where: { procesadaPorIA: true },
      _avg: { confianzaIA: true }
    }),

    // Top categorías
    db.fAQ.groupBy({
      by: ["categoria"],
      where: { publicada: true },
      _count: true,
      _sum: { vistas: true, votosUtiles: true },
      orderBy: { _count: { categoria: "desc" } },
      take: 10
    }),

    // Búsquedas recientes
    db.fAQSearch.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })
  ]);

  return {
    overview: {
      total: totalFAQs,
      publicadas,
      pendientes,
      procesadasIA,
      totalVistas: totalVistas._sum.vistas || 0,
      totalVotos: totalVotos._sum.votosUtiles || 0,
      avgConfianzaIA: avgConfianzaIA._avg.confianzaIA || 0,
      tasaPublicacion: totalFAQs > 0 ? (publicadas / totalFAQs) * 100 : 0
    },
    categories: topCategories.map(cat => ({
      nombre: cat.categoria,
      cantidad: cat._count,
      vistas: cat._sum.vistas || 0,
      votos: cat._sum.votosUtiles || 0,
      engagement: cat._sum.vistas ? (cat._sum.votosUtiles || 0) / cat._sum.vistas : 0
    })),
    searches: recentSearches
  };
}

export async function getFAQTrends() {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      start: startOfMonth(date),
      end: endOfMonth(date),
      label: format(date, "MMM yyyy")
    };
  }).reverse();

  const trends = await Promise.all(
    last6Months.map(async ({ start, end, label }) => {
      const [created, published, searches] = await Promise.all([
        db.fAQ.count({
          where: {
            createdAt: { gte: start, lte: end }
          }
        }),
        db.fAQ.count({
          where: {
            publicadaAt: { gte: start, lte: end }
          }
        }),
        db.fAQSearch.count({
          where: {
            createdAt: { gte: start, lte: end }
          }
        })
      ]);

      return { label, created, published, searches };
    })
  );

  return trends;
}

export async function getTopSearchQueries(limit = 20) {
  const searches = await db.fAQSearch.groupBy({
    by: ["query"],
    _count: true,
    orderBy: { _count: { query: "desc" } },
    take: limit
  });

  return searches.map(s => ({
    query: s.query,
    count: s._count
  }));
}

export async function getFAQPerformance() {
  const topPerforming = await db.fAQ.findMany({
    where: { publicada: true },
    orderBy: [
      { vistas: "desc" },
      { votosUtiles: "desc" }
    ],
    take: 10,
    select: {
      id: true,
      pregunta: true,
      categoria: true,
      vistas: true,
      votosUtiles: true,
      relevancia: true
    }
  });

  const lowPerforming = await db.fAQ.findMany({
    where: {
      publicada: true,
      publicadaAt: {
        lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // > 30 días
      }
    },
    orderBy: [
      { vistas: "asc" }
    ],
    take: 10,
    select: {
      id: true,
      pregunta: true,
      categoria: true,
      vistas: true,
      votosUtiles: true,
      relevancia: true,
      publicadaAt: true
    }
  });

  return { topPerforming, lowPerforming };
}
