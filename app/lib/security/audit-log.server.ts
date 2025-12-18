import { db } from "../db.server";

export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.register"
  | "user.update"
  | "user.delete"
  | "role.change"
  | "license.purchase"
  | "license.expire"
  | "chat.create"
  | "chat.message"
  | "chat.close"
  | "admin.user.block"
  | "admin.user.unblock"
  | "lawyer.verify"
  | "lawyer.reject"
  | "sensitive.data.access";

export async function logAuditEvent(
  userId: string | null,
  action: AuditAction,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId,
        action,
        meta: metadata || {},
        createdAt: new Date(),
      },
    });
    
    console.log(`📝 Audit log: ${action} by ${userId || "system"}`);
  } catch (error) {
    console.error("❌ Failed to create audit log:", error);
    // No lanzar error para no interrumpir el flujo principal
  }
}

export async function getAuditLogs(filters: {
  userId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  return db.auditLog.findMany({
    where: {
      userId: filters.userId,
      action: filters.action,
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: filters.limit || 100,
    include: {
      user: {
        select: {
          email: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const result = await db.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });
  
  console.log(`🧹 Cleaned up ${result.count} old audit logs (older than ${daysToKeep} days)`);
  
  return result.count;
}
