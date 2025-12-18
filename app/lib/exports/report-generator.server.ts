import { db } from "../db.server";
import { startOfMonth, endOfMonth, format } from "date-fns";

export async function generateUserReport(startDate: Date, endDate: Date) {
  const users = await db.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      profile: true,
      role: true,
      userLicenses: {
        where: { status: "active" }
      },
      _count: {
        select: {
          chatSessions: true,
          purchases: true
        }
      }
    }
  });

  return users.map(user => ({
    id: user.id,
    email: user.email,
    nombre: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'N/A',
    rol: user.role.name,
    fechaRegistro: format(user.createdAt, 'yyyy-MM-dd HH:mm'),
    ultimoAcceso: user.lastLogin ? format(user.lastLogin, 'yyyy-MM-dd HH:mm') : 'Nunca',
    licenciaActiva: user.userLicenses.length > 0 ? 'Sí' : 'No',
    sesionesChat: user._count.chatSessions,
    compras: user._count.purchases,
    estado: user.status
  }));
}

export async function generateLawyerReport(startDate: Date, endDate: Date) {
  const lawyers = await db.lawyer.findMany({
    where: {
      user: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    },
    include: {
      user: {
        include: {
          profile: true
        }
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
    }
  });

  return lawyers.map(lawyer => {
    const avgRating = lawyer.reviews.length > 0
      ? lawyer.reviews.reduce((acc, r) => acc + r.rating, 0) / lawyer.reviews.length
      : 0;

    return {
      id: lawyer.id,
      nombre: lawyer.user.profile 
        ? `${lawyer.user.profile.firstName} ${lawyer.user.profile.lastName}`
        : lawyer.user.email,
      email: lawyer.user.email,
      especialidad: lawyer.specialty || 'General',
      añosExperiencia: lawyer.experienceYears || 0,
      estado: lawyer.status,
      casosAtendidos: lawyer._count.chatSessions,
      reviews: lawyer._count.reviews,
      ratingPromedio: avgRating.toFixed(2),
      tarjetaProfesional: lawyer.professionalCardNumber || 'N/A'
    };
  });
}

export async function generateFinancialReport(startDate: Date, endDate: Date) {
  const purchases = await db.purchase.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: "completed"
    },
    include: {
      user: {
        include: {
          profile: true
        }
      },
      license: true
    }
  });

  return purchases.map(purchase => ({
    id: purchase.id,
    fecha: format(purchase.createdAt, 'yyyy-MM-dd HH:mm'),
    usuario: purchase.user.profile
      ? `${purchase.user.profile.firstName} ${purchase.user.profile.lastName}`
      : purchase.user.email,
    email: purchase.user.email,
    licencia: purchase.license?.name || 'N/A',
    monto: (purchase.amountCents / 100).toFixed(2),
    moneda: purchase.currency,
    metodoPago: purchase.paymentMethod || 'N/A',
    transaccionId: purchase.wompiTransactionId || 'N/A'
  }));
}

export async function generateFAQReport(startDate: Date, endDate: Date) {
  const faqs = await db.fAQ.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      revisor: {
        include: {
          profile: true
        }
      }
    }
  });

  return faqs.map(faq => ({
    id: faq.id,
    pregunta: faq.pregunta,
    categoria: faq.categoria,
    estado: faq.estado,
    publicada: faq.publicada ? 'Sí' : 'No',
    vistas: faq.vistas,
    votosUtiles: faq.votosUtiles,
    relevancia: faq.relevancia,
    procesadaPorIA: faq.procesadaPorIA ? 'Sí' : 'No',
    confianzaIA: faq.confianzaIA ? (faq.confianzaIA * 100).toFixed(1) + '%' : 'N/A',
    fechaCreacion: format(faq.createdAt, 'yyyy-MM-dd'),
    fechaPublicacion: faq.publicadaAt ? format(faq.publicadaAt, 'yyyy-MM-dd') : 'N/A',
    revisor: faq.revisor?.profile
      ? `${faq.revisor.profile.firstName} ${faq.revisor.profile.lastName}`
      : 'N/A'
  }));
}
