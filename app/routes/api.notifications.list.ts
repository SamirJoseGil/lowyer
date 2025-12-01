import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { getAllNotifications, getUnreadCount } from "~/lib/notifications/notification.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  const [notifications, unreadCount] = await Promise.all([
    getAllNotifications(user.id, 50),
    getUnreadCount(user.id)
  ]);
  
  return json({ notifications, unreadCount });
}
