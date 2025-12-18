import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin, isAdmin } from "~/lib/permissions.server";
import { getFAQMetrics, getFAQTrends, getTopSearchQueries, getFAQPerformance } from "~/lib/faq/faq-metrics.server";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user) && !isAdmin(user)) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const url = new URL(request.url);
  const timeRange = (url.searchParams.get("range") as "7d" | "30d" | "90d" | "all") || "30d";

  const [metrics, trends, topQueries, performance] = await Promise.all([
    getFAQMetrics(timeRange),
    getFAQTrends(),
    getTopSearchQueries(20),
    getFAQPerformance()
  ]);

  return json({ metrics, trends, topQueries, performance, timeRange });
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function EstadisticasFAQ() {
  const { metrics, trends, topQueries, performance, timeRange } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="mb-6">
        <Link
          to="/admin/faq"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Estadísticas de FAQs
        </h2>

        {/* Filtro de rango */}
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

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs text-blue-600 font-semibold">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.overview.total}</p>
          <p className="text-sm text-gray-600">FAQs creadas</p>
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
              {metrics.overview.tasaPublicacion.toFixed(1)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.overview.publicadas}</p>
          <p className="text-sm text-gray-600">Publicadas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-xs text-purple-600 font-semibold">Engagement</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.overview.totalVistas.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Vistas totales</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span className="text-xs text-orange-600 font-semibold">Útiles</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.overview.totalVotos.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Votos positivos</p>
        </motion.div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tendencia temporal */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Tendencia de FAQs (6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#3B82F6" name="Creadas" />
              <Line type="monotone" dataKey="published" stroke="#10B981" name="Publicadas" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por categoría */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Distribución por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.categories.slice(0, 6)}
                dataKey="cantidad"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {metrics.categories.slice(0, 6).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top búsquedas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Búsquedas Más Frecuentes
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topQueries.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="query" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Top FAQs Mejor Rendimiento
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {performance.topPerforming.map((faq, index) => (
              <Link
                key={faq.id}
                to={`/admin/faq/${faq.id}/editar`}
                className="block p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {index + 1}. {faq.pregunta}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span className="flex items-center">
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {faq.vistas}
                      </span>
                      <span className="flex items-center">
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        {faq.votosUtiles}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {faq.categoria}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas de IA */}
      {metrics.overview.procesadasIA > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Rendimiento de IA
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">FAQs Procesadas</p>
              <p className="text-3xl font-bold text-purple-600">{metrics.overview.procesadasIA}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Confianza Promedio</p>
              <p className="text-3xl font-bold text-purple-600">
                {(metrics.overview.avgConfianzaIA * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tasa de Uso</p>
              <p className="text-3xl font-bold text-purple-600">
                {((metrics.overview.procesadasIA / metrics.overview.total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
