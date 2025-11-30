import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    // Solo SuperAdmin puede acceder
    if (!isSuperAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    // Obtener todas las licencias
    const licenses = await db.userLicense.findMany({
        include: {
            user: {
                include: {
                    profile: true
                }
            },
            license: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Serializar Decimal fields
    const serializedLicenses = licenses.map(l => ({
        ...l,
        hoursRemaining: Number(l.hoursRemaining),
        license: {
            ...l.license,
            hoursTotal: Number(l.license.hoursTotal),
            priceCents: Number(l.license.priceCents)
        }
    }));

    return json({ user, licenses: serializedLicenses });
};

export default function AdminTestLicenses() {
    const { licenses } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();

    const checkExpired = () => {
        fetcher.load("/api/test/expire-licenses");
    };

    const now = new Date();

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-orange-50/20">
            <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="h-1 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 mb-6 rounded-full" />

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
                                    🧪 Testing de Licencias
                                </h1>
                                <p className="text-lg text-gray-600 italic mt-2">
                                    Herramienta de desarrollo para probar expiración de licencias
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-0.5 bg-gradient-to-r from-red-400 via-transparent to-orange-400" />
                </motion.div>

                {/* Control Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 bg-white shadow-xl rounded-xl p-6 border-2 border-red-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Panel de Control de Testing
                            </h3>
                            <p className="text-sm text-gray-600">
                                Ejecuta manualmente el proceso de expiración de licencias
                            </p>
                        </div>
                        <button
                            onClick={checkExpired}
                            disabled={fetcher.state !== "idle"}
                            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-lg disabled:bg-gray-400"
                        >
                            {fetcher.state !== "idle" ? "Procesando..." : "🔄 Marcar Expiradas"}
                        </button>
                    </div>

                    {/* Result */}
                    {fetcher.data && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                        >
                            <p className="text-sm font-semibold text-green-800 mb-2">
                                ✅ Proceso completado
                            </p>
                            <div className="text-xs text-green-700 space-y-1">
                                <p>• Licencias marcadas como expiradas: <strong>{fetcher.data.marked}</strong></p>
                                <p>• Expiradas por fecha: <strong>{fetcher.data.expiredByDate}</strong></p>
                                <p>• Expiradas por horas: <strong>{fetcher.data.expiredByHours}</strong></p>
                                <p>• Total activas: <strong>{fetcher.data.summary?.active}</strong></p>
                                <p>• Total expiradas: <strong>{fetcher.data.summary?.expired}</strong></p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Licenses List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white shadow-xl rounded-xl border-2 border-red-100 overflow-hidden"
                >
                    <div className="px-6 py-5 border-b-2 border-red-100 bg-gradient-to-r from-red-50 to-orange-50">
                        <h3 className="text-xl font-bold text-gray-900"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            📋 Todas las Licencias ({licenses.length})
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y-2 divide-red-100">
                            <thead className="bg-red-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                        Horas
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                        Expira
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                                        ¿Debería Expirar?
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-red-50">
                                {licenses.map((license) => {
                                    const shouldExpireByDate = license.expiresAt && new Date(license.expiresAt) <= now;
                                    const shouldExpireByHours = license.hoursRemaining <= 0;
                                    const shouldExpire = shouldExpireByDate || shouldExpireByHours;

                                    return (
                                        <tr key={license.id} className={shouldExpire ? 'bg-red-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {license.user.profile?.firstName || license.user.email.split('@')[0]}
                                                </div>
                                                <div className="text-sm text-gray-500">{license.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {license.license.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    license.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    license.status === 'expired' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {license.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={shouldExpireByHours ? 'text-red-600 font-bold' : ''}>
                                                    {license.hoursRemaining}h
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {license.expiresAt ? (
                                                    <span className={shouldExpireByDate ? 'text-red-600 font-bold' : ''}>
                                                        {new Date(license.expiresAt).toLocaleDateString('es-CO')}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">∞ Infinita</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {shouldExpire ? (
                                                    <span className="text-red-600 font-bold">
                                                        ❌ SÍ 
                                                        {shouldExpireByDate && ' (fecha)'}
                                                        {shouldExpireByHours && ' (horas)'}
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600">✅ NO</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
