import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { markAsRead } from "~/lib/notifications/notification.server";

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  
  const formData = await request.json();
  const { notificationId } = formData;
  
  if (!notificationId) {
    return json({ error: "ID de notificación requerido" }, { status: 400 });
  }
  
  try {
    await markAsRead(notificationId, user.id);
    return json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return json({ error: "Error al marcar notificación" }, { status: 500 });
  }
}
