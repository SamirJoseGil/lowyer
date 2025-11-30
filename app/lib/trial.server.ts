import { db } from "./db.server";
import { LICENSE_TYPES, createUserLicense, initializeLicenses } from "./licenses.server";

export async function hasUsedTrial(userId: string): Promise<boolean> {
  const trialLicense = await db.userLicense.findFirst({
    where: {
      userId,
      source: "trial"
    }
  });
  
  console.log(`🔍 Trial check for user ${userId}: ${trialLicense ? 'Already used' : 'Available'}`);
  return !!trialLicense;
}

export async function createTrialLicense(userId: string) {
  console.log(`🎁 Creating trial license for user ${userId}`);
  
  // Verificar si ya usó el trial
  const alreadyUsedTrial = await hasUsedTrial(userId);
  if (alreadyUsedTrial) {
    console.log(`❌ User ${userId} already used their trial`);
    throw new Error("User has already used their trial");
  }
  
  // Obtener la licencia trial
  let trialLicense = await db.license.findFirst({
    where: { type: LICENSE_TYPES.TRIAL }
  });
  
  if (!trialLicense) {
    console.log(`❌ Trial license not found in database, attempting to initialize licenses...`);
    
    // Intentar inicializar licencias automáticamente
    try {
      await initializeLicenses();
      console.log(`🔧 Licenses initialized, trying to find trial license again...`);
      
      trialLicense = await db.license.findFirst({
        where: { type: LICENSE_TYPES.TRIAL }
      });
      
      if (!trialLicense) {
        console.log(`❌ Trial license still not found after initialization`);
        throw new Error("Trial license not found even after initialization. Please contact support.");
      }
    } catch (initError) {
      console.error(`💥 Error initializing licenses:`, initError);
      throw new Error("Error setting up trial license. Please contact support.");
    }
  }
  
  console.log(`📄 Found trial license: ${trialLicense.name} (${trialLicense.hoursTotal}h)`);
  
  // Crear licencia trial para el usuario
  const userLicense = await createUserLicense(userId, trialLicense.id, "trial");
  console.log(`✅ Trial license created successfully for user ${userId}`);
  
  return userLicense;
}

export async function canClaimTrial(userId: string): Promise<boolean> {
  console.log(`🔍 [TRIAL] Checking if user ${userId} can claim trial`);
  
  // Verificar si ya tiene una licencia activa
  const activeLicense = await db.userLicense.findFirst({
    where: {
      userId,
      status: "active",
      hoursRemaining: { gt: 0 }
    }
  });

  if (activeLicense) {
    console.log(`❌ [TRIAL] User ${userId} already has active license`);
    return false;
  }

  // Verificar si ya reclamó un trial antes
  const previousTrial = await db.userLicense.findFirst({
    where: {
      userId,
      license: {
        type: "trial"
      }
    }
  });

  if (previousTrial) {
    console.log(`❌ [TRIAL] User ${userId} already claimed trial before`);
    return false;
  }

  console.log(`✅ [TRIAL] User ${userId} is eligible for trial`);
  return true;
}

/**
 * Reclama el trial gratuito para un usuario
 * Solo funciona si el usuario es elegible (canClaimTrial = true)
 */
export async function claimTrial(userId: string): Promise<{ success: boolean; error?: string }> {
  console.log(`🎁 [TRIAL] User ${userId} attempting to claim trial`);

  // Verificar elegibilidad
  const eligible = await canClaimTrial(userId);
  
  if (!eligible) {
    console.log(`❌ [TRIAL] User ${userId} is not eligible for trial`);
    return {
      success: false,
      error: "Ya has reclamado tu trial gratuito o tienes una licencia activa"
    };
  }

  try {
    // Obtener la licencia trial del sistema
    const trialLicense = await db.license.findFirst({
      where: { type: "trial" }
    });

    if (!trialLicense) {
      console.log(`❌ [TRIAL] No trial license found in system`);
      return {
        success: false,
        error: "No hay licencias trial disponibles en el sistema"
      };
    }

    // Crear la user_license
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + trialLicense.validityDays);

    await db.userLicense.create({
      data: {
        userId,
        licenseId: trialLicense.id,
        hoursRemaining: trialLicense.hoursTotal,
        status: "active",
        expiresAt,
        source: "trial"
      }
    });

    console.log(`✅ [TRIAL] Trial claimed successfully for user ${userId}`);

    return { success: true };
  } catch (error) {
    console.error(`💥 [TRIAL] Error claiming trial for user ${userId}:`, error);
    return {
      success: false,
      error: "Error al reclamar el trial. Por favor intenta nuevamente."
    };
  }
}

/**
 * Crea automáticamente un trial para un usuario recién registrado
 * Esta función se llama desde auth.server.ts después de crear el usuario
 */
export async function autoCreateTrialOnRegistration(userId: string): Promise<void> {
  console.log(`🎁 [TRIAL] Auto-creating trial for new user ${userId}`);

  try {
    // Verificar si el usuario ya tiene alguna licencia (por si acaso)
    const existingLicense = await db.userLicense.findFirst({
      where: { userId }
    });

    if (existingLicense) {
      console.log(`⚠️ [TRIAL] User ${userId} already has a license, skipping auto-trial`);
      return;
    }

    // Obtener la licencia trial del sistema
    const trialLicense = await db.license.findFirst({
      where: { type: "trial" }
    });

    if (!trialLicense) {
      console.log(`❌ [TRIAL] No trial license found in system for user ${userId}`);
      return;
    }

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + trialLicense.validityDays);

    // Crear la licencia trial automática
    await db.userLicense.create({
      data: {
        userId,
        licenseId: trialLicense.id,
        hoursRemaining: trialLicense.hoursTotal,
        status: "active",
        expiresAt,
        source: "trial"
      }
    });

    console.log(`✅ [TRIAL] Auto-trial created successfully for user ${userId}`);

    // Crear métrica inicial del usuario
    await db.userMetric.create({
      data: {
        userId,
        hoursUsedTotal: 0,
        sessionsCount: 0
      }
    });

    console.log(`✅ [TRIAL] User metrics initialized for ${userId}`);

  } catch (error) {
    console.error(`💥 [TRIAL] Error auto-creating trial for user ${userId}:`, error);
    // No lanzar error para no bloquear el registro del usuario
    // El usuario podrá reclamar manualmente desde /licencias
  }
}

export async function getTrialStats() {
  console.log(`📊 Getting trial statistics`);
  
  const [totalTrials, activeTrials, expiredTrials] = await Promise.all([
    db.userLicense.count({
      where: { source: "trial" }
    }),
    db.userLicense.count({
      where: { 
        source: "trial",
        status: "active"
      }
    }),
    db.userLicense.count({
      where: { 
        source: "trial",
        status: "expired"
      }
    })
  ]);
  
  const conversionRate = totalTrials > 0 ? ((totalTrials - expiredTrials) / totalTrials * 100) : 0;
  
  console.log(`📈 Trial stats: ${totalTrials} total, ${activeTrials} active, ${expiredTrials} expired, ${conversionRate.toFixed(1)}% conversion`);
  
  return {
    totalTrials,
    activeTrials,
    expiredTrials,
    conversionRate
  };
}
