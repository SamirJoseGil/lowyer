import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isAdmin } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const search = url.searchParams.get("search") || "";
    const paymentMethod = url.searchParams.get("paymentMethod") || "";

    const limit = 20;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (status) {
        where.status = status;
    }

    const [purchases, totalPurchases, totalRevenue, totalCompleted] = await Promise.all([
        db.purchase.findMany({
            where,
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                license: true
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        }),
        db.purchase.count({ where }),
        db.purchase.aggregate({
            _sum: { amountCents: true },
        }),
        db.purchase.count({
            where: { ...where, status: "completed" }
        })
    ]);

    // ✅ Serializar BigInt fields
    const serializedPurchases = purchases.map(purchase => ({
        ...purchase,
        amountCents: Number(purchase.amountCents),
        license: purchase.license ? {
            ...purchase.license,
            hoursTotal: Number(purchase.license.hoursTotal),
            priceCents: Number(purchase.license.priceCents)
        } : null
    }));

    const totalPages = Math.ceil(totalPurchases / limit);

    const stats = {
        totalRevenue: Number(totalRevenue._sum.amountCents || 0),
        totalCompleted: totalCompleted || 0
    };

    return json({
        user,
        purchases: serializedPurchases,
        totalPurchases,
        totalPages,
        currentPage: page,
        filters: { search, status, paymentMethod },
        stats
    });
};

export default function AdminPagos() {
    const { purchases, totalPurchases, totalPages, currentPage, filters, stats } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(cents / 100);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return 'Completado';
            case 'pending': return 'Pendiente';
            case 'failed': return 'Fallido';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20">
            {/* Decorative Background */}
            <div className="fixed inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-green-200/40 to-emerald-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-20 w-80 h-80 bg-gradient-to-r from-yellow-200/30 to-green-200/20 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header con estilo editorial */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-yellow-400 mb-6 rounded-full" />

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
                                    Gestión de Pagos 💳
                                </h1>
                                <p className="text-lg text-gray-600 italic mt-2"
                                   style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    Administra transacciones, facturas y revenue del sistema
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-0.5 bg-gradient-to-r from-green-400 via-transparent to-emerald-400" />
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {[
                        {
                            label: "Revenue Total",
                            value: formatCurrency(stats.totalRevenue),
                            icon: "💰",
                            color: "from-green-500 to-emerald-500",
                            detail: "Ingresos completados"
                        },
                        {
                            label: "Transacciones Exitosas",
                            value: stats.totalCompleted,
                            icon: "✅",
                            color: "from-blue-500 to-cyan-500",
                            detail: "Pagos confirmados"
                        }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.03, y: -5 }}
                            className="relative overflow-hidden bg-white rounded-2xl shadow-lg border-2 border-green-100"
                            style={{ borderRadius: "2px" }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />

                            <div className="relative p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-4xl">{stat.icon}</span>
                                    <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg shadow-lg`}>
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                        </svg>
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

                                <div className="mt-4 h-1 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6 bg-white shadow-lg rounded-xl p-4 border-2 border-green-100"
                    style={{ borderRadius: "2px" }}
                >
                    <form method="get" className="flex items-center space-x-4">
                        <div className="flex-1">
                            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2"
                                   style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Estado de Transacción
                            </label>
                            <select
                                name="status"
                                id="status"
                                defaultValue={filters.status}
                                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            >
                                <option value="">Todos</option>
                                <option value="pending">Pendiente</option>
                                <option value="completed">Completado</option>
                                <option value="failed">Fallido</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                            >
                                Filtrar
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Purchases List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white shadow-xl rounded-2xl border-2 border-green-100 overflow-hidden"
                    style={{ borderRadius: "2px" }}
                >
                    <div className="px-6 py-5 border-b-2 border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400 mb-4 rounded-full" />
                        <h3 className="text-xl font-bold text-gray-900"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            Historial de Transacciones 📋
                        </h3>
                        <p className="text-sm text-gray-600 italic mt-1">
                            Total: {totalPurchases} transacciones
                        </p>
                        <div className="h-0.5 bg-green-300 mt-3 w-1/3" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y-2 divide-green-100">
                            <thead className="bg-green-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                        Usuario
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                        Licencia
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                        Monto
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                        Fecha
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                        Factura
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-green-50">
                                {purchases.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-green-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center shadow-md">
                                                    <span className="text-sm font-medium text-white">
                                                        {purchase.user.profile?.firstName?.charAt(0) || purchase.user.email.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {purchase.user.profile?.firstName && purchase.user.profile?.lastName
                                                            ? `${purchase.user.profile.firstName} ${purchase.user.profile.lastName}`
                                                            : purchase.user.email.split('@')[0]
                                                        }
                                                    </div>
                                                    <div className="text-sm text-gray-500">{purchase.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {purchase.license?.name || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {purchase.paymentMethod || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {formatCurrency(Number(purchase.amountCents))}
                                            </div>
                                            <div className="text-xs text-gray-500">{purchase.currency}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                                                {getStatusText(purchase.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(purchase.createdAt).toLocaleDateString('es-CO', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {purchase.invoices.length > 0 ? (
                                                <Link
                                                    to={`/factura/${purchase.invoices[0].id}`}
                                                    className="text-green-600 hover:text-green-800 font-medium"
                                                >
                                                    Ver Factura
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400">Sin factura</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-green-50 px-4 py-3 flex items-center justify-between border-t-2 border-green-100 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                {currentPage > 1 && (
                                    <Link
                                        to={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: (currentPage - 1).toString() })}`}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Anterior
                                    </Link>
                                )}
                                {currentPage < totalPages && (
                                    <Link
                                        to={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: (currentPage + 1).toString() })}`}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Siguiente
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700"
                                       style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                        Mostrando <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> a{' '}
                                        <span className="font-medium">{Math.min(currentPage * 20, totalPurchases)}</span> de{' '}
                                        <span className="font-medium">{totalPurchases}</span> transacciones
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                                            <Link
                                                key={page}
                                                to={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: page.toString() })}`}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                    ? 'z-10 bg-green-600 border-green-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </Link>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
