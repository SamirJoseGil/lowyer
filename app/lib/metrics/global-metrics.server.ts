import { db } from "../db.server";
import { startOfMonth, endOfMonth } from "date-fns";

export async function getGlobalMetrics() {
  const now = new Date();
  const startMonth = startOfMonth(now);
  const endMonth = endOfMonth(now);

  const [
    totalUsuarios,
    usuariosActivos,
    nuevosEsteMes,
    abogadosVerificados,
    abogadosPendientes,
    ratingPromedio,
    casosEsteMes,
    ingresosTotales,
    ingresosEsteMes,
    totalCompras,
    trialsActivos,
    conversionesAPago,
    faqTotal,
    faqPublicadas,
    faqVistas
  ] = await Promise.all([
    // Usuarios
    db.user.count(),
    db.user.count({ where: { status: "active" } }),
    db.user.count({
      where: {
        createdAt: { gte: startMonth, lte: endMonth }
      }
    }),

    // Abogados
    db.lawyer.count({ where: { status: "verified" } }),
    db.lawyer.count({ where: { status: "pending" } }),
    db.lawyerReview.aggregate({ _avg: { rating: true } }),
    db.chatSession.count({
      where: {
        lawyerId: { not: null },
        startedAt: { gte: startMonth, lte: endMonth }
      }
    }),

    // Financiero
    db.purchase.aggregate({
      where: { status: "completed" },
      _sum: { amountCents: true }
    }),
    db.purchase.aggregate({
      where: {
        status: "completed",
        createdAt: { gte: startMonth, lte: endMonth }
      },
      _sum: { amountCents: true }
    }),
    db.purchase.count({ where: { status: "completed" } }),

    // Conversión
    db.userLicense.count({
      where: {
        license: { type: "trial" },
        status: "active"
      }
    }),
    db.purchase.count({
      where: {
        status: "completed",
        user: {
          userLicenses: {
            some: {
              license: { type: "trial" }
            }
          }
        }
      }
    }),

    // FAQ
    db.fAQ.count(),
    db.fAQ.count({ where: { publicada: true } }),
    db.fAQ.aggregate({ _sum: { vistas: true } })
  ]);

  const tasaConversion = trialsActivos > 0 
    ? (conversionesAPago / trialsActivos) * 100 
    : 0;

  const revenuePerUser = totalUsuarios > 0
    ? (ingresosTotales._sum.amountCents || 0) / totalUsuarios
    : 0;

  return {
    usuarios: {
      total: totalUsuarios,
      activos: usuariosActivos,
      nuevosEsteMes
    },
    abogados: {
      verificados: abogadosVerificados,
      pendientes: abogadosPendientes,
      ratingPromedio: ratingPromedio._avg.rating || 0,
      casosEsteMes
    },
    financiero: {
      ingresosTotales: ingresosTotales._sum.amountCents || 0,
      ingresosEsteMes: ingresosEsteMes._sum.amountCents || 0,
      totalCompras,
      revenuePerUser
    },
    conversion: {
      trialsActivos,
      conversionesAPago,
      tasaConversion
    },
    faq: {
      total: faqTotal,
      publicadas: faqPublicadas,
      totalVistas: faqVistas._sum.vistas || 0
    }
  };
}
