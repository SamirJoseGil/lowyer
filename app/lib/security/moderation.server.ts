import { db } from "../db.server";
import { validateMessageContent } from "./input-sanitizer.server";

export type ModerationStatus = "pending" | "approved" | "rejected" | "flagged";

export async function moderateMessage(
  messageId: string,
  content: string
): Promise<{ status: ModerationStatus; reason?: string }> {
  
  const validation = validateMessageContent(content);
  
  let status: ModerationStatus = "approved";
  let reason: string | undefined;
  
  if (!validation.isValid) {
    status = "flagged";
    reason = validation.violations.join(", ");
    
    // Crear registro de moderación
    await db.messageModeration.create({
      data: {
        messageId,
        status: "pending",
        reason,
        createdAt: new Date(),
      },
    });
    
    console.warn(`🚩 Message flagged for moderation: ${messageId} - ${reason}`);
  }
  
  return { status, reason };
}

export async function getModerationQueue(limit: number = 50) {
  return db.messageModeration.findMany({
    where: {
      status: "pending",
    },
    include: {
      message: {
        include: {
          sender: {
            select: {
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          chatSession: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
  });
}

export async function reviewMessage(
  moderationId: string,
  reviewerId: string,
  decision: "approved" | "rejected",
  reviewNotes?: string
): Promise<void> {
  await db.messageModeration.update({
    where: { id: moderationId },
    data: {
      status: decision,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reason: reviewNotes,
    },
  });
  
  console.log(`✅ Message moderation reviewed: ${moderationId} - ${decision}`);
}

export async function getModerationStats() {
  const [total, pending, approved, rejected] = await Promise.all([
    db.messageModeration.count(),
    db.messageModeration.count({ where: { status: "pending" } }),
    db.messageModeration.count({ where: { status: "approved" } }),
    db.messageModeration.count({ where: { status: "rejected" } }),
  ]);

  return {
    total,
    pending,
    approved,
    rejected,
    approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : "0",
  };
}
