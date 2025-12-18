import { db } from "../db.server";

const CURRENT_TERMS_VERSION = "1.0.0";
const CURRENT_PRIVACY_VERSION = "1.0.0";

export async function recordConsent(
  userId: string,
  termsVersion: string = CURRENT_TERMS_VERSION,
  privacyVersion: string = CURRENT_PRIVACY_VERSION
): Promise<void> {
  await db.consent.create({
    data: {
      userId,
      termsVersion,
      privacyVersion,
      acceptedAt: new Date(),
    },
  });
  
  console.log(`✅ Consent recorded for user: ${userId}`);
}

export async function hasValidConsent(userId: string): Promise<boolean> {
  const latestConsent = await db.consent.findFirst({
    where: { userId },
    orderBy: { acceptedAt: "desc" },
  });
  
  if (!latestConsent) {
    return false;
  }
  
  // Verificar que tenga las versiones actuales
  const isValid =
    latestConsent.termsVersion === CURRENT_TERMS_VERSION &&
    latestConsent.privacyVersion === CURRENT_PRIVACY_VERSION;
  
  return isValid;
}

export async function getUserConsentHistory(userId: string) {
  return db.consent.findMany({
    where: { userId },
    orderBy: { acceptedAt: "desc" },
  });
}
