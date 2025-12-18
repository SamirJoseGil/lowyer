import { db } from "../db.server";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function getFinancialMetrics(timeRange: "7d" | "30d" | "90d" | "all" = "30d") {
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
    totalRevenue,
    completedPurchases,
    pendingPurchases,
    failedPurchases,
    revenueByLicense,
    paymentMethods,
    topBuyers
  ] = await Promise.all([
    // Ingresos totales
    db.purchase.aggregate({
      where: {
        status: "completed",
        createdAt: { gte: startDate }
      },
      _sum: { amountCents: true }
    }),

    // Compras completadas
    db.purchase.count({
      where: {
        status: "completed",
        createdAt: { gte: startDate }
      }
    }),

    // Compras pendientes
    db.purchase.count({
      where: {
        status: "pending",
        createdAt: { gte: startDate }
      }
    }),

    // Compras fallidas
    db.purchase.count({
      where: {
        status: "failed",
        createdAt: { gte: startDate }
      }
    }),

    // Ingresos por tipo de licencia
    db.purchase.groupBy({
      by: ["licenseId"],
      where: {
        status: "completed",
        createdAt: { gte: startDate },
        licenseId: { not: null }
      },
      _sum: { amountCents: true },
      _count: true
    }),

    // Métodos de pago más usados
    db.purchase.groupBy({
      by: ["paymentMethod"],
      where: {
        status: "completed",
        createdAt: { gte: startDate },
        paymentMethod: { not: null }
      },
      _count: true,
      _sum: { amountCents: true }
    }),

    // Top compradores
    db.purchase.groupBy({
      by: ["userId"],
      where: {
        status: "completed",
        createdAt: { gte: startDate }
      },
      _sum: { amountCents: true },
      _count: true,
      orderBy: { _sum: { amountCents: "desc" } },
      take: 10
    })
  ]);

  // Calcular métricas adicionales
  const totalPurchases = completedPurchases + pendingPurchases + failedPurchases;
  const conversionRate = totalPurchases > 0 ? (completedPurchases / totalPurchases) * 100 : 0;
  const averageOrderValue = completedPurchases > 0 
    ? (totalRevenue._sum.amountCents || 0) / completedPurchases 
    : 0;

  // Obtener información de licencias para el breakdown
  const licenseIds = revenueByLicense.map(r => r.licenseId).filter(Boolean) as string[];
  const licenses = await db.license.findMany({
    where: { id: { in: licenseIds } },
    select: { id: true, name: true, type: true }
  });

  const revenueByLicenseWithNames = revenueByLicense.map(rev => {
    const license = licenses.find(l => l.id === rev.licenseId);
    return {
      licenseName: license?.name || "Desconocida",
      licenseType: license?.type || "unknown",
      revenue: rev._sum.amountCents || 0,
      count: rev._count
    };
  });

  // Obtener información de usuarios top
  const userIds = topBuyers.map(b => b.userId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    include: { profile: true }
  });

  const topBuyersWithInfo = topBuyers.map(buyer => {
    const user = users.find(u => u.id === buyer.userId);
    return {
      userId: buyer.userId,
      name: user?.profile 
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user?.email.split('@')[0] || "Usuario",
      email: user?.email || "",
      totalSpent: buyer._sum.amountCents || 0,
      purchaseCount: buyer._count
    };
  });

  return {
    overview: {
      totalRevenue: totalRevenue._sum.amountCents || 0,
      completedPurchases,
      pendingPurchases,
      failedPurchases,
      conversionRate,
      averageOrderValue
    },
    revenueByLicense: revenueByLicenseWithNames,
    paymentMethods: paymentMethods.map(pm => ({
      method: pm.paymentMethod || "Desconocido",
      count: pm._count,
      revenue: pm._sum.amountCents || 0
    })),
    topBuyers: topBuyersWithInfo
  };
}

export async function getRevenueTrends() {
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
      const [revenue, purchases] = await Promise.all([
        db.purchase.aggregate({
          where: {
            status: "completed",
            createdAt: { gte: start, lte: end }
          },
          _sum: { amountCents: true }
        }),
        db.purchase.count({
          where: {
            status: "completed",
            createdAt: { gte: start, lte: end }
          }
        })
      ]);

      return {
        label,
        revenue: revenue._sum.amountCents || 0,
        purchases
      };
    })
  );

  return trends;
}

export async function getMRR() {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);

  // Calcular MRR (Monthly Recurring Revenue)
  const currentMonthRevenue = await db.purchase.aggregate({
    where: {
      status: "completed",
      createdAt: { gte: startOfCurrentMonth }
    },
    _sum: { amountCents: true }
  });

  // Calcular usuarios activos con licencia
  const activeUsersWithLicense = await db.userLicense.count({
    where: {
      status: "active",
      hoursRemaining: { gt: 0 }
    }
  });

  // ARPU (Average Revenue Per User)
  const totalUsers = await db.user.count();
  const arpu = totalUsers > 0 
    ? (currentMonthRevenue._sum.amountCents || 0) / totalUsers 
    : 0;

  return {
    mrr: currentMonthRevenue._sum.amountCents || 0,
    activeSubscribers: activeUsersWithLicense,
    arpu
  };
}
