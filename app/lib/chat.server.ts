import { db } from "./db.server";
import { hasValidLicense } from "./licenses.server";
import { startSession, endSession } from "./hours-tracking.server";
import { generateAIResponse } from "./ai-models.server";
import { getOrCreateConversation, addMessage, formatHistoryForAI } from "./conversation.server";
import { notifyNewMessage } from "./notifications/notification-sender.server";

export type ChatParticipant = "user" | "abogado" | "admin" | "ia";

export async function createChatSession(
  userId: string,
  chatType: "ia" | "lawyer" = "lawyer"
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  console.log(`💬 Creating chat session for user ${userId}, type: ${chatType}`);
  
  try {
    // Verificar licencia válida
    const accessType = chatType === "ia" ? "ia" : "lawyer";
    const hasLicense = await hasValidLicense(userId, accessType);
    
    if (!hasLicense) {
      console.log(`❌ User ${userId} has no valid license for ${chatType} chat`);
      return {
        success: false,
        error: "No tienes una licencia válida para este tipo de chat"
      };
    }

    // Verificar si ya tiene una sesión activa
    const activeSession = await db.chatSession.findFirst({
      where: {
        userId,
        status: "active"
      }
    });

    if (activeSession) {
      console.log(`♻️ User ${userId} already has active session: ${activeSession.id}`);
      return {
        success: true,
        sessionId: activeSession.id
      };
    }

    // Obtener licencia activa del usuario
    const userLicense = await db.userLicense.findFirst({
      where: {
        userId,
        status: "active",
        hoursRemaining: { gt: 0 }
      }
    });

    if (!userLicense) {
      console.log(`❌ User ${userId} has no hours remaining`);
      return {
        success: false,
        error: "No tienes horas disponibles en tu licencia"
      };
    }

    // Asignar abogado si es chat de abogado
    let assignedLawyerId = null;
    if (chatType === "lawyer") {
      const availableLawyer = await getAvailableLawyer();
      if (!availableLawyer) {
        console.log(`❌ No lawyers available for user ${userId}`);
        return {
          success: false,
          error: "No hay abogados disponibles en este momento"
        };
      }
      assignedLawyerId = availableLawyer.id;
      console.log(`👨‍💼 Assigned lawyer ${assignedLawyerId} to user ${userId}`);
    }

    // Crear nueva sesión de chat
    const chatSession = await db.chatSession.create({
      data: {
        userId,
        lawyerId: assignedLawyerId,
        licenseInstanceId: userLicense.id,
        status: "active",
        metadata: {
          chatType,
          startedAt: new Date()
        }
      }
    });

    console.log(`✅ Chat session created: ${chatSession.id} for user ${userId}`);

    // Iniciar tracking de sesión para horas
    const sessionStart = await startSession(userId, chatType === "ia" ? "chat_ia" : "chat_lawyer", chatSession.id);
    
    if (!sessionStart.success) {
      console.log(`❌ Failed to start hour tracking for session ${chatSession.id}`);
      // Limpiar sesión si falla el tracking
      await db.chatSession.delete({ where: { id: chatSession.id } });
      return {
        success: false,
        error: sessionStart.error
      };
    }

    console.log(`⏱️ Hour tracking started for session ${chatSession.id}`);

    return {
      success: true,
      sessionId: chatSession.id
    };

  } catch (error) {
    console.error(`💥 Error creating chat session for user ${userId}:`, error);
    return {
      success: false,
      error: "Error interno al crear la sesión de chat"
    };
  }
}

export async function sendMessage(
  sessionId: string,
  senderId: string,
  content: string,
  senderRole: ChatParticipant
): Promise<{ success: boolean; message?: any; aiResponse?: any; error?: string }> {
  console.log(`📤 Sending message in session ${sessionId} from ${senderRole}`);
  
  try {
    // Verificar que la sesión existe y está activa
    const session = await db.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        lawyer: { include: { user: true } }
      }
    });

    if (!session) {
      return { success: false, error: "Sesión de chat no encontrada" };
    }

    if (session.status !== "active") {
      return { success: false, error: "La sesión de chat no está activa" };
    }

    // Verificar permisos del remitente
    const canSend = await verifyMessagePermissions(session, senderId, senderRole);
    if (!canSend) {
      return { success: false, error: "No tienes permisos para enviar mensajes" };
    }

    // Validar contenido del mensaje
    const contentValidation = validateMessageContent(content);
    if (!contentValidation.valid) {
      return { success: false, error: contentValidation.error };
    }

    // Crear mensaje del usuario en la tabla messages
    const userMessage = await db.message.create({
      data: {
        chatSessionId: sessionId,
        senderId,
        senderRole,
        content: content.trim(),
        status: "sent"
      },
      include: {
        sender: {
          include: {
            profile: true
          }
        }
      }
    });

    console.log(`✅ User message created: ${userMessage.id}`);

    // 🔔 NUEVO: Enviar notificación al destinatario
    if (session.userId !== senderId) {
      // Notificar al usuario si el mensaje es del abogado
      const senderName = userMessage.sender?.profile?.firstName 
        ? `${userMessage.sender.profile.firstName} ${userMessage.sender.profile.lastName || ''}`
        : 'Tu abogado';
      
      await notifyNewMessage(session.userId, senderName, sessionId);
    } else if (session.lawyerId && session.lawyer?.userId) {
      // Notificar al abogado si el mensaje es del usuario
      const senderName = userMessage.sender?.profile?.firstName 
        ? `${userMessage.sender.profile.firstName} ${userMessage.sender.profile.lastName || ''}`
        : 'Un usuario';
      
      await notifyNewMessage(session.lawyer.userId, senderName, sessionId);
    }

    let aiResponse = null;

    // Si es un chat con IA, generar respuesta usando el nuevo sistema
    if (session.metadata && typeof session.metadata === "object" && 
        session.metadata !== null && (session.metadata as any).chatType === "ia" && 
        senderRole === "user") {
      
      console.log(`🤖 Generating AI response for session ${sessionId}`);
      
      try {
        // Obtener o crear conversación para el usuario
        const conversation = await getOrCreateConversation(senderId);
        
        // Agregar mensaje del usuario a la conversación
        await addMessage(conversation.id, "usuario", content);
        
        // Obtener historial formateado para la IA
        const conversationHistory = await formatHistoryForAI(conversation.id);
        
        console.log(`📚 Using conversation history with ${conversationHistory.length} messages`);

        // Generar respuesta con el sistema multi-modelo
        const aiResult = await generateAIResponse(
          content,
          conversationHistory,
          {
            temperature: 0.7,
            maxTokens: 2048
          }
        );

        if (aiResult.success && aiResult.response) {
          console.log(`🎯 AI response generated successfully with ${aiResult.model}`);
          
          // Agregar respuesta de la IA a la conversación
          await addMessage(conversation.id, "ia", aiResult.response);
          
          // Crear mensaje de respuesta de IA en el chat
          aiResponse = await db.message.create({
            data: {
              chatSessionId: sessionId,
              senderId: null, // IA no tiene senderId
              senderRole: "ia",
              content: aiResult.response,
              status: "sent"
            }
          });

          console.log(`✅ AI response message created: ${aiResponse.id}`);
        } else {
          console.log(`❌ Failed to generate AI response: ${aiResult.error}`);
          
          // Crear mensaje de error
          aiResponse = await db.message.create({
            data: {
              chatSessionId: sessionId,
              senderId: null,
              senderRole: "ia",
              content: "Lo siento, no pude procesar tu consulta en este momento. Por favor, intenta reformular tu pregunta o contacta con un abogado.",
              status: "sent"
            }
          });
        }
      } catch (aiError) {
        console.error(`💥 Error generating AI response:`, aiError);
        
        // Crear mensaje de error de fallback
        aiResponse = await db.message.create({
          data: {
            chatSessionId: sessionId,
            senderId: null,
            senderRole: "ia",
            content: "Disculpa, hay un problema técnico con el asistente de IA. Por favor, intenta más tarde o contacta con un abogado.",
            status: "sent"
          }
        });
      }
    }

    return {
      success: true,
      message: userMessage,
      aiResponse
    };

  } catch (error) {
    console.error(`💥 Error sending message in session ${sessionId}:`, error);
    return {
      success: false,
      error: "Error al enviar el mensaje"
    };
  }
}

export async function getChatMessages(
  sessionId: string,
  userId: string,
  page: number = 1,
  limit: number = 50
) {
  try {
    // Verificar que el usuario tiene acceso a esta sesión
    const session = await db.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        lawyer: { include: { user: true } }
      }
    });

    if (!session) {
      throw new Error("Sesión no encontrada");
    }

    const hasAccess = session.userId === userId || 
                     session.lawyer?.userId === userId ||
                     await isAdminUser(userId);

    if (!hasAccess) {
      throw new Error("No tienes acceso a esta sesión");
    }

    const offset = (page - 1) * limit;

    const messages = await db.message.findMany({
      where: { chatSessionId: sessionId },
      include: {
        sender: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: limit
    });

    return messages;

  } catch (error) {
    console.error("Error getting chat messages:", error);
    throw error;
  }
}

export async function closeChatSession(
  sessionId: string,
  userId: string,
  summary?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await db.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        lawyer: { include: { user: true } }
      }
    });

    if (!session) {
      return { success: false, error: "Sesión no encontrada" };
    }

    // Verificar permisos para cerrar la sesión
    const canClose = session.userId === userId || 
                    session.lawyer?.userId === userId ||
                    await isAdminUser(userId);

    if (!canClose) {
      return { success: false, error: "No tienes permisos para cerrar esta sesión" };
    }

    // Finalizar tracking de sesión
    const endResult = await endSession(sessionId);
    
    // Cerrar sesión en la base de datos
    await db.chatSession.update({
      where: { id: sessionId },
      data: {
        status: "closed",
        endedAt: new Date(),
        summary: summary || "Sesión finalizada",
        metadata: {
          ...((typeof session.metadata === "object" && session.metadata !== null) ? session.metadata : {}),
          endedAt: new Date(),
          hoursConsumed: endResult.hoursConsumed || 0
        }
      }
    });

    return { success: true };

  } catch (error) {
    console.error("Error closing chat session:", error);
    return { success: false, error: "Error al cerrar la sesión" };
  }
}

async function getAvailableLawyer() {
  // Buscar un abogado verificado y sin sesiones activas
  return db.lawyer.findFirst({
    where: {
      status: "verified",
      user: {
        status: "active"
      }
    },
    include: {
      user: true,
      chatSessions: {
        where: {
          status: "active"
        }
      }
    },
    orderBy: {
      user: {
        lastLogin: 'desc'
      }
    }
  });
}

async function verifyMessagePermissions(
  session: any,
  senderId: string,
  senderRole: ChatParticipant
): Promise<boolean> {
  switch (senderRole) {
    case "user":
      return session.userId === senderId;
    case "abogado":
      return session.lawyer?.userId === senderId;
    case "admin":
      return await isAdminUser(senderId);
    case "ia":
      return true; // IA puede enviar mensajes
    default:
      return false;
  }
}

function validateMessageContent(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: "El mensaje no puede estar vacío" };
  }

  if (content.length > 1000) {
    return { valid: false, error: "El mensaje es demasiado largo (máximo 1000 caracteres)" };
  }

  // Filtro básico de contenido inapropiado
  const inappropriateWords = ["spam", "scam"];
  const hasInappropriate = inappropriateWords.some(word => 
    content.toLowerCase().includes(word.toLowerCase())
  );

  if (hasInappropriate) {
    return { valid: false, error: "El mensaje contiene contenido inapropiado" };
  }

  return { valid: true };
}

async function isAdminUser(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  return user?.role?.name === "admin" || user?.role?.name === "superadmin";
}

export async function getUserActiveChatSession(userId: string) {
  return db.chatSession.findFirst({
    where: {
      userId,
      status: "active"
    },
    include: {
      lawyer: {
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      },
      licenseInstance: {
        include: {
          license: true
        }
      }
    }
  });
}

export async function getChatSessionStats(sessionId: string) {
  const [messageCount, session] = await Promise.all([
    db.message.count({
      where: { chatSessionId: sessionId }
    }),
    db.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        licenseInstance: true
      }
    })
  ]);

  const duration = session?.endedAt && session?.startedAt
    ? new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()
    : Date.now() - new Date(session?.startedAt || 0).getTime();

  return {
    messageCount,
    duration: Math.round(duration / 1000 / 60), // en minutos
    hoursRemaining: session?.licenseInstance?.hoursRemaining || 0
  };
}
