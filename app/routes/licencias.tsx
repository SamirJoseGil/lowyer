import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { getUserActiveLicense } from "~/lib/licenses.server";
import { canClaimTrial, claimTrial } from "~/lib/trial.server"; // ✅ Importar desde trial.server.ts
import { db } from "~/lib/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);
    
    const [activeLicense, licenses, canClaim, userLicenseHistory] = await Promise.all([
        getUserActiveLicense(user.id),
        db.license.findMany({
            where: { active: true },
            orderBy: { priceCents: 'asc' }
        }),
        canClaimTrial(user.id), // ✅ Ahora debería funcionar
        db.userLicense.findMany({
            where: { userId: user.id },
            include: { license: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        })
    ]);

    // Serialize Decimal fields
    const serializedLicenses = licenses.map(l => ({
        ...l,
        hoursTotal: Number(l.hoursTotal),
        priceCents: Number(l.priceCents)
    }));

    const serializedActiveLicense = activeLicense ? {
        ...activeLicense,
        hoursRemaining: Number(activeLicense.hoursRemaining),
        license: {
            ...activeLicense.license,
            hoursTotal: Number(activeLicense.license.hoursTotal),
            priceCents: Number(activeLicense.license.priceCents)
        }
    } : null;

    const serializedHistory = userLicenseHistory.map(ul => ({
        ...ul,
        hoursRemaining: Number(ul.hoursRemaining),
        license: {
            ...ul.license,
            hoursTotal: Number(ul.license.hoursTotal),
            priceCents: Number(ul.license.priceCents)
        }
    }));

    return json({
        user,
        activeLicense: serializedActiveLicense,
        licenses: serializedLicenses,
        canClaimTrial: canClaim,
        licenseHistory: serializedHistory
    });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const user = await requireUser(request);
    const formData = await request.formData();
    const action = formData.get("action");

    if (action === "claim-trial") {
        const result = await claimTrial(user.id); // ✅ Importado desde trial.server.ts
        
        if (result.success) {
            return redirect("/licencias?trial=claimed");
        } else {
            return json({ error: result.error }, { status: 400 });
        }
    }

    return json({ error: "Acción no válida" }, { status: 400 });
};

export default function Licencias() {
    const { activeLicense, licenses, canClaimTrial, licenseHistory } = useLoaderData<typeof loader>();

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(cents / 100);
    };

    const getLicenseIcon = (type: string) => {
        switch (type) {
            case 'trial':
                return (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            case 'standard':
                return (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'premium':
                return (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getTypeGradient = (type: string) => {
        switch (type) {
            case 'trial': return 'from-blue-500 to-cyan-500';
            case 'standard': return 'from-green-500 to-emerald-500';
            case 'premium': return 'from-purple-500 to-pink-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
            {/* Decorative Background */}
            <div className="fixed inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-200/50 to-purple-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-20 w-80 h-80 bg-gradient-to-r from-cyan-200/40 to-blue-200/30 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-8 rounded-full max-w-md mx-auto" />
                    
                    <h1 className="text-5xl font-bold text-gray-900 mb-4"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        Planes y Licencias
                    </h1>
                    
                    <p className="text-xl text-gray-600 italic max-w-2xl mx-auto"
                       style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        Elige el plan perfecto para tu asesoría legal
                    </p>

                    <div className="h-0.5 bg-gradient-to-r from-blue-300 via-transparent to-purple-300 mt-8 max-w-xs mx-auto" />
                </motion.div>

                {/* Active License Card */}
                {activeLicense && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mb-12"
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-1 shadow-2xl">
                            <div className="bg-white rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900"
                                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                Tu Licencia Actual
                                            </h3>
                                            <p className="text-sm text-gray-600 font-semibold">
                                                {activeLicense.license.name}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                                        ✓ Activa
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
                                        <div className="text-sm text-gray-600 mb-2 font-medium">Horas Disponibles</div>
                                        <div className="text-4xl font-bold text-gray-900">
                                            {activeLicense.hoursRemaining.toFixed(1)}h
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            de {activeLicense.license.hoursTotal}h totales
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                                        <div className="text-sm text-gray-600 mb-2 font-medium">Válida hasta</div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {activeLicense.expiresAt 
                                                ? new Date(activeLicense.expiresAt).toLocaleDateString('es-CO', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })
                                                : 'Sin límite'
                                            }
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            {activeLicense.license.validityDays >= 9999 ? 'Licencia infinita' : `${activeLicense.license.validityDays} días`}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                                        <div className="text-sm text-gray-600 mb-2 font-medium">Aplica a</div>
                                        <div className="text-2xl font-bold text-gray-900 capitalize">
                                            {activeLicense.license.appliesTo === 'both' ? 'IA + Abogado' : activeLicense.license.appliesTo}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            Servicios disponibles
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-700">Progreso de uso</span>
                                        <span className="font-bold text-gray-900">
                                            {Math.round((activeLicense.hoursRemaining / activeLicense.license.hoursTotal) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(activeLicense.hoursRemaining / activeLicense.license.hoursTotal) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Trial Claim Card */}
                {!activeLicense && canClaimTrial && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-12"
                    >
                        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl p-1 shadow-2xl">
                            <div className="bg-white rounded-3xl p-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <span className="text-4xl">🎁</span>
                                            <h3 className="text-3xl font-bold text-gray-900"
                                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                ¡Trial Gratuito Disponible!
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 text-lg mb-4 italic">
                                            Prueba nuestros servicios legales sin costo. 2 horas gratis para que explores todo lo que ofrecemos.
                                        </p>
                                        <ul className="space-y-2 mb-6">
                                            {['Acceso completo a IA Legal', 'Consultas con abogados certificados', '2 horas de uso gratuito', 'Sin tarjeta de crédito'].map((benefit, idx) => (
                                                <motion.li
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4 + idx * 0.1 }}
                                                    className="flex items-center space-x-2 text-gray-700"
                                                >
                                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-medium">{benefit}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Form method="post">
                                        <input type="hidden" name="action" value="claim-trial" />
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="submit"
                                            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all"
                                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                        >
                                            🚀 Reclamar Trial
                                        </motion.button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* License Plans Grid */}
                <div className="mb-16">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl font-bold text-gray-900 text-center mb-12"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                        Planes Disponibles
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {licenses.map((license, index) => (
                            <motion.div
                                key={license.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="relative"
                            >
                                {/* Popular Badge */}
                                {license.type === 'standard' && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                        <span className="px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg">
                                            ⭐ Más Popular
                                        </span>
                                    </div>
                                )}

                                <div className={`bg-gradient-to-br ${getTypeGradient(license.type)} p-1 rounded-3xl shadow-xl hover:shadow-2xl transition-all`}>
                                    <div className="bg-white rounded-3xl p-8 h-full">
                                        {/* Icon & Type */}
                                        <div className={`inline-flex p-4 bg-gradient-to-br ${getTypeGradient(license.type)} rounded-2xl shadow-lg mb-4 text-white`}>
                                            {getLicenseIcon(license.type)}
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-2"
                                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                            {license.name}
                                        </h3>

                                        <div className="mb-6">
                                            <span className="text-4xl font-bold text-gray-900">
                                                {formatCurrency(license.priceCents)}
                                            </span>
                                            {license.type !== 'trial' && (
                                                <span className="text-gray-600 ml-2">
                                                    / {license.validityDays >= 9999 ? 'infinito' : `${license.validityDays} días`}
                                                </span>
                                            )}
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-3 mb-8">
                                            <li className="flex items-start space-x-3">
                                                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700 font-medium">
                                                    <strong>{license.hoursTotal}h</strong> de consultas
                                                </span>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700">
                                                    {license.appliesTo === 'both' ? 'IA Legal + Abogados' :
                                                     license.appliesTo === 'ia' ? 'Solo IA Legal' : 'Solo Abogados'}
                                                </span>
                                            </li>
                                            <li className="flex items-start space-x-3">
                                                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700">
                                                    Válido por <strong>{license.validityDays >= 9999 ? 'tiempo ilimitado' : `${license.validityDays} días`}</strong>
                                                </span>
                                            </li>
                                        </ul>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`w-full py-3 bg-gradient-to-r ${getTypeGradient(license.type)} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all`}
                                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                        >
                                            {license.type === 'trial' ? 'Obtener Gratis' : 'Comprar Ahora'}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* License History */}
                {licenseHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-6"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            Historial de Licencias
                        </h2>

                        <div className="space-y-4">
                            {licenseHistory.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.9 + index * 0.1 }}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 bg-gradient-to-r ${getTypeGradient(item.license.type)} rounded-lg`}>
                                            {getLicenseIcon(item.license.type)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{item.license.name}</h4>
                                            <p className="text-sm text-gray-600">
                                                {new Date(item.createdAt).toLocaleDateString('es-CO', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                            item.status === 'active' ? 'bg-green-100 text-green-800' :
                                            item.status === 'expired' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {item.status === 'active' ? '✓ Activa' :
                                             item.status === 'expired' ? '✗ Expirada' : item.status}
                                        </span>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {item.hoursRemaining.toFixed(1)}h restantes
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
