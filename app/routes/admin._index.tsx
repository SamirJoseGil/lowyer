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

    const [
        totalUsers,
        totalLawyers,
        pendingLawyers,
        activeChats,
        monthlyRevenue,
        todayRegistrations,
        totalLicenses,
        activeLicenses,
        recentActivity
    ] = await Promise.all([
        db.user.count(),
        db.lawyer.count(),
        db.lawyer.count({ where: { status: "pending" } }),
        db.chatSession.count({ where: { status: "active" } }),
        db.purchase.aggregate({
            _sum: { amountCents: true },
            where: {
                status: "completed",
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        }),
        db.user.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        }),
        db.userLicense.count(),
        db.userLicense.count({ where: { status: "active" } }),
        db.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    include: {
                        profile: true
                    }
                }
            }
        })
    ]);

    const isSuperAdminUser = isSuperAdmin(user);

    return json({
        user,
        isSuperAdmin: isSuperAdminUser,
        stats: {
            totalUsers,
            totalLawyers,
            pendingLawyers,
            activeChats,
            monthlyRevenue: Number(monthlyRevenue._sum.amountCents || 0),
            todayRegistrations,
            totalLicenses,
            activeLicenses
        },
        recentActivity
    });
};

export default function AdminDashboard() {
    const { user, isSuperAdmin, stats, recentActivity } = useLoaderData<typeof loader>();

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(cents / 100);
    };

    return (
        <div className="min-h-full bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header simplificado */}
                <div className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-6 rounded-full" />
                        
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Dashboard Principal
                            </h1>
                            <p className="text-lg text-gray-600 italic"
                               style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Vista general del sistema y métricas clave
                            </p>
                        </div>

                        <div className="h-0.5 bg-gradient-to-r from-blue-400 via-transparent to-purple-400 mt-6" />
                    </motion.div>
                </div>

                {/* Stats Grid con SVG icons */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
                    {[{
                        label: "Total Usuarios",
                        value: stats.totalUsers,
                        icon: (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                        ),
                        color: "from-blue-500 to-cyan-500",
                        detail: `+${stats.todayRegistrations} hoy`
                    },
                    {
                        label: "Total Abogados",
                        value: stats.totalLawyers,
                        icon: (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                            </svg>
                        ),
                        color: "from-green-500 to-emerald-500",
                        detail: `${stats.pendingLawyers} pendientes`
                    },
                    {
                        label: "Chats Activos",
                        value: stats.activeChats,
                        icon: (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                            </svg>
                        ),
                        color: "from-purple-500 to-pink-500",
                        detail: "En tiempo real"
                    },
                    {
                        label: "Ingresos del Mes",
                        value: formatCurrency(stats.monthlyRevenue),
                        icon: (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ),
                        color: "from-yellow-500 to-orange-500",
                        detail: "COP"
                    }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="relative overflow-hidden bg-white rounded-2xl shadow-lg border-2 border-blue-100"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                        
                        <div className="relative p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                                    {stat.icon}
                                </div>
                            </div>

                            <h3 className="text-sm font-medium text-gray-600 mb-2"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                {stat.label}
                            </h3>
                            
                            <p className="text-3xl font-bold text-gray-900 mb-1"
                               style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                {stat.value}
                            </p>
                            
                            <p className="text-xs text-gray-500 italic">
                                {stat.detail}
                            </p>

                            <div className="mt-4 h-1 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full" />
                        </div>
                    </motion.div>
                ))}
                </div>

                {/* Action Cards and Activity Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quick Actions con nuevo estilo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white shadow-xl rounded-2xl border-2 border-blue-100"
                        style={{ borderRadius: "2px" }}
                    >
                        <div className="px-6 py-5 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="h-1 bg-gradient-to-r from-blue-400 to-purple-400 mb-4 rounded-full" />
                            <h3 className="text-xl font-bold text-gray-900"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Acciones Rápidas
                            </h3>
                            <div className="h-0.5 bg-blue-300 mt-3 w-1/3" />
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-4">
                                {[{
                                    to: "/admin/usuarios",
                                    icon: "👥",
                                    title: "Gestionar Usuarios",
                                    desc: "Ver y administrar todos los usuarios",
                                    color: "from-blue-500 to-cyan-500"
                                },
                                {
                                    to: "/admin/abogados",
                                    icon: "⚖️",
                                    title: "Verificar Abogados",
                                    desc: "Revisar y aprobar solicitudes",
                                    color: "from-green-500 to-emerald-500",
                                    badge: stats.pendingLawyers
                                },
                                {
                                    to: "/admin/licencias",
                                    icon: "🎫",
                                    title: "Gestionar Licencias",
                                    desc: "Crear y administrar planes",
                                    color: "from-indigo-500 to-purple-500"
                                },
                                {
                                    to: "/admin/ia",
                                    icon: "🤖",
                                    title: "Gestión de IA",
                                    desc: "Supervisar asistente legal",
                                    color: "from-purple-500 to-pink-500"
                                },
                                {
                                    to: "/admin/pagos",
                                    icon: "💳",
                                    title: "Gestionar Pagos",
                                    desc: "Ver transacciones y facturas",
                                    color: "from-yellow-500 to-orange-500"
                                },
                                {
                                    to: "/admin/reportes",
                                    icon: "📊",
                                    title: "Reportes",
                                    desc: "Estadísticas y análisis",
                                    color: "from-emerald-500 to-teal-500"
                                }
                            ].map((action) => (
                                <Link
                                    key={action.to}
                                    to={action.to}
                                    className="group relative p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity rounded-xl`} />
                                    
                                    <div className="relative flex items-center space-x-4">
                                        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                            <span className="text-2xl">{action.icon}</span>
                                        </div>
                                        
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors"
                                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                {action.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 italic">
                                                {action.desc}
                                            </p>
                                        </div>

                                        {action.badge && action.badge > 0 && (
                                            <div className="flex-shrink-0">
                                                <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-red-500 rounded-full">
                                                    {action.badge}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Activity con nuevo estilo */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white shadow-xl rounded-2xl border-2 border-blue-100"
                        style={{ borderRadius: "2px" }}
                    >
                        <div className="px-6 py-5 border-b-2 border-blue-100 bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 mb-4 rounded-full" />
                            <h3 className="text-xl font-bold text-gray-900"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Actividad Reciente
                            </h3>
                            <div className="h-0.5 bg-purple-300 mt-3 w-1/3" />
                        </div>

                        <div className="p-6 max-h-[600px] overflow-y-auto">
                            {recentActivity.length > 0 ? (
                                <div className="space-y-4">
                                    {recentActivity.map((activity, activityIdx) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 + activityIdx * 0.05 }}
                                            className="relative flex space-x-3 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg border border-blue-100"
                                        >
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center shadow-md">
                                                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900">
                                                    <span className="font-bold"
                                                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                        {activity.user?.profile?.firstName || activity.user?.email || 'Sistema'}
                                                    </span>
                                                    {' '}
                                                    <span className="text-gray-600">{activity.action}</span>
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(activity.createdAt).toLocaleDateString('es-CO', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0.621 0 1.125-.504 1.125-1.125V9.375c0-.621.504-1.125 1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                    </svg>
                                    <p className="mt-4 text-gray-500 italic"
                                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                        No hay actividad reciente
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* System Health - Only for SuperAdmin con nuevo estilo */}
                {isSuperAdmin && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-12 bg-white shadow-xl rounded-2xl border-2 border-purple-100"
                        style={{ borderRadius: "2px" }}
                    >
                        <div className="px-6 py-5 border-b-2 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 mb-4 rounded-full" />
                            <h3 className="text-xl font-bold text-gray-900"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Estado del Sistema
                            </h3>
                            <div className="h-0.5 bg-purple-300 mt-3 w-1/4" />
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    {
                                        icon: "🟢",
                                        title: "Sistema Operativo",
                                        desc: "Todos los servicios funcionando",
                                        color: "from-green-500 to-emerald-500"
                                    },
                                    {
                                        icon: "💾",
                                        title: "Base de Datos",
                                        desc: "Conectada y óptima",
                                        color: "from-blue-500 to-cyan-500"
                                    },
                                    {
                                        icon: "💬",
                                        title: `${stats.activeChats} Chats Activos`,
                                        desc: "Conversaciones en curso",
                                        color: "from-purple-500 to-pink-500"
                                    }
                                ].map((item, index) => (
                                    <motion.div
                                        key={item.title}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.9 + index * 0.1 }}
                                        className="text-center p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-blue-100"
                                    >
                                        <div className="flex justify-center mb-4">
                                            <div className={`p-4 bg-gradient-to-r ${item.color} rounded-2xl shadow-lg`}>
                                                <span className="text-3xl">{item.icon}</span>
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2"
                                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 italic">
                                            {item.desc}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
