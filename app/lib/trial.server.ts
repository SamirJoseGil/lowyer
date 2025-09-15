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

export async function canClaimTrial(userId: string): Promise<{ canClaim: boolean; reason?: string }> {
  console.log(`🤔 Checking if user ${userId} can claim trial`);
  
  // Verificar si ya usó el trial
  const alreadyUsedTrial = await hasUsedTrial(userId);
  if (alreadyUsedTrial) {
    console.log(`❌ User ${userId} already used their trial`);
    return { 
      canClaim: false, 
      reason: "Ya has usado tu periodo de prueba gratuito" 
    };
  }
  
  // Verificar si ya tiene una licencia activa
  const activeLicense = await db.userLicense.findFirst({
    where: {
      userId,
      status: "active",
      hoursRemaining: { gt: 0 }
    }
  });
  
  if (activeLicense) {
    console.log(`❌ User ${userId} already has an active license`);
    return { 
      canClaim: false, 
      reason: "Ya tienes una licencia activa" 
    };
  }
  
  console.log(`✅ User ${userId} can claim trial`);
  return { canClaim: true };
}

export async function claimTrial(userId: string) {
  console.log(`🎯 User ${userId} attempting to claim trial`);
  
  const eligibility = await canClaimTrial(userId);
  
  if (!eligibility.canClaim) {
    console.log(`❌ Trial claim denied for user ${userId}: ${eligibility.reason}`);
    throw new Error(eligibility.reason || "No puedes reclamar el trial");
  }
  
  try {
    const trialLicense = await createTrialLicense(userId);
    console.log(`🎉 Trial successfully claimed by user ${userId}`);
    return trialLicense;
  } catch (error) {
    console.error(`💥 Error claiming trial for user ${userId}:`, error);
    throw error;
  }
}

export async function autoCreateTrialOnRegistration(userId: string) {
  console.log(`🚀 Auto-creating trial for new user ${userId}`);
  
  try {
    // Verificar si es un usuario nuevo y no tiene licencias
    const existingLicenses = await db.userLicense.findMany({
      where: { userId }
    });
    
    if (existingLicenses.length === 0) {
      await createTrialLicense(userId);
      console.log(`✅ Auto-trial created successfully for user ${userId}`);
    } else {
      console.log(`⚠️ User ${userId} already has licenses, skipping auto-trial`);
    }
  } catch (error) {
    console.error(`💥 Error auto-creating trial for user ${userId}:`, error);
    // No lanzar error para no bloquear el registro
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
