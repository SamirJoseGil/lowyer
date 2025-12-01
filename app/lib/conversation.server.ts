import { db } from "./db.server";

const MAX_MESSAGES_CONTEXT = 20;

/**
 * Sistema de conversaciones con ventana de contexto limitada
 */

export async function getOrCreateConversation(userId: string) {
  console.log(`💬 Getting/creating conversation for user ${userId}`);
  
  // Buscar conversación activa
  let conversation = await db.conversacion.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  // Si no existe, crear una nueva
  if (!conversation) {
    conversation = await db.conversacion.create({
      data: { userId }
    });
    console.log(`✅ New conversation created: ${conversation.id}`);
  }

  return conversation;
}

export async function addMessage(
  conversacionId: string,
  rol: "usuario" | "ia",
  mensaje: string
) {
  console.log(`➕ Adding ${rol} message to conversation ${conversacionId}`);
  
  // Agregar nuevo mensaje
  const newMessage = await db.mensaje.create({
    data: {
      conversacionId,
      rol,
      mensaje
    }
  });

  // Mantener solo los últimos 20 mensajes
  await cleanupOldMessages(conversacionId);

  return newMessage;
}

async function cleanupOldMessages(conversacionId: string) {
  // Contar mensajes actuales
  const totalMessages = await db.mensaje.count({
    where: { conversacionId }
  });

  // Si excede el límite, eliminar los más antiguos
  if (totalMessages > MAX_MESSAGES_CONTEXT) {
    const messagesToDelete = totalMessages - MAX_MESSAGES_CONTEXT;
    
    // Obtener IDs de mensajes más antiguos
    const oldMessages = await db.mensaje.findMany({
      where: { conversacionId },
      orderBy: { timestamp: 'asc' },
      take: messagesToDelete,
      select: { id: true }
    });

    // Eliminar mensajes antiguos
    await db.mensaje.deleteMany({
      where: {
        id: {
          in: oldMessages.map(m => m.id)
        }
      }
    });

    console.log(`🗑️ Deleted ${messagesToDelete} old messages from conversation`);
  }
}

export async function getConversationHistory(conversacionId: string) {
  const messages = await db.mensaje.findMany({
    where: { conversacionId },
    orderBy: { timestamp: 'asc' },
    take: MAX_MESSAGES_CONTEXT
  });

  return messages;
}

export async function formatHistoryForAI(conversacionId: string): Promise<string[]> {
  const messages = await getConversationHistory(conversacionId);
  
  return messages.map(m => {
    const role = m.rol === "usuario" ? "Usuario" : "Asistente Legal";
    return `${role}: ${m.mensaje}`;
  });
}

export async function deleteConversation(conversacionId: string) {
  return db.conversacion.delete({
    where: { id: conversacionId }
  });
}

export async function clearConversation(conversacionId: string) {
  // Eliminar todos los mensajes pero mantener la conversación
  await db.mensaje.deleteMany({
    where: { conversacionId }
  });
  
  console.log(`🧹 Cleared all messages from conversation ${conversacionId}`);
}
