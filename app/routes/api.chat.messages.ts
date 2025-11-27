import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { getChatMessages } from "~/lib/chat.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const user = await requireUser(request);
    const url = new URL(request.url);
    
    const sessionId = url.searchParams.get("sessionId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    if (!sessionId) {
      return json({ error: "Session ID is required" }, { status: 400 });
    }

    const messages = await getChatMessages(sessionId, user.id, page, limit);
    
    return json(messages);

  } catch (error) {
    console.error("Error in chat messages API:", error);
    return json({ error: "Error interno del servidor" }, { status: 500 });
  }
};
