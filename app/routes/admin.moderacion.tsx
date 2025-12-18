import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin } from "~/lib/permissions.server";
import { getModerationQueue, reviewMessage, getModerationStats } from "~/lib/security/moderation.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user)) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const [queue, stats] = await Promise.all([
    getModerationQueue(),
    getModerationStats(),
  ]);

  return json({ queue, stats });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user)) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "review": {
        const moderationId = formData.get("moderationId") as string;
        const decision = formData.get("decision") as "approved" | "rejected";
        const notes = formData.get("notes") as string;

        await reviewMessage(moderationId, user.id, decision, notes);
        
        return json({ success: true, message: `Mensaje ${decision === "approved" ? "aprobado" : "rechazado"}` });
      }

      default:
        return json({ success: false, error: "Acción no válida" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in moderation action:", error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    }, { status: 500 });
  }
};

export default function AdminModeracion() {
  const { queue, stats } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        Moderación de Contenido
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-100">
          <p className="text-sm text-gray-600 mb-2">Total Moderaciones</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-xl shadow-md border-2 border-yellow-200">
          <p className="text-sm text-gray-600 mb-2">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>

        <div className="bg-green-50 p-6 rounded-xl shadow-md border-2 border-green-200">
          <p className="text-sm text-gray-600 mb-2">Aprobados</p>
          <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
        </div>

        <div className="bg-red-50 p-6 rounded-xl shadow-md border-2 border-red-200">
          <p className="text-sm text-gray-600 mb-2">Rechazados</p>
          <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Queue */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-100">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Cola de Moderación ({queue.length} pendientes)
          </h2>
        </div>

        {queue.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">🎉 No hay mensajes pendientes de moderación</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {queue.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Message Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.message.sender?.profile?.firstName} {item.message.sender?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{item.message.sender?.email}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-3">
                      <p className="text-gray-800 whitespace-pre-wrap">{item.message.content}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>🚩 Razón: <strong>{item.reason}</strong></span>
                      <span>📅 {new Date(item.createdAt).toLocaleString('es-CO')}</span>
                      <span>💬 Sesión: {item.message.chatSession.id.substring(0, 8)}...</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <Form method="post">
                      <input type="hidden" name="action" value="review" />
                      <input type="hidden" name="moderationId" value={item.id} />
                      <input type="hidden" name="decision" value="approved" />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        ✅ Aprobar
                      </button>
                    </Form>

                    <Form method="post">
                      <input type="hidden" name="action" value="review" />
                      <input type="hidden" name="moderationId" value={item.id} />
                      <input type="hidden" name="decision" value="rejected" />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        ❌ Rechazar
                      </button>
                    </Form>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
