import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isAdmin, isSuperAdmin } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    // ✅ Calcular permisos en el servidor
    const userIsSuperAdmin = isSuperAdmin(user);

    // Obtener métricas generales
    const [
        totalUsers,
        activeUsers,
        totalLawyers,
        verifiedLawyers,
        activeLicenses,
        totalRevenue,
        recentActivity
    ] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { status: "active" } }),
        db.lawyer.count(),
        db.lawyer.count({ where: { status: "verified" } }),
        db.userLicense.count({ where: { status: "active" } }),
        db.purchase.aggregate({
            _sum: {
                amountCents: true
            },
            where: {
                status: "completed"
            }
        }),
        db.auditLog.findMany({
            include: {
                user: {
                    include: {
                        profile: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        })
    ]);

    // ✅ Serializar BigInt fields
    const serializedRevenue = totalRevenue._sum.amountCents 
        ? Number(totalRevenue._sum.amountCents) 
        : 0;

    return json({
        user,
        userIsSuperAdmin, // ✅ Pasar como dato en lugar de importar función
        stats: {
            totalUsers,
            activeUsers,
            totalLawyers,
            verifiedLawyers,
            activeLicenses,
            revenueAmount: serializedRevenue
        },
        recentActivity
    });
};

export default function AdminDashboard() {
    const { user, userIsSuperAdmin, stats, recentActivity } = useLoaderData<typeof loader>();

    const displayName = user.profile?.firstName && user.profile?.lastName
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user.email.split('@')[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-blue-50/20">
            {/* Decorative Background */}
            <div className="fixed inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200/50 to-blue-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-20 w-80 h-80 bg-gradient-to-r from-cyan-200/40 to-purple-200/30 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header con estilo editorial */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 mb-6 rounded-full" />
                    
                    <h1 className="text-4xl font-bold text-gray-900 mb-2"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        {userIsSuperAdmin ? "Panel SuperAdmin" : "Panel Administrativo"} ⚖️
                    </h1>
                    <p className="text-lg text-gray-600 italic"
                       style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        Bienvenido, {displayName}
                    </p>

                    <div className="h-0.5 bg-gradient-to-r from-purple-400 via-transparent to-blue-400 mt-6" />
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Total Users */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white shadow-xl rounded-2xl p-6 border-2 border-purple-100"
                        style={{ borderRadius: "2px" }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600"
                                   style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    Usuarios Totales
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats.totalUsers}
                                </p>
                                <p className="text-sm text-green-600 mt-1">
                                    {stats.activeUsers} activos
                                </p>
                            </div>
                            <div className="h-14 w-14 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    {/* Lawyers */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white shadow-xl rounded-2xl p-6 border-2 border-green-100"
                        style={{ borderRadius: "2px" }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600"
                                   style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    Abogados
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats.totalLawyers}
                                </p>
                                <p className="text-sm text-green-600 mt-1">
                                    {stats.verifiedLawyers} verificados
                                </p>
                            </div>
                            <div className="h-14 w-14 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    {/* Licenses */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white shadow-xl rounded-2xl p-6 border-2 border-blue-100"
                        style={{ borderRadius: "2px" }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600"
                                   style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    Licencias Activas
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats.activeLicenses}
                                </p>
                                <p className="text-sm text-blue-600 mt-1">
                                    En uso
                                </p>
                            </div>
                            <div className="h-14 w-14 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    {/* Revenue */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white shadow-xl rounded-2xl p-6 border-2 border-yellow-100 md:col-span-2 lg:col-span-1"
                        style={{ borderRadius: "2px" }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600"
                                   style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    Ingresos Totales
                                </p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    ${(stats.revenueAmount / 100).toLocaleString('es-CO')}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    COP
                                </p>
                            </div>
                            <div className="h-14 w-14 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white shadow-xl rounded-2xl p-8 border-2 border-purple-100 mb-8"
                    style={{ borderRadius: "2px" }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        Acciones Rápidas
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            to="/admin/usuarios"
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all"
                        >
                            <span className="font-semibold text-gray-900"
                                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Gestión Usuarios
                            </span>
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </Link>

                        <Link
                            to="/admin/abogados"
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all"
                        >
                            <span className="font-semibold text-gray-900"
                                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Gestión Abogados
                            </span>
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </Link>

                        <Link
                            to="/admin/licencias"
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all"
                        >
                            <span className="font-semibold text-gray-900"
                                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Gestión Licencias
                            </span>
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </Link>

                        <Link
                            to="/admin/pagos"
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 hover:shadow-lg transition-all"
                        >
                            <span className="font-semibold text-gray-900"
                                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Gestión Pagos
                            </span>
                            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>

                    {/* ✅ Solo mostrar si es SuperAdmin */}
                    {userIsSuperAdmin && (
                        <div className="mt-6 pt-6 border-t-2 border-purple-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Opciones SuperAdmin
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link
                                    to="/admin/ia"
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 hover:shadow-lg transition-all"
                                >
                                    <span className="font-semibold text-gray-900"
                                          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                        🤖 Gestión IA Legal
                                    </span>
                                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </Link>

                                <Link
                                    to="/admin/configuracion"
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all"
                                >
                                    <span className="font-semibold text-gray-900"
                                          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                        ⚙️ Configuración Sistema
                                    </span>
                                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white shadow-xl rounded-2xl p-8 border-2 border-purple-100"
                    style={{ borderRadius: "2px" }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        Actividad Reciente
                    </h2>

                    {recentActivity.length > 0 ? (
                        <div className="space-y-4">
                            {recentActivity.map((log) => (
                                <div key={log.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                            <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {log.action}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {log.user?.profile?.firstName 
                                                ? `${log.user.profile.firstName} ${log.user.profile.lastName || ''}`
                                                : log.user?.email || 'Sistema'
                                            }
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 text-sm text-gray-500">
                                        {new Date(log.createdAt).toLocaleDateString('es-CO', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            No hay actividad reciente
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
