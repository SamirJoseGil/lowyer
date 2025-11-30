import { db } from "./db.server";

export type LicenseType = "trial" | "standard" | "premium";
export type AppliesTo = "ia" | "lawyer" | "both";

export const LICENSE_TYPES = {
  TRIAL: "trial",
  STANDARD: "standard", 
  PREMIUM: "premium",
} as const;

export const APPLIES_TO = {
  IA: "ia",
  LAWYER: "lawyer",
  BOTH: "both",
} as const;

// Configuración predefinida de licencias
export const LICENSE_CONFIGS = {
  [LICENSE_TYPES.TRIAL]: {
    name: "Trial Gratuito",
    type: "trial",
    hoursTotal: 2,
    validityDays: 7,
    appliesTo: "both",
    priceCents: 0,
    currency: "COP"
  },
  [LICENSE_TYPES.STANDARD]: {
    name: "Plan Estándar",
    type: "standard", 
    hoursTotal: 10,
    validityDays: 30,
    appliesTo: "both",
    priceCents: 5000000, // $50,000 COP
    currency: "COP"
  },
  [LICENSE_TYPES.PREMIUM]: {
    name: "Plan Premium",
    type: "premium",
    hoursTotal: 25,
    validityDays: 60,
    appliesTo: "both", 
    priceCents: 10000000, // $100,000 COP
    currency: "COP"
  }
} as const;

export async function initializeLicenses() {
  console.log(`🔧 Initializing license system...`);
  
  try {
    // Crear licencias predefinidas
    for (const [key, config] of Object.entries(LICENSE_CONFIGS)) {
      console.log(`📝 Creating/updating license: ${config.name}`);
      
      await db.license.upsert({
        where: { name: config.name },
        update: {
          type: config.type,
          hoursTotal: config.hoursTotal,
          validityDays: config.validityDays,
          appliesTo: config.appliesTo,
          priceCents: config.priceCents,
          currency: config.currency,
          active: true
        },
        create: {
          name: config.name,
          type: config.type,
          hoursTotal: config.hoursTotal,
          validityDays: config.validityDays,
          appliesTo: config.appliesTo,
          priceCents: config.priceCents,
          currency: config.currency,
          active: true
        },
      });
      
      console.log(`✅ License configured: ${config.name}`);
    }

    console.log("🎉 All licenses initialized successfully");
  } catch (error) {
    console.error("💥 Error initializing licenses:", error);
    throw error;
  }
}

export async function getUserActiveLicense(userId: string) {
    console.log(`🔍 [LICENSE] Checking active license for user: ${userId}`);
    
    const now = new Date();
    console.log(`⏰ [LICENSE] Current time: ${now.toISOString()}`);
    
    // Primero, marcar las licencias expiradas de este usuario
    const expiredCount = await db.userLicense.updateMany({
        where: {
            userId,
            status: "active",
            OR: [
                {
                    expiresAt: {
                        lte: now
                    }
                },
                {
                    hoursRemaining: {
                        lte: 0
                    }
                }
            ]
        },
        data: {
            status: "expired"
        }
    });
    
    if (expiredCount.count > 0) {
        console.log(`⚠️ [LICENSE] Marked ${expiredCount.count} expired licenses for user ${userId}`);
    }
    
    // Ahora buscar licencia activa válida
    const activeLicense = await db.userLicense.findFirst({
        where: {
            userId,
            status: "active",
            hoursRemaining: { gt: 0 },
            OR: [
                { expiresAt: null }, // Licencias infinitas
                { expiresAt: { gte: now } }
            ]
        },
        include: {
            license: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    
    if (activeLicense) {
        console.log(`✅ [LICENSE] Found active license: ${activeLicense.id}`);
        console.log(`   - Type: ${activeLicense.license.name}`);
        console.log(`   - Hours remaining: ${activeLicense.hoursRemaining}`);
        console.log(`   - Expires: ${activeLicense.expiresAt || 'Never'}`);
        console.log(`   - Status: ${activeLicense.status}`);
    } else {
        console.log(`❌ [LICENSE] No active license found for user ${userId}`);
        
        // Mostrar todas las licencias del usuario para debugging
        const allUserLicenses = await db.userLicense.findMany({
            where: { userId },
            include: { license: true }
        });
        
        console.log(`📋 [LICENSE] All licenses for user ${userId}:`, 
            allUserLicenses.map(l => ({
                id: l.id,
                type: l.license.name,
                status: l.status,
                hours: Number(l.hoursRemaining),
                expires: l.expiresAt
            }))
        );
    }
    
    return activeLicense;
}

/**
 * Marca licencias expiradas de un usuario específico
 */
async function markExpiredLicensesForUser(userId: string): Promise<void> {
    const now = new Date();
    
    await db.userLicense.updateMany({
        where: {
            userId,
            status: "active",
            OR: [
                {
                    expiresAt: {
                        lte: now
                    }
                },
                {
                    hoursRemaining: {
                        lte: 0
                    }
                }
            ]
        },
        data: {
            status: "expired"
        }
    });
}

export async function hasValidLicense(userId: string, accessType?: AppliesTo): Promise<boolean> {
  const activeLicense = await getUserActiveLicense(userId);
  
  if (!activeLicense) return false;
  
  // Si no se especifica tipo de acceso, cualquier licencia activa es válida
  if (!accessType) return true;
  
  // Verificar si la licencia permite el tipo de acceso solicitado
  const { appliesTo } = activeLicense.license;
  return appliesTo === "both" || appliesTo === accessType;
}

export async function consumeHours(userId: string, hoursUsed: number): Promise<boolean> {
  console.log(`⏱️ Consuming ${hoursUsed} hours for user ${userId}`);
  
  const activeLicense = await getUserActiveLicense(userId);
  
  if (!activeLicense) {
    console.log(`❌ No active license to consume hours from for user ${userId}`);
    return false;
  }
  
  const newHoursRemaining = Number(activeLicense.hoursRemaining) - hoursUsed;
  
  if (newHoursRemaining < 0) {
    console.log(`❌ Not enough hours remaining for user ${userId}. Requested: ${hoursUsed}, Available: ${activeLicense.hoursRemaining}`);
    return false;
  }
  
  try {
    await db.userLicense.update({
      where: { id: activeLicense.id },
      data: {
        hoursRemaining: newHoursRemaining,
        status: newHoursRemaining <= 0 ? "expired" : "active"
      }
    });
    
    console.log(`✅ Hours consumed successfully. User ${userId} now has ${newHoursRemaining}h remaining`);
    
    // Actualizar métricas del usuario
    await updateUserMetrics(userId, hoursUsed);
    
    return true;
  } catch (error) {
    console.error(`💥 Error consuming hours for user ${userId}:`, error);
    return false;
  }
}

export async function createUserLicense(
  userId: string, 
  licenseId: string, 
  source: string = "manual"
) {
  // Verificar que no tenga licencia activa
  const existingLicense = await getUserActiveLicense(userId);
  if (existingLicense) {
    throw new Error("User already has an active license");
  }
  
  const license = await db.license.findUnique({
    where: { id: licenseId }
  });
  
  if (!license) {
    throw new Error("License not found");
  }
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + license.validityDays);
  
  return db.userLicense.create({
    data: {
      userId,
      licenseId,
      hoursRemaining: license.hoursTotal,
      status: "active",
      expiresAt,
      source
    },
    include: {
      license: true
    }
  });
}

export async function updateUserMetrics(userId: string, hoursUsed: number) {
  console.log(`📈 Updating metrics for user ${userId}: +${hoursUsed}h`);
  
  await db.userMetric.upsert({
    where: { id: userId },
    update: {
      hoursUsedTotal: {
        increment: hoursUsed
      },
      sessionsCount: {
        increment: 1
      },
      lastSessionAt: new Date()
    },
    create: {
      userId,
      hoursUsedTotal: hoursUsed,
      sessionsCount: 1,
      lastSessionAt: new Date()
    }
  });
  
  console.log(`✅ Metrics updated for user ${userId}`);
}

// Helper function to serialize BigInt fields for JSON
export function serializeLicense(license: any) {
  if (!license) return null;
  
  return {
    ...license,
    hoursTotal: Number(license.hoursTotal),
    priceCents: Number(license.priceCents),
    hoursRemaining: license.hoursRemaining ? Number(license.hoursRemaining) : undefined
  };
}

export function serializeUserLicense(userLicense: any) {
  if (!userLicense) return null;
  
  return {
    ...userLicense,
    hoursRemaining: Number(userLicense.hoursRemaining),
    license: userLicense.license ? serializeLicense(userLicense.license) : null
  };
}

export async function getLicenseStats(userId: string) {
  console.log(`📊 Getting license stats for user ${userId}`);
  
  const activeLicense = await getUserActiveLicense(userId);
  const userMetrics = await db.userMetric.findUnique({
    where: { id: userId }
  });
  
  const stats = {
    activeLicense: activeLicense ? serializeUserLicense(activeLicense) : null,
    totalHoursUsed: userMetrics?.hoursUsedTotal || 0,
    totalSessions: userMetrics?.sessionsCount || 0,
    lastSession: userMetrics?.lastSessionAt
  };
  
  return {
    ...stats,
    totalHoursUsed: Number(stats.totalHoursUsed)
  };
}

export async function expireUserLicenses() {
  // Job para ejecutar periódicamente y expirar licencias
  const expiredLicenses = await db.userLicense.findMany({
    where: {
      status: "active",
      OR: [
        { expiresAt: { lt: new Date() } },
        { hoursRemaining: { lte: 0 } }
      ]
    }
  });
  
  for (const license of expiredLicenses) {
    await db.userLicense.update({
      where: { id: license.id },
      data: { status: "expired" }
    });
  }
  
  return expiredLicenses.length;
}
