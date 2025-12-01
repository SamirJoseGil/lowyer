import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { markAllAsRead } from "~/lib/notifications/notification.server";

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  
  try {
    await markAllAsRead(user.id);
    return json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return json({ error: "Error al marcar notificaciones" }, { status: 500 });
  }
}
