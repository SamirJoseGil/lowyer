import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isAdmin } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    // Obtener estadísticas de IA
    const [
        totalConsultations,
        recentConsultations,
        legalAreas,
        cacheStats
    ] = await Promise.all([
        db.legalConsultation.count(),
        db.legalConsultation.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                legalArea: true
            }
        }),
        db.legalArea.findMany({
            include: {
                _count: {
                    select: {
                        consultations: true,
                        aiResponses: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        }),
        db.aiResponseCache.aggregate({
            _count: true,
            _sum: { hitCount: true }
        })
    ]);

    return json({
        user,
        stats: {
            totalConsultations,
            cacheHitRate: cacheStats._sum.hitCount || 0,
            uniqueQueries: cacheStats._count || 0
        },
        recentConsultations,
        legalAreas
    });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    const formData = await request.formData();
    const action = formData.get("action");

    try {
        switch (action) {
            case "clear-cache": {
                await db.aiResponseCache.deleteMany({});
                return json({ success: "Cache limpiado correctamente" });
            }

            case "create-legal-area": {
                const name = formData.get("name")?.toString();
                const description = formData.get("description")?.toString();
                const mainLaw = formData.get("mainLaw")?.toString();

                if (!name || !description || !mainLaw) {
                    return json({ error: "Todos los campos son requeridos" }, { status: 400 });
                }

                await db.legalArea.create({
                    data: { name, description, mainLaw }
                });

                return json({ success: "Área legal creada correctamente" });
            }

            default:
                return json({ error: "Acción no válida" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error in admin IA action:", error);
        return json({ error: "Error interno del servidor" }, { status: 500 });
    }
};

export default function AdminIA() {
    const { user, stats, recentConsultations, legalAreas } = useLoaderData<typeof loader>();

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
            {/* Decorative Background */}
            <div className="fixed inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-pink-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-20 w-80 h-80 bg-gradient-to-r from-blue-200/30 to-cyan-200/20 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header con estilo editorial */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-6 rounded-full" />

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/admin"
                                className="inline-flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                                Volver al Dashboard
                            </Link>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    Gestión de IA Legal 🤖
                                </h1>
                                <p className="text-lg text-gray-600 italic mt-2"
                                   style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    Administra el conocimiento legal y rendimiento del asistente IA
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-0.5 bg-gradient-to-r from-purple-400 via-transparent to-pink-400" />
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        {
                            label: "Total Consultas",
                            value: stats.totalConsultations,
                            icon: "💬",
                            color: "from-purple-500 to-pink-500"
                        },
                        {
                            label: "Queries Únicas",
                            value: stats.uniqueQueries,
                            icon: "🔍",
                            color: "from-blue-500 to-cyan-500"
                        },
                        {
                            label: "Cache Hits",
                            value: stats.cacheHitRate,
                            icon: "⚡",
                            color: "from-green-500 to-emerald-500"
                        }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.03, y: -5 }}
                            className="relative overflow-hidden bg-white rounded-2xl shadow-lg border-2 border-purple-100"
                            style={{ borderRadius: "2px" }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                            
                            <div className="relative p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-3xl">{stat.icon}</span>
                                    <div className={`p-2 bg-gradient-to-br ${stat.color} rounded-lg`}>
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                        </svg>
                                    </div>
                                </div>

                                <h3 className="text-sm font-medium text-gray-600 mb-2"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    {stat.label}
                                </h3>
                                
                                <p className="text-3xl font-bold text-gray-900"
                                   style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    {stat.value}
                                </p>

                                <div className="mt-4 h-1 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Legal Areas */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white shadow-xl rounded-2xl border-2 border-purple-100"
                        style={{ borderRadius: "2px" }}
                    >
                        <div className="px-6 py-5 border-b-2 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 mb-4 rounded-full" />
                            <h3 className="text-xl font-bold text-gray-900"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Áreas Legales 📚
                            </h3>
                            <div className="h-0.5 bg-purple-300 mt-3 w-1/3" />
                        </div>

                        <div className="p-6 max-h-[600px] overflow-y-auto">
                            <div className="space-y-4">
                                {legalAreas.map((area, index) => (
                                    <motion.div
                                        key={area.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + index * 0.05 }}
                                        className="p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg border-2 border-purple-100 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 mb-1"
                                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                    {area.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-2 italic">
                                                    {area.description}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    <span className="font-semibold">Ley base:</span> {area.mainLaw}
                                                </p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="text-sm font-medium text-purple-600">
                                                    {area._count.consultations} consultas
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {area._count.aiResponses} en cache
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Add New Legal Area Form */}
                            <Form method="post" className="mt-6 p-4 border-2 border-dashed border-purple-200 rounded-lg">
                                <input type="hidden" name="action" value="create-legal-area" />
                                <h4 className="font-semibold text-gray-900 mb-3"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    ➕ Nueva Área Legal
                                </h4>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Nombre del área (ej: Derecho Laboral)"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <textarea
                                        name="description"
                                        placeholder="Descripción breve"
                                        required
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <input
                                        type="text"
                                        name="mainLaw"
                                        placeholder="Ley principal (ej: Ley 100 de 1993)"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                    >
                                        Crear Área Legal
                                    </button>
                                </div>
                            </Form>
                        </div>
                    </motion.div>

                    {/* Recent Consultations */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white shadow-xl rounded-2xl border-2 border-blue-100"
                        style={{ borderRadius: "2px" }}
                    >
                        <div className="px-6 py-5 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                            <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mb-4 rounded-full" />
                            <h3 className="text-xl font-bold text-gray-900"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Consultas Recientes 💭
                            </h3>
                            <div className="h-0.5 bg-blue-300 mt-3 w-1/3" />
                        </div>

                        <div className="p-6 max-h-[600px] overflow-y-auto">
                            {recentConsultations.length > 0 ? (
                                <div className="space-y-4">
                                    {recentConsultations.map((consultation, index) => (
                                        <motion.div
                                            key={consultation.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 + index * 0.05 }}
                                            className="p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-lg border border-blue-100"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center shadow-md">
                                                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-sm font-bold text-gray-900"
                                                           style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                            {consultation.user.profile?.firstName || consultation.user.email.split('@')[0]}
                                                        </p>
                                                        {consultation.legalArea && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                {consultation.legalArea.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                                        {consultation.query}
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <span>
                                                            {new Date(consultation.createdAt).toLocaleDateString('es-CO', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        {consultation.responseTime && (
                                                            <span>
                                                                ⚡ {(consultation.responseTime / 1000).toFixed(1)}s
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="mt-4 text-gray-500 italic"
                                       style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                        No hay consultas recientes
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Actions Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-12 bg-white shadow-xl rounded-2xl border-2 border-red-100 p-6"
                    style={{ borderRadius: "2px" }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Mantenimiento del Sistema 🛠️
                            </h3>
                            <p className="text-sm text-gray-600 italic">
                                Acciones administrativas para optimizar el rendimiento de la IA
                            </p>
                        </div>
                        <Form method="post">
                            <input type="hidden" name="action" value="clear-cache" />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-lg"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                            >
                                🗑️ Limpiar Cache
                            </button>
                        </Form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
