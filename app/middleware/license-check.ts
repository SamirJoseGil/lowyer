import { redirect } from "@remix-run/node";
import { hasValidLicense } from "~/lib/licenses.server";
import type { AppliesTo } from "~/lib/licenses.server";

export async function requireValidLicense(
  userId: string, 
  accessType?: AppliesTo,
  redirectPath: string = "/licencias"
) {
  const hasLicense = await hasValidLicense(userId, accessType);
  
  if (!hasLicense) {
    throw redirect(redirectPath);
  }
  
  return true;
}

export async function checkLicenseAccess(
  userId: string,
  accessType?: AppliesTo
): Promise<{ hasAccess: boolean; redirect?: string }> {
  const hasLicense = await hasValidLicense(userId, accessType);
  
  if (!hasLicense) {
    return {
      hasAccess: false,
      redirect: "/licencias"
    };
  }
  
  return { hasAccess: true };
}
