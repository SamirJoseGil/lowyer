import { db } from "~/lib/db.server";

export async function createNotification(data: {
  userId: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  data?: any;
  actionUrl?: string;
  prioridad?: string;
}) {
  console.log(`📝 Creating notification for user ${data.userId}: ${data.titulo}`);
  
  const notification = await db.notificacion.create({
    data: {
      userId: data.userId,
      tipo: data.tipo,
      titulo: data.titulo,
      mensaje: data.mensaje,
      data: data.data,
      actionUrl: data.actionUrl,
      prioridad: data.prioridad || 'normal',
    }
  });
  
  console.log(`✅ Notification created: ${notification.id}`);
  return notification;
}

export async function getUnreadNotifications(userId: string) {
  return db.notificacion.findMany({
    where: {
      userId,
      leida: false
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
}

export async function getAllNotifications(userId: string, limit: number = 50) {
  return db.notificacion.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  return db.notificacion.updateMany({
    where: {
      id: notificationId,
      userId
    },
    data: {
      leida: true,
      readAt: new Date()
    }
  });
}

export async function markAllAsRead(userId: string) {
  return db.notificacion.updateMany({
    where: {
      userId,
      leida: false
    },
    data: {
      leida: true,
      readAt: new Date()
    }
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return db.notificacion.count({
    where: {
      userId,
      leida: false
    }
  });
}

export async function deleteNotification(notificationId: string, userId: string) {
  return db.notificacion.deleteMany({
    where: {
      id: notificationId,
      userId
    }
  });
}

export async function getOrCreatePreferences(userId: string) {
  let prefs = await db.preferenciaNotificacion.findUnique({
    where: { userId }
  });
  
  if (!prefs) {
    prefs = await db.preferenciaNotificacion.create({
      data: { userId }
    });
  }
  
  return prefs;
}

export async function updatePreferences(
  userId: string,
  preferences: {
    emailNotificaciones?: boolean;
    pushNotificaciones?: boolean;
    nuevosMensajes?: boolean;
    casosAsignados?: boolean;
    actualizacionesSistema?: boolean;
  }
) {
  return db.preferenciaNotificacion.upsert({
    where: { userId },
    update: preferences,
    create: {
      userId,
      ...preferences
    }
  });
}
