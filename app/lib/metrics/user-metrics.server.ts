import { db } from "../db.server";
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays } from "date-fns";

export async function getUserMetrics(timeRange: "7d" | "30d" | "90d" | "all" = "30d") {
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
    totalUsers,
    activeUsers,
    newUsers,
    usersWithLicense,
    trialUsers,
    paidUsers,
    avgSessionsPerUser,
    topUsers
  ] = await Promise.all([
    // Total usuarios
    db.user.count(),

    // Usuarios activos (con sesión en el período)
    db.user.count({
      where: {
        lastLogin: { gte: startDate }
      }
    }),

    // Nuevos usuarios en el período
    db.user.count({
      where: {
        createdAt: { gte: startDate, lte: now }
      }
    }),

    // Usuarios con licencia activa
    db.user.count({
      where: {
        userLicenses: {
          some: {
            status: "active",
            hoursRemaining: { gt: 0 }
          }
        }
      }
    }),

    // Usuarios en trial
    db.user.count({
      where: {
        userLicenses: {
          some: {
            status: "active",
            license: { type: "trial" }
          }
        }
      }
    }),

    // Usuarios con licencia paga
    db.user.count({
      where: {
        userLicenses: {
          some: {
            status: "active",
            license: { type: { not: "trial" } }
          }
        }
      }
    }),

    // Promedio de sesiones por usuario
    db.chatSession.aggregate({
      _avg: { id: true }
    }),

    // Top usuarios por actividad
    db.user.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      include: {
        _count: {
          select: {
            chatSessions: true,
            purchases: true
          }
        },
        profile: true,
        userLicenses: {
          where: { status: "active" },
          include: { license: true }
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
      total: totalUsers,
      active: activeUsers,
      new: newUsers,
      withLicense: usersWithLicense,
      trial: trialUsers,
      paid: paidUsers,
      conversionRate: trialUsers > 0 ? (paidUsers / trialUsers) * 100 : 0,
      activationRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    },
    topUsers: topUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email.split('@')[0],
      sessions: user._count.chatSessions,
      purchases: user._count.purchases,
      license: user.userLicenses[0]?.license.name || "Sin licencia",
      createdAt: user.createdAt
    }))
  };
}

export async function getUserRegistrationTrends() {
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
      const [registered, activated, converted] = await Promise.all([
        db.user.count({
          where: {
            createdAt: { gte: start, lte: end }
          }
        }),
        db.user.count({
          where: {
            createdAt: { gte: start, lte: end },
            lastLogin: { not: null }
          }
        }),
        db.purchase.count({
          where: {
            createdAt: { gte: start, lte: end },
            status: "completed"
          }
        })
      ]);

      return { label, registered, activated, converted };
    })
  );

  return trends;
}

export async function getUserRetention() {
  const cohorts = await db.user.groupBy({
    by: ['createdAt'],
    _count: true,
    orderBy: { createdAt: 'desc' },
    take: 12
  });

  const retentionData = await Promise.all(
    cohorts.map(async (cohort) => {
      const cohortUsers = await db.user.findMany({
        where: {
          createdAt: {
            gte: cohort.createdAt,
            lt: new Date(cohort.createdAt.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        select: { id: true }
      });

      const userIds = cohortUsers.map(u => u.id);

      // Usuarios activos 7, 14, 30 días después
      const [day7, day14, day30] = await Promise.all([
        db.user.count({
          where: {
            id: { in: userIds },
            lastLogin: {
              gte: new Date(cohort.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        db.user.count({
          where: {
            id: { in: userIds },
            lastLogin: {
              gte: new Date(cohort.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        db.user.count({
          where: {
            id: { in: userIds },
            lastLogin: {
              gte: new Date(cohort.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      return {
        cohort: format(cohort.createdAt, "MMM dd"),
        total: cohort._count,
        day7: cohort._count > 0 ? (day7 / cohort._count) * 100 : 0,
        day14: cohort._count > 0 ? (day14 / cohort._count) * 100 : 0,
        day30: cohort._count > 0 ? (day30 / cohort._count) * 100 : 0
      };
    })
  );

  return retentionData;
}
