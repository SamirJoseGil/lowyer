import { db } from "./db.server";
import { consumeHours, hasValidLicense } from "./licenses.server";

export type SessionType = "chat_ia" | "chat_lawyer";

interface ActiveSession {
  userId: string;
  sessionId: string;
  startTime: Date;
  sessionType: SessionType;
}

// En memoria para sessions activas (en producción usar Redis)
const activeSessions = new Map<string, ActiveSession>();

export async function startSession(
  userId: string, 
  sessionType: SessionType,
  chatSessionId?: string
): Promise<{ success: boolean; error?: string; sessionId?: string }> {
  
  // Verificar licencia válida
  const accessType = sessionType === "chat_ia" ? "ia" : "lawyer";
  const hasLicense = await hasValidLicense(userId, accessType);
  
  if (!hasLicense) {
    return { 
      success: false, 
      error: "No tienes una licencia válida para este tipo de acceso" 
    };
  }
  
  const sessionId = chatSessionId || `session_${userId}_${Date.now()}`;
  
  // Verificar si ya tiene una sesión activa
  const existingSession = Array.from(activeSessions.values())
    .find(session => session.userId === userId);
    
  if (existingSession) {
    return { 
      success: false, 
      error: "Ya tienes una sesión activa" 
    };
  }
  
  // Crear nueva sesión
  activeSessions.set(sessionId, {
    userId,
    sessionId,
    startTime: new Date(),
    sessionType
  });
  
  return { success: true, sessionId };
}

export async function endSession(sessionId: string): Promise<{ success: boolean; hoursConsumed?: number; error?: string }> {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return { success: false, error: "Sesión no encontrada" };
  }
  
  const endTime = new Date();
  const durationMs = endTime.getTime() - session.startTime.getTime();
  const hoursConsumed = durationMs / (1000 * 60 * 60); // Convertir a horas
  
  // Redondear a 0.1 horas mínimo (6 minutos)
  const roundedHours = Math.max(0.1, Math.round(hoursConsumed * 10) / 10);
  
  try {
    // Consumir horas de la licencia
    const consumed = await consumeHours(session.userId, roundedHours);
    
    if (!consumed) {
      return { 
        success: false, 
        error: "No se pudieron descontar las horas de tu licencia" 
      };
    }
    
    // Registrar en audit log
    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: `Sesión ${session.sessionType} finalizada`,
        meta: {
          sessionId,
          duration: durationMs,
          hoursConsumed: roundedHours,
          sessionType: session.sessionType
        }
      }
    });
    
    // Remover de sesiones activas
    activeSessions.delete(sessionId);
    
    return { 
      success: true, 
      hoursConsumed: roundedHours 
    };
    
  } catch (error) {
    console.error("Error ending session:", error);
    return { 
      success: false, 
      error: "Error al finalizar la sesión" 
    };
  }
}

export function getActiveSession(userId: string): ActiveSession | undefined {
  return Array.from(activeSessions.values())
    .find(session => session.userId === userId);
}

export function getAllActiveSessions(): ActiveSession[] {
  return Array.from(activeSessions.values());
}

export async function calculateCurrentSessionTime(userId: string): Promise<number> {
  const session = getActiveSession(userId);
  
  if (!session) return 0;
  
  const now = new Date();
  const durationMs = now.getTime() - session.startTime.getTime();
  return durationMs / (1000 * 60 * 60); // Horas
}

export async function forceEndAllSessions() {
  // Para mantenimiento o casos de emergencia
  const sessions = Array.from(activeSessions.keys());
  
  for (const sessionId of sessions) {
    await endSession(sessionId);
  }
  
  return sessions.length;
}

// Job para limpiar sesiones zombi (más de 24 horas activas)
export async function cleanupZombieSessions() {
  const now = new Date();
  const maxDuration = 24 * 60 * 60 * 1000; // 24 horas en ms
  
  let cleaned = 0;
  
  for (const [sessionId, session] of activeSessions.entries()) {
    const duration = now.getTime() - session.startTime.getTime();
    
    if (duration > maxDuration) {
      await endSession(sessionId);
      cleaned++;
    }
  }
  
  return cleaned;
}
