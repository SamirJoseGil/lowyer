import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin, isAdmin } from "~/lib/permissions.server";
import { getLawyerMetrics, getLawyerActivityTrends, getLawyerPerformanceDistribution } from "~/lib/metrics/lawyer-metrics.server";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user) && !isAdmin(user)) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const url = new URL(request.url);
  const timeRange = (url.searchParams.get("range") as "7d" | "30d" | "90d" | "all") || "30d";

  const [metrics, trends, distribution] = await Promise.all([
    getLawyerMetrics(timeRange),
    getLawyerActivityTrends(),
    getLawyerPerformanceDistribution()
  ]);

  return json({ metrics, trends, distribution, timeRange });
};

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'];

export default function MetricasAbogados() {
  const { metrics, trends, distribution, timeRange } = useLoaderData<typeof loader>();

  const distributionData = [
    { name: 'Inactivos', value: distribution.inactive, color: COLORS[0] },
    { name: 'Baja (1-5)', value: distribution.low, color: COLORS[1] },
    { name: 'Media (6-20)', value: distribution.medium, color: COLORS[2] },
    { name: 'Alta (20+)', value: distribution.high, color: COLORS[3] }
  ];

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
          Métricas de Abogados
        </h2>

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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* ...existing code similar to user metrics... */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-xs text-blue-600 font-semibold">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.overview.total}</p>
          <p className="text-sm text-gray-600">Abogados registrados</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs text-green-600 font-semibold">Verificados</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.overview.verified}</p>
          <p className="text-sm text-gray-600">Abogados activos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-xs text-purple-600 font-semibold">Rating</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.overview.avgRating.toFixed(1)}</p>
          <p className="text-sm text-gray-600">Promedio general</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs text-orange-600 font-semibold">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.overview.totalCases}</p>
          <p className="text-sm text-gray-600">Casos atendidos</p>
        </motion.div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tendencia de actividad */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Actividad de Abogados (6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cases" stroke="#3B82F6" name="Casos" />
              <Line type="monotone" dataKey="reviews" stroke="#10B981" name="Reviews" />
              <Line type="monotone" dataKey="newLawyers" stroke="#F59E0B" name="Nuevos" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución de performance */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Distribución por Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Abogados */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Top Abogados por Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Abogado</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Especialidad</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Casos</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Reviews</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Rating</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Experiencia</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topLawyers.map((lawyer, index) => (
                <tr key={lawyer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4 font-medium">{lawyer.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{lawyer.specialty || 'General'}</td>
                  <td className="py-3 px-4 text-center">{lawyer.cases}</td>
                  <td className="py-3 px-4 text-center">{lawyer.reviews}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                      ⭐ {lawyer.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">{lawyer.experienceYears || 0} años</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
