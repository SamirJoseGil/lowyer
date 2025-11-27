import { db } from "./db.server";

export type UserRole = "superadmin" | "admin" | "abogado" | "usuario";

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin", 
  ABOGADO: "abogado",
  USUARIO: "usuario",
} as const;

export const PERMISSIONS = {
  // User management
  MANAGE_USERS: "manage_users",
  VIEW_USERS: "view_users",
  BLOCK_USERS: "block_users",
  
  // Lawyer management
  MANAGE_LAWYERS: "manage_lawyers",
  VERIFY_LAWYERS: "verify_lawyers",
  VIEW_LAWYERS: "view_lawyers",
  
  // License management
  MANAGE_LICENSES: "manage_licenses",
  VIEW_LICENSES: "view_licenses",
  
  // Chat access
  ACCESS_CHAT: "access_chat",
  ACCESS_AI_CHAT: "access_ai_chat",
  ACCESS_LAWYER_CHAT: "access_lawyer_chat",
  
  // Admin features
  VIEW_METRICS: "view_metrics",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  MANAGE_PERMISSIONS: "manage_permissions",
} as const;

// Default permissions for each role
export const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS, 
    PERMISSIONS.BLOCK_USERS,
    PERMISSIONS.MANAGE_LAWYERS,
    PERMISSIONS.VERIFY_LAWYERS,
    PERMISSIONS.VIEW_LAWYERS,
    PERMISSIONS.MANAGE_LICENSES,
    PERMISSIONS.VIEW_LICENSES,
    PERMISSIONS.ACCESS_CHAT,
    PERMISSIONS.ACCESS_AI_CHAT,
    PERMISSIONS.ACCESS_LAWYER_CHAT,
    PERMISSIONS.VIEW_METRICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_PERMISSIONS,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.BLOCK_USERS,
    PERMISSIONS.MANAGE_LAWYERS,
    PERMISSIONS.VERIFY_LAWYERS,
    PERMISSIONS.VIEW_LAWYERS,
    PERMISSIONS.VIEW_LICENSES,
    PERMISSIONS.ACCESS_CHAT,
    PERMISSIONS.ACCESS_AI_CHAT,
    PERMISSIONS.ACCESS_LAWYER_CHAT,
    PERMISSIONS.VIEW_METRICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  [ROLES.ABOGADO]: [
    PERMISSIONS.ACCESS_CHAT,
    PERMISSIONS.ACCESS_LAWYER_CHAT,
  ],
  [ROLES.USUARIO]: [
    PERMISSIONS.ACCESS_CHAT,
    PERMISSIONS.ACCESS_AI_CHAT,
  ],
} as const;

export async function initializeRolesAndPermissions() {
  try {
    // Create permissions
    for (const permission of Object.values(PERMISSIONS)) {
      await db.permission.upsert({
        where: { name: permission },
        update: {},
        create: {
          name: permission,
          description: `Permission for ${permission.replace(/_/g, ' ')}`,
        },
      });
    }

    // Create roles with permissions
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      const role = await db.role.upsert({
        where: { name: roleName },
        update: {},
        create: {
          name: roleName,
          description: `${roleName.charAt(0).toUpperCase() + roleName.slice(1)} role`,
        },
      });

      // Get permission IDs
      const permissionRecords = await db.permission.findMany({
        where: { name: { in: Array.from(permissions) } },
      });

      // Create role permissions
      for (const permission of permissionRecords) {
        await db.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }

    console.log("✅ Roles and permissions initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing roles and permissions:", error);
    throw error;
  }
}

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) return false;

    const userPermissions = user.role.rolePermissions.map(rp => rp.permission.name);
    return userPermissions.includes(permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

export async function requirePermission(userId: string, permission: string) {
  const hasPermissionResult = await hasPermission(userId, permission);
  if (!hasPermissionResult) {
    throw new Error(`Access denied. Required permission: ${permission}`);
  }
}

export function isRole(user: any, role: UserRole): boolean {
  return user?.role?.name === role;
}

export function isAdmin(user: any): boolean {
  return user?.role?.name === "admin" || user?.role?.name === "superadmin";
}

export function isSuperAdmin(user: any): boolean {
  return user?.role?.name === "superadmin";
}

export function isLawyer(user: any): boolean {
  return user?.role?.name === "abogado";
}

export function isUser(user: any): boolean {
  return isRole(user, ROLES.USUARIO);
}
