import { db } from "../db.server";

const CURRENT_TERMS_VERSION = "1.0.0";
const CURRENT_PRIVACY_VERSION = "1.0.0";
const CURRENT_COOKIES_VERSION = "1.0.0";

export async function recordConsent(
  userId: string,
  options: {
    termsVersion?: string;
    privacyVersion?: string;
    cookiesVersion?: string;
    ipAddress?: string;
    userAgent?: string;
  } = {}
): Promise<void> {
  await db.consent.create({
    data: {
      userId,
      termsVersion: options.termsVersion || CURRENT_TERMS_VERSION,
      privacyVersion: options.privacyVersion || CURRENT_PRIVACY_VERSION,
      cookiesVersion: options.cookiesVersion || CURRENT_COOKIES_VERSION,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
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
    latestConsent.privacyVersion === CURRENT_PRIVACY_VERSION &&
    latestConsent.cookiesVersion === CURRENT_COOKIES_VERSION;
  
  return isValid;
}

export async function hasAcceptedCookies(userId?: string): Promise<boolean> {
  if (!userId) return false;
  
  const latestConsent = await db.consent.findFirst({
    where: { userId },
    orderBy: { acceptedAt: "desc" },
  });
  
  return latestConsent?.cookiesVersion === CURRENT_COOKIES_VERSION;
}

export async function getUserConsentHistory(userId: string) {
  return db.consent.findMany({
    where: { userId },
    orderBy: { acceptedAt: "desc" },
  });
}

export async function getCurrentVersions() {
  return {
    terms: CURRENT_TERMS_VERSION,
    privacy: CURRENT_PRIVACY_VERSION,
    cookies: CURRENT_COOKIES_VERSION,
  };
}

export async function needsConsentUpdate(userId: string): Promise<{
  needsUpdate: boolean;
  missingConsents: string[];
}> {
  const latestConsent = await db.consent.findFirst({
    where: { userId },
    orderBy: { acceptedAt: "desc" },
  });

  if (!latestConsent) {
    return {
      needsUpdate: true,
      missingConsents: ["terms", "privacy", "cookies"],
    };
  }

  const missing: string[] = [];

  if (latestConsent.termsVersion !== CURRENT_TERMS_VERSION) {
    missing.push("terms");
  }
  if (latestConsent.privacyVersion !== CURRENT_PRIVACY_VERSION) {
    missing.push("privacy");
  }
  if (latestConsent.cookiesVersion !== CURRENT_COOKIES_VERSION) {
    missing.push("cookies");
  }

  return {
    needsUpdate: missing.length > 0,
    missingConsents: missing,
  };
}
