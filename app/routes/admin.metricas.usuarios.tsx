import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin, isAdmin } from "~/lib/permissions.server";
import { getUserMetrics, getUserRegistrationTrends, getUserRetention } from "~/lib/metrics/user-metrics.server";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ExportButton from "~/components/Reports/ExportButton";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user) && !isAdmin(user)) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const url = new URL(request.url);
  const timeRange = (url.searchParams.get("range") as "7d" | "30d" | "90d" | "all") || "30d";

  const [metrics, trends, retention] = await Promise.all([
    getUserMetrics(timeRange),
    getUserRegistrationTrends(),
    getUserRetention()
  ]);

  return json({ metrics, trends, retention, timeRange });
};

export default function MetricasUsuarios() {
  const { metrics, trends, retention, timeRange } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="mb-6">
        <Link
          to="/admin/metricas"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a métricas
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Métricas de Usuarios
        </h2>

        <div className="flex gap-3">
          {/* Botón de exportación */}
          <ExportButton 
            reportType="users"
            label="Exportar Reporte"
          />

          {/* Filtros existentes */}
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <Link
                key={range}
                to={`?range=${range}`}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'all' ? 'Todo' : range.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs text-blue-600 font-semibold">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.overview.total}</p>
          <p className="text-sm text-gray-600">Usuarios registrados</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-green-600 font-semibold">
              {metrics.overview.activationRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.overview.active}</p>
          <p className="text-sm text-gray-600">Usuarios activos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-purple-600 font-semibold">Nuevos</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.overview.new}</p>
          <p className="text-sm text-gray-600">En el período</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs text-orange-600 font-semibold">
              {metrics.overview.conversionRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.overview.paid}</p>
          <p className="text-sm text-gray-600">Conversión Trial → Pago</p>
        </motion.div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tendencia de registros */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Tendencia de Registros (6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="registered" stroke="#3B82F6" name="Registrados" />
              <Line type="monotone" dataKey="activated" stroke="#10B981" name="Activados" />
              <Line type="monotone" dataKey="converted" stroke="#F59E0B" name="Convertidos" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Retención por cohortes */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Retención por Cohortes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={retention.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cohort" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="day7" fill="#3B82F6" name="Día 7" />
              <Bar dataKey="day14" fill="#10B981" name="Día 14" />
              <Bar dataKey="day30" fill="#F59E0B" name="Día 30" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Usuarios */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Top Usuarios por Actividad
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Sesiones</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Compras</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Licencia</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topUsers.map((user, index) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 text-center">{user.sessions}</td>
                  <td className="py-3 px-4 text-center">{user.purchases}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      {user.license}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
