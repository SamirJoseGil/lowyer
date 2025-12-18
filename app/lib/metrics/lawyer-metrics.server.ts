import { db } from "../db.server";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function getLawyerMetrics(timeRange: "7d" | "30d" | "90d" | "all" = "30d") {
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
      startDate = new Date(0);
  }

  const [
    totalLawyers,
    verifiedLawyers,
    pendingLawyers,
    activeLawyers,
    avgRating,
    totalCases,
    topLawyers
  ] = await Promise.all([
    // Total abogados
    db.lawyer.count(),

    // Abogados verificados
    db.lawyer.count({ where: { status: "verified" } }),

    // Abogados pendientes
    db.lawyer.count({ where: { status: "pending" } }),

    // Abogados activos (con sesiones en el período)
    db.lawyer.count({
      where: {
        chatSessions: {
          some: {
            startedAt: { gte: startDate }
          }
        }
      }
    }),

    // Rating promedio
    db.lawyerReview.aggregate({
      _avg: { rating: true }
    }),

    // Total casos atendidos en período
    db.chatSession.count({
      where: {
        lawyerId: { not: null },
        startedAt: { gte: startDate }
      }
    }),

    // Top abogados por performance
    db.lawyer.findMany({
      where: { status: "verified" },
      include: {
        user: {
          include: { profile: true }
        },
        _count: {
          select: {
            chatSessions: true,
            reviews: true
          }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: {
        chatSessions: { _count: "desc" }
      },
      take: 10
    })
  ]);

  return {
    overview: {
      total: totalLawyers,
      verified: verifiedLawyers,
      pending: pendingLawyers,
      active: activeLawyers,
      avgRating: avgRating._avg.rating || 0,
      totalCases,
      utilizationRate: verifiedLawyers > 0 ? (activeLawyers / verifiedLawyers) * 100 : 0
    },
    topLawyers: topLawyers.map(lawyer => {
      const avgLawyerRating = lawyer.reviews.length > 0
        ? lawyer.reviews.reduce((acc, r) => acc + r.rating, 0) / lawyer.reviews.length
        : 0;

      return {
        id: lawyer.id,
        name: lawyer.user.profile
          ? `${lawyer.user.profile.firstName} ${lawyer.user.profile.lastName}`
          : lawyer.user.email.split('@')[0],
        email: lawyer.user.email,
        specialty: lawyer.specialty,
        cases: lawyer._count.chatSessions,
        reviews: lawyer._count.reviews,
        rating: avgLawyerRating,
        experienceYears: lawyer.experienceYears
      };
    })
  };
}

export async function getLawyerActivityTrends() {
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
      const [cases, reviews, newLawyers] = await Promise.all([
        db.chatSession.count({
          where: {
            lawyerId: { not: null },
            startedAt: { gte: start, lte: end }
          }
        }),
        db.lawyerReview.count({
          where: {
            createdAt: { gte: start, lte: end }
          }
        }),
        db.lawyer.count({
          where: {
            user: {
              createdAt: { gte: start, lte: end }
            }
          }
        })
      ]);

      return { label, cases, reviews, newLawyers };
    })
  );

  return trends;
}

export async function getLawyerPerformanceDistribution() {
  const lawyers = await db.lawyer.findMany({
    where: { status: "verified" },
    include: {
      _count: {
        select: { chatSessions: true }
      }
    }
  });

  const distribution = {
    inactive: lawyers.filter(l => l._count.chatSessions === 0).length,
    low: lawyers.filter(l => l._count.chatSessions > 0 && l._count.chatSessions <= 5).length,
    medium: lawyers.filter(l => l._count.chatSessions > 5 && l._count.chatSessions <= 20).length,
    high: lawyers.filter(l => l._count.chatSessions > 20).length
  };

  return distribution;
}
