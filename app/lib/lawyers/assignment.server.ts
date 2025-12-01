import { db } from "~/lib/db.server";
import { notifyCaseAssigned } from "~/lib/notifications/notification-sender.server";

export async function assignLawyerToCase(
  chatSessionId: string,
  priority: 'baja' | 'normal' | 'alta' | 'urgente' = 'normal'
) {
  console.log(`🎯 Assigning lawyer to case ${chatSessionId} with priority ${priority}`);
  
  const availableLawyer = await findBestAvailableLawyer(priority);
  
  if (!availableLawyer) {
    console.log(`❌ No lawyers available for case ${chatSessionId}`);
    return { success: false, error: 'No hay abogados disponibles' };
  }
  
  const assignment = await db.asignacionCaso.create({
    data: {
      chatSessionId,
      lawyerId: availableLawyer.id,
      priority,
      status: 'pendiente'
    }
  });
  
  await db.chatSession.update({
    where: { id: chatSessionId },
    data: {
      lawyerId: availableLawyer.id,
      priority,
      metadata: {
        assignedAt: new Date()
      }
    }
  });
  
  await notifyCaseAssigned(
    availableLawyer.userId,
    'Nuevo usuario',
    chatSessionId
  );
  
  console.log(`✅ Case assigned to lawyer ${availableLawyer.id}`);
  
  return { success: true, lawyerId: availableLawyer.id };
}

async function findBestAvailableLawyer(priority: string) {
  const lawyers = await db.lawyer.findMany({
    where: {
      status: 'verified',
      user: {
        status: 'active'
      }
    },
    include: {
      user: true,
      asignaciones: {
        where: {
          status: {
            in: ['pendiente', 'aceptado']
          }
        }
      },
      reviews: {
        select: {
          rating: true
        }
      }
    }
  });
  
  const eligibleLawyers = lawyers.filter(lawyer => {
    const activeCases = lawyer.asignaciones.length;
    return activeCases < lawyer.maxConcurrentCases;
  });
  
  if (eligibleLawyers.length === 0) return null;
  
  const scoredLawyers = eligibleLawyers.map(lawyer => {
    const avgRating = lawyer.reviews.length > 0
      ? lawyer.reviews.reduce((sum, r) => sum + r.rating, 0) / lawyer.reviews.length
      : 3.0;
    
    const caseLoad = lawyer.asignaciones.length;
    const maxLoad = lawyer.maxConcurrentCases;
    const loadFactor = 1 - (caseLoad / maxLoad);
    
    const score = (avgRating / 5) * 0.5 + loadFactor * 0.5;
    
    return { lawyer, score };
  });
  
  scoredLawyers.sort((a, b) => b.score - a.score);
  
  return scoredLawyers[0].lawyer;
}

export async function acceptCase(lawyerId: string, chatSessionId: string) {
  await db.asignacionCaso.update({
    where: { chatSessionId },
    data: {
      status: 'aceptado',
      acceptedAt: new Date()
    }
  });
  
  console.log(`✅ Lawyer ${lawyerId} accepted case ${chatSessionId}`);
}

export async function rejectCase(
  lawyerId: string,
  chatSessionId: string,
  reason: string
) {
  await db.asignacionCaso.update({
    where: { chatSessionId },
    data: {
      status: 'rechazado',
      rejectionReason: reason
    }
  });
  
  await assignLawyerToCase(chatSessionId);
  
  console.log(`❌ Lawyer ${lawyerId} rejected case ${chatSessionId}`);
}

export async function completeCase(lawyerId: string, chatSessionId: string) {
  await db.asignacionCaso.update({
    where: { chatSessionId },
    data: {
      status: 'completado',
      completedAt: new Date()
    }
  });
  
  await db.chatSession.update({
    where: { id: chatSessionId },
    data: {
      status: 'closed',
      endedAt: new Date()
    }
  });
  
  console.log(`✅ Case ${chatSessionId} completed by lawyer ${lawyerId}`);
}
