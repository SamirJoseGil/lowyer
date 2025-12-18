import { db } from "../db.server";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  success: boolean
): Promise<void> {
  await db.loginAttempt.create({
    data: {
      userId: null, // Se puede vincular después si el login es exitoso
      ipAddress,
      status: success ? "success" : "failed",
      createdAt: new Date(),
    },
  });
  
  console.log(`🔐 Login attempt recorded: ${email} from ${ipAddress} - ${success ? "SUCCESS" : "FAILED"}`);
}

export async function isAccountLocked(email: string): Promise<{
  locked: boolean;
  remainingTime?: number;
  attempts?: number;
}> {
  const user = await db.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    return { locked: false };
  }
  
  // Contar intentos fallidos recientes
  const since = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000);
  
  const failedAttempts = await db.loginAttempt.count({
    where: {
      userId: user.id,
      status: "failed",
      createdAt: {
        gte: since,
      },
    },
  });
  
  if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
    // Obtener el intento más reciente
    const lastAttempt = await db.loginAttempt.findFirst({
      where: {
        userId: user.id,
        status: "failed",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    if (lastAttempt) {
      const timeSinceLast = Date.now() - lastAttempt.createdAt.getTime();
      const remainingLockout = (LOCKOUT_DURATION_MINUTES * 60 * 1000) - timeSinceLast;
      
      if (remainingLockout > 0) {
        console.warn(`⚠️ Account locked: ${email} - ${failedAttempts} failed attempts`);
        
        return {
          locked: true,
          remainingTime: Math.ceil(remainingLockout / 1000 / 60), // en minutos
          attempts: failedAttempts,
        };
      }
    }
  }
  
  return { locked: false, attempts: failedAttempts };
}

export async function clearLoginAttempts(userId: string): Promise<void> {
  await db.loginAttempt.deleteMany({
    where: {
      userId,
      status: "failed",
    },
  });
  
  console.log(`✅ Login attempts cleared for user: ${userId}`);
}
