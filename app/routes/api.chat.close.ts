import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { closeChatSession } from "~/lib/chat.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const user = await requireUser(request);
    const { sessionId, summary } = await request.json();

    if (!sessionId) {
      return json({ error: "Session ID is required" }, { status: 400 });
    }

    const result = await closeChatSession(sessionId, user.id, summary);
    
    return json(result);

  } catch (error) {
    console.error("Error in chat close API:", error);
    return json({ error: "Error interno del servidor" }, { status: 500 });
  }
};
