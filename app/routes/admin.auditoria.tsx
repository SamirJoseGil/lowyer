import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, useSearchParams } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin } from "~/lib/permissions.server";
import { getAuditLogs } from "~/lib/security/audit-log.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user)) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action") || undefined;
  const userId = url.searchParams.get("userId") || undefined;
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const limit = parseInt(url.searchParams.get("limit") || "100");

  const logs = await getAuditLogs({
    action: action as any,
    userId,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    limit,
  });

  return json({ logs });
};

export default function AdminAuditoria() {
  const { logs } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const getActionIcon = (action: string) => {
    if (action.includes("login")) return "🔐";
    if (action.includes("register")) return "📝";
    if (action.includes("chat")) return "💬";
    if (action.includes("license")) return "📜";
    if (action.includes("admin")) return "⚙️";
    if (action.includes("lawyer")) return "👨‍💼";
    return "📋";
  };

  const getActionColor = (action: string) => {
    if (action.includes("login")) return "text-green-600";
    if (action.includes("logout")) return "text-gray-600";
    if (action.includes("delete") || action.includes("block")) return "text-red-600";
    if (action.includes("update") || action.includes("change")) return "text-yellow-600";
    return "text-blue-600";
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        Registro de Auditoría
      </h1>

      {/* Filtros */}
      <Form method="get" className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Acción
            </label>
            <select
              name="action"
              defaultValue={searchParams.get("action") || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las acciones</option>
              <option value="user.login">Login</option>
              <option value="user.logout">Logout</option>
              <option value="user.register">Registro</option>
              <option value="chat.create">Crear chat</option>
              <option value="chat.message">Mensaje</option>
              <option value="license.purchase">Compra licencia</option>
              <option value="admin.user.block">Bloqueo usuario</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha inicio
            </label>
            <input
              type="date"
              name="startDate"
              defaultValue={searchParams.get("startDate") || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha fin
            </label>
            <input
              type="date"
              name="endDate"
              defaultValue={searchParams.get("endDate") || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Límite
            </label>
            <select
              name="limit"
              defaultValue={searchParams.get("limit") || "100"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Filtrar
          </button>
          <a
            href="/admin/auditoria"
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </a>
        </div>
      </Form>

      {/* Tabla de logs */}
      <div className="bg-white rounded-xl shadow-md border-2 border-blue-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-100">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Registros ({logs.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                  Metadatos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(log.createdAt).toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center text-sm font-semibold ${getActionColor(log.action)}`}>
                      <span className="mr-2">{getActionIcon(log.action)}</span>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.user ? (
                      <div>
                        <p className="font-medium text-gray-900">{log.user.email}</p>
                        <p className="text-gray-500 text-xs">
                          {log.user.role?.name || 'N/A'}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-500">Sistema</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <details className="cursor-pointer">
                      <summary className="text-blue-600 hover:underline">
                        Ver detalles
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    </details>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No hay registros con los filtros seleccionados
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Total Registros</p>
          <p className="text-3xl font-bold text-blue-600">{logs.length}</p>
        </div>

        <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
          <p className="text-sm text-gray-600 mb-2">Logins</p>
          <p className="text-3xl font-bold text-green-600">
            {logs.filter(l => l.action === 'user.login').length}
          </p>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
          <p className="text-sm text-gray-600 mb-2">Acciones Admin</p>
          <p className="text-3xl font-bold text-purple-600">
            {logs.filter(l => l.action.includes('admin')).length}
          </p>
        </div>

        <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
          <p className="text-sm text-gray-600 mb-2">Mensajes</p>
          <p className="text-3xl font-bold text-orange-600">
            {logs.filter(l => l.action.includes('chat')).length}
          </p>
        </div>
      </div>
    </div>
  );
}
