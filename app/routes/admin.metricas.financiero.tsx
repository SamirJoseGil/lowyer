import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin, isAdmin } from "~/lib/permissions.server";
import { getFinancialMetrics, getRevenueTrends, getMRR } from "~/lib/metrics/financial-metrics.server";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user) && !isAdmin(user)) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const url = new URL(request.url);
  const timeRange = (url.searchParams.get("range") as "7d" | "30d" | "90d" | "all") || "30d";

  const [metrics, trends, mrr] = await Promise.all([
    getFinancialMetrics(timeRange),
    getRevenueTrends(),
    getMRR()
  ]);

  return json({ metrics, trends, mrr, timeRange });
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function MetricasFinanciero() {
  const { metrics, trends, mrr, timeRange } = useLoaderData<typeof loader>();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(cents / 100);
  };

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
          Métricas Financieras
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

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-green-600 font-semibold">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(metrics.overview.totalRevenue)}
          </p>
          <p className="text-sm text-gray-600">Ingresos totales</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-blue-600 font-semibold">Completadas</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.overview.completedPurchases}</p>
          <p className="text-sm text-gray-600">Compras exitosas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs text-purple-600 font-semibold">
              {metrics.overview.conversionRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(metrics.overview.averageOrderValue)}
          </p>
          <p className="text-sm text-gray-600">Ticket promedio</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-orange-600 font-semibold">MRR</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(mrr.mrr)}
          </p>
          <p className="text-sm text-gray-600">Ingresos mensuales</p>
        </motion.div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tendencia de ingresos */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Tendencia de Ingresos (6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis 
                tickFormatter={(value) => `$${(value / 100000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                name="Ingresos"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ingresos por licencia */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Ingresos por Tipo de Licencia
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.revenueByLicense}
                dataKey="revenue"
                nameKey="licenseName"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.licenseName}: ${formatCurrency(entry.revenue)}`}
              >
                {metrics.revenueByLicense.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Métodos de Pago Más Usados
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.paymentMethods}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" name="Transacciones" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top compradores */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Top 10 Compradores
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {metrics.topBuyers.map((buyer, index) => (
              <div
                key={buyer.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{buyer.name}</p>
                    <p className="text-xs text-gray-600">{buyer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {formatCurrency(buyer.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-600">{buyer.purchaseCount} compras</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Métricas Adicionales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">ARPU (Promedio por Usuario)</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(mrr.arpu)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Usuarios con Licencia Activa</p>
            <p className="text-3xl font-bold text-purple-600">{mrr.activeSubscribers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Tasa de Conversión</p>
            <p className="text-3xl font-bold text-green-600">
              {metrics.overview.conversionRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
