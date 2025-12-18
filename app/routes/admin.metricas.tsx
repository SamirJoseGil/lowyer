import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin, isAdmin } from "~/lib/permissions.server";
import { getGlobalMetrics } from "~/lib/metrics/global-metrics.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user) && !isAdmin(user)) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const metrics = await getGlobalMetrics();

  return json({ metrics });
};

export default function MetricasDashboard() {
  const { metrics } = useLoaderData<typeof loader>();

  const metricCards = [
    {
      title: "Total Usuarios",
      value: metrics.usuarios.total,
      change: `+${metrics.usuarios.nuevosEsteMes}`,
      changeLabel: "este mes",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Abogados Activos",
      value: metrics.abogados.verificados,
      change: `${metrics.abogados.pendientes}`,
      changeLabel: "pendientes",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Ingresos (COP)",
      value: `$${(metrics.financiero.ingresosTotales / 100).toLocaleString()}`,
      change: `$${(metrics.financiero.ingresosEsteMes / 100).toLocaleString()}`,
      changeLabel: "este mes",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      title: "Conversión Trial",
      value: `${metrics.conversion.tasaConversion.toFixed(1)}%`,
      change: `${metrics.conversion.trialsActivos}`,
      changeLabel: "trials activos",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  const sections = [
    {
      title: "FAQs",
      description: "Métricas de preguntas frecuentes",
      href: "/admin/faq/estadisticas",
      icon: (
        <svg className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      stats: [
        { label: "Total", value: metrics.faq.total },
        { label: "Publicadas", value: metrics.faq.publicadas },
        { label: "Vistas", value: metrics.faq.totalVistas.toLocaleString() },
      ]
    },
    {
      title: "Usuarios",
      description: "Análisis de usuarios y actividad",
      href: "/admin/metricas/usuarios",
      icon: (
        <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      stats: [
        { label: "Total", value: metrics.usuarios.total },
        { label: "Activos", value: metrics.usuarios.activos },
        { label: "Nuevos (mes)", value: metrics.usuarios.nuevosEsteMes },
      ]
    },
    {
      title: "Abogados",
      description: "Performance y estadísticas de abogados",
      href: "/admin/metricas/abogados",
      icon: (
        <svg className="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      stats: [
        { label: "Verificados", value: metrics.abogados.verificados },
        { label: "Rating", value: `${metrics.abogados.ratingPromedio.toFixed(1)}⭐` },
        { label: "Casos (mes)", value: metrics.abogados.casosEsteMes },
      ]
    },
    {
      title: "Financiero",
      description: "Ingresos, ventas y conversiones",
      href: "/admin/metricas/financiero",
      icon: (
        <svg className="h-12 w-12 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      stats: [
        { label: "Total", value: `$${(metrics.financiero.ingresosTotales / 100).toLocaleString()}` },
        { label: "RPU", value: `$${(metrics.financiero.revenuePerUser / 100).toFixed(0)}` },
        { label: "Compras", value: metrics.financiero.totalCompras },
      ]
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 
          className="text-3xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Dashboard de Métricas
        </h1>
        <p className="text-gray-600">
          Vista general del sistema y análisis de negocio
        </p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {metricCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${card.bgColor} border-2 ${card.borderColor} rounded-2xl p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-700">{card.icon}</div>
              <div className={`h-12 w-12 bg-gradient-to-br ${card.color} rounded-full opacity-20`}></div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{card.title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
            <div className="flex items-center text-xs text-gray-600">
              <span className="font-semibold text-green-600">{card.change}</span>
              <span className="ml-1">{card.changeLabel}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secciones de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <Link
            key={section.title}
            to={section.href}
            className="block"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white border-2 border-gray-100 hover:border-blue-300 rounded-2xl p-6 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {section.description}
                  </p>
                </div>
                {section.icon}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {section.stats.map((stat) => (
                  <div key={stat.label} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center text-blue-600 text-sm font-semibold">
                Ver detalles
                <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
