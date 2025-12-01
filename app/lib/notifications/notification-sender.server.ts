import { db } from "~/lib/db.server";
import { sseManager } from "./sse-manager.server";
import { NOTIFICATION_TYPES, type NotificationData } from "./notification-types";

export { NOTIFICATION_TYPES };

export async function sendNotification(
  userId: string,
  tipo: string,
  titulo: string,
  mensaje: string,
  options: {
    data?: any;
    actionUrl?: string;
    prioridad?: 'baja' | 'normal' | 'alta' | 'urgente';
  } = {}
) {
  console.log(`🔔 Sending notification to user ${userId}: ${titulo}`);
  
  try {
    // Verificar preferencias del usuario
    const prefs = await db.preferenciaNotificacion.findUnique({
      where: { userId }
    });
    
    // Si tiene deshabilitadas las notificaciones, no enviar
    if (prefs && !prefs.pushNotificaciones) {
      console.log(`🔕 User ${userId} has notifications disabled`);
      return null;
    }
    
    // Crear notificación en BD
    const notification = await db.notificacion.create({
      data: {
        userId,
        tipo,
        titulo,
        mensaje,
        data: options.data,
        actionUrl: options.actionUrl,
        prioridad: options.prioridad || 'normal',
      }
    });
    
    // Enviar a través de SSE si está conectado
    sseManager.sendNotification(userId, notification);
    
    console.log(`✅ Notification sent: ${notification.id}`);
    
    return notification;
  } catch (error) {
    console.error(`❌ Error sending notification to ${userId}:`, error);
    return null;
  }
}

// Funciones de ayuda específicas
export async function notifyNewMessage(
  userId: string,
  senderName: string,
  chatSessionId: string
) {
  return sendNotification(
    userId,
    NOTIFICATION_TYPES.NUEVO_MENSAJE,
    'Nuevo mensaje',
    `${senderName} te ha enviado un mensaje`,
    {
      actionUrl: `/chat/${chatSessionId}`,
      prioridad: 'alta',
      data: { chatSessionId, senderName }
    }
  );
}

export async function notifyCaseAssigned(
  lawyerId: string,
  userName: string,
  chatSessionId: string
) {
  return sendNotification(
    lawyerId,
    NOTIFICATION_TYPES.CASO_ASIGNADO,
    'Nuevo caso asignado',
    `${userName} necesita tu ayuda legal`,
    {
      actionUrl: `/abogado/casos/${chatSessionId}`,
      prioridad: 'urgente',
      data: { chatSessionId, userName }
    }
  );
}

export async function notifyLowHours(userId: string, hoursRemaining: number) {
  return sendNotification(
    userId,
    NOTIFICATION_TYPES.HORAS_BAJAS,
    'Pocas horas restantes',
    `Te quedan ${hoursRemaining.toFixed(1)} horas en tu licencia`,
    {
      actionUrl: '/licencias',
      prioridad: 'normal',
      data: { hoursRemaining }
    }
  );
}

export async function notifyLicenseExpiring(userId: string, daysRemaining: number) {
  return sendNotification(
    userId,
    NOTIFICATION_TYPES.LICENCIA_EXPIRA,
    'Tu licencia está por vencer',
    `Tu licencia vence en ${daysRemaining} día${daysRemaining > 1 ? 's' : ''}`,
    {
      actionUrl: '/licencias',
      prioridad: 'alta',
      data: { daysRemaining }
    }
  );
}
