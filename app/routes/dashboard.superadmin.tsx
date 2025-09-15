import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";
import Layout from "~/components/Layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    if (!isSuperAdmin(user)) {
        return redirect("/dashboard");
    }

    // Get comprehensive system stats
    const [
        totalUsers,
        totalLawyers,
        totalAdmins,
        pendingLawyers,
        activeChats,
        totalRevenue,
        monthlyRevenue,
        todayRegistrations,
        totalLicenses,
        activeLicenses,
        recentActivity
    ] = await Promise.all([
        db.user.count(),
        db.lawyer.count(),
        db.user.count({ where: { role: { name: { in: ['admin', 'superadmin'] } } } }),
        db.lawyer.count({ where: { status: "pending" } }),
        db.chatSession.count({ where: { status: "active" } }),
        db.purchase.aggregate({
            _sum: { amountCents: true },
            where: { status: "completed" }
        }),
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

    return json({
        user,
        stats: {
            totalUsers,
            totalLawyers,
            totalAdmins,
            pendingLawyers,
            activeChats,
            totalRevenue: totalRevenue._sum.amountCents || 0,
            monthlyRevenue: monthlyRevenue._sum.amountCents || 0,
            todayRegistrations,
            totalLicenses,
            activeLicenses
        },
        recentActivity
    });
};

export default function SuperAdminDashboard() {
    const { user, stats, recentActivity } = useLoaderData<typeof loader>();

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(cents / 100);
    };

    return (
        <Layout user={user}>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Panel SuperAdmin</h1>
                    <p className="mt-2 text-gray-600">
                        Control total del sistema y todas las métricas globales.
                    </p>
                </div>

                {/* Global Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-blue-100 truncate">Total Usuarios</dt>
                                        <dd className="text-2xl font-bold text-white">{stats.totalUsers}</dd>
                                        <dd className="text-xs text-blue-100">+{stats.todayRegistrations} hoy</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-green-100 truncate">Ingresos Totales</dt>
                                        <dd className="text-2xl font-bold text-white">{formatCurrency(Number(stats.totalRevenue))}</dd>
                                        <dd className="text-xs text-green-100">{formatCurrency(Number(stats.monthlyRevenue))} este mes</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-yellow-100 truncate">Total Abogados</dt>
                                        <dd className="text-2xl font-bold text-white">{stats.totalLawyers}</dd>
                                        <dd className="text-xs text-yellow-100">{stats.pendingLawyers} pendientes</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-purple-100 truncate">Licencias</dt>
                                        <dd className="text-2xl font-bold text-white">{stats.activeLicenses}</dd>
                                        <dd className="text-xs text-purple-100">{stats.totalLicenses} total</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quick Actions */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-4">
                                <Link
                                    to="/admin/usuarios"
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-md bg-blue-500 flex items-center justify-center">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-medium text-gray-900">Gestionar Usuarios</h4>
                                        <p className="text-sm text-gray-500">Ver y administrar todos los usuarios</p>
                                    </div>
                                </Link>

                                <Link
                                    to="/admin/abogados"
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-md bg-green-500 flex items-center justify-center">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-medium text-gray-900">Verificar Abogados</h4>
                                        <p className="text-sm text-gray-500">Aprobar solicitudes de verificación</p>
                                    </div>
                                    {stats.pendingLawyers > 0 && (
                                        <div className="ml-auto">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {stats.pendingLawyers}
                                            </span>
                                        </div>
                                    )}
                                </Link>

                                <Link
                                    to="/admin/licencias"
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-md bg-purple-500 flex items-center justify-center">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-medium text-gray-900">Gestionar Licencias</h4>
                                        <p className="text-sm text-gray-500">Crear y administrar planes</p>
                                    </div>
                                </Link>

                                <Link
                                    to="/admin/metricas"
                                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-md bg-indigo-500 flex items-center justify-center">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-medium text-gray-900">Métricas y Reportes</h4>
                                        <p className="text-sm text-gray-500">Análisis completo del sistema</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
                        </div>
                        <div className="p-6">
                            {recentActivity.length > 0 ? (
                                <div className="flow-root">
                                    <ul className="-mb-8">
                                        {recentActivity.map((activity, activityIdx) => (
                                            <li key={activity.id}>
                                                <div className="relative pb-8">
                                                    {activityIdx !== recentActivity.length - 1 ? (
                                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                                    ) : null}
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                                                                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                </svg>
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                            <div>
                                                                <p className="text-sm text-gray-500">
                                                                    <span className="font-medium text-gray-900">
                                                                        {activity.user?.profile?.firstName || activity.user?.email || 'Sistema'}
                                                                    </span>{' '}
                                                                    {activity.action}
                                                                </p>
                                                            </div>
                                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                                {new Date(activity.createdAt).toLocaleDateString('es-CO', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0.621 0 1.125-.504 1.125-1.125V9.375c0-.621.504-1.125 1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                    </svg>
                                    <p className="mt-2">No hay actividad reciente</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="mt-8 bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Estado del Sistema</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                    </svg>
                                </div>
                                <h4 className="mt-2 text-lg font-medium text-gray-900">Sistema Operativo</h4>
                                <p className="text-sm text-gray-500">Todos los servicios funcionando correctamente</p>
                            </div>

                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                                    </svg>
                                </div>
                                <h4 className="mt-2 text-lg font-medium text-gray-900">Base de Datos</h4>
                                <p className="text-sm text-gray-500">Conectada y funcionando óptimamente</p>
                            </div>

                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.691 1.358 3.061 3.049 3.061h4.203l2.477 2.477c.329.329.821.329 1.15 0l2.477-2.477h4.203c1.691 0 3.049-1.37 3.049-3.061V6.75c0-1.691-1.358-3.061-3.049-3.061H3.299c-1.691 0-3.049 1.37-3.049 3.061v8.25z" />
                                    </svg>
                                </div>
                                <h4 className="mt-2 text-lg font-medium text-gray-900">Chat Activos</h4>
                                <p className="text-sm text-gray-500">{stats.activeChats} conversaciones en curso</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
