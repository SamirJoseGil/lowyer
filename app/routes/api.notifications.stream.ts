import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { sseManager } from "~/lib/notifications/sse-manager.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  console.log(`📡 SSE connection request from user ${user.id}`);
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({ 
        type: 'connected', 
        message: 'Notificaciones conectadas' 
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(initialMessage));
      
      // Setup heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`:heartbeat\n\n`));
        } catch (error) {
          clearInterval(heartbeat);
        }
      }, 30000);
      
      // Listen for notifications
      const notificationHandler = (notification: any) => {
        try {
          const message = `data: ${JSON.stringify(notification)}\n\n`;
          controller.enqueue(new TextEncoder().encode(message));
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      };
      
      sseManager.on(`notification:${user.id}`, notificationHandler);
      
      console.log(`✅ SSE connection established for user ${user.id}`);
      
      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        sseManager.off(`notification:${user.id}`, notificationHandler);
        console.log(`📡 SSE connection closed for user ${user.id}`);
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
