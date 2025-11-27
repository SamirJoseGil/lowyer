import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { requireUser, getUser } from "~/lib/auth.server";
import { getLicenseStats, getUserActiveLicense } from "~/lib/licenses.server";
import { canClaimTrial, claimTrial } from "~/lib/trial.server";
import { db } from "~/lib/db.server";
import LicenseStatus from "~/components/LicenseStatus";
import { useState, useEffect } from "react";
import AuthRequiredModal from "~/components/AuthRequiredModal";
import { motion } from "framer-motion";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    // Allow visiting the page even if anonymous.
    const user = await getUser(request);

    if (!user) {
        // No session: route will render the modal prompting to create account.
        return json({
            user: null,
            requiresAuth: true,
            licenseStats: null,
            availableLicenses: [],
            licenseHistory: [],
            trialEligibility: { canClaim: false }
        });
    }

    console.log(`📄 Loading licenses page for user ${user.id}`);

    const [licenseStats, availableLicenses, licenseHistory, trialEligibility] = await Promise.all([
        getLicenseStats(user.id),
        db.license.findMany({
            where: {
                active: true,
                type: { not: "trial" }
            },
            orderBy: { priceCents: 'asc' }
        }),
        db.userLicense.findMany({
            where: { userId: user.id },
            include: { license: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        }),
        canClaimTrial(user.id)
    ]);

    console.log(`📊 User ${user.id} license stats loaded: ${licenseHistory.length} licenses in history`);

    // Convert BigInt fields to numbers for JSON serialization
    const serializedAvailableLicenses = availableLicenses.map(license => ({
        ...license,
        priceCents: Number(license.priceCents),
        hoursTotal: Number(license.hoursTotal)
    }));

    const serializedLicenseHistory = licenseHistory.map(userLicense => ({
        ...userLicense,
        hoursRemaining: Number(userLicense.hoursRemaining),
        license: {
            ...userLicense.license,
            priceCents: Number(userLicense.license.priceCents),
            hoursTotal: Number(userLicense.license.hoursTotal)
        }
    }));

    const serializedLicenseStats = {
        ...licenseStats,
        totalHoursUsed: Number(licenseStats.totalHoursUsed),
        activeLicense: licenseStats.activeLicense ? {
            ...licenseStats.activeLicense,
            hoursRemaining: Number(licenseStats.activeLicense.hoursRemaining),
            license: {
                ...licenseStats.activeLicense.license,
                priceCents: Number(licenseStats.activeLicense.license.priceCents),
                hoursTotal: Number(licenseStats.activeLicense.license.hoursTotal)
            }
        } : null
    };

    return json({
        user,
        licenseStats: serializedLicenseStats,
        availableLicenses: serializedAvailableLicenses,
        licenseHistory: serializedLicenseHistory,
        trialEligibility
    });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    // actions must still require auth
    const user = await requireUser(request);
    const formData = await request.formData();
    const action = formData.get("action");

    console.log(`🎯 License action requested by user ${user.id}: ${action}`);

    switch (action) {
        case "claim-trial": {
            try {
                const trialLicense = await claimTrial(user.id);
                console.log(`🎉 Trial claimed successfully by user ${user.id}`);
                return json({
                    success: true,
                    message: "¡Trial gratuito activado! Ya puedes usar el chat."
                });
            } catch (error) {
                console.error(`💥 Error claiming trial for user ${user.id}:`, error);
                return json({
                    success: false,
                    error: error instanceof Error ? error.message : "Error al activar el trial"
                }, { status: 400 });
            }
        }

        default:
            console.log(`❌ Invalid action: ${action}`);
            return json({ error: "Acción no válida" }, { status: 400 });
    }
};

type ActionData = {
    success?: boolean;
    message?: string;
    error?: string;
};

export default function Licencias() {
    const data = useLoaderData<typeof loader>();
    const claimTrialFetcher = useFetcher<ActionData>();
    const [authModalOpen, setAuthModalOpen] = useState(false);

    // If loader returned requiresAuth, show the modal in this route
    useEffect(() => {
        if ((data as any).requiresAuth) setAuthModalOpen(true);
    }, [data]);

    if ((data as any).requiresAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <AuthRequiredModal
                    isOpen={authModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    feature="licenses"
                />
            </div>
        );
    }

    const { user, licenseStats, availableLicenses, licenseHistory, trialEligibility } = data;

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(cents / 100);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'expired': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-white">
            {/* Organic Background Textures */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
                className="fixed inset-0 z-0 pointer-events-none"
            >
                <motion.div
                    animate={{
                        rotate: [0, 2, -2, 1, 0],
                        scale: [1, 1.05, 0.95, 1.02, 1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-50/40 to-cyan-100/20 rounded-full blur-3xl"
                />

                <motion.div
                    animate={{
                        x: [0, 10, -10, 5, 0],
                        y: [0, -5, 10, -5, 0]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-32 left-20 w-80 h-40 bg-gradient-to-r from-sky-50/30 to-blue-100/20 blur-2xl"
                    style={{ borderRadius: "50% 30% 60% 40%" }}
                />
            </motion.div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header con estilo editorial */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12 text-center"
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-0.5 bg-blue-300 mb-6 mx-auto max-w-2xl"
                    />

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        Mis Licencias
                    </h1>

                    <p className="text-xl text-gray-600 italic max-w-2xl mx-auto"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        Gestiona tus planes de acceso y consulta tu historial de uso
                    </p>

                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "40%" }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="h-0.5 bg-blue-400 mx-auto mt-6"
                    />
                </motion.div>

                {/* Grid principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Current License Status */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado Actual</h2>
                            <LicenseStatus activeLicense={licenseStats && licenseStats.activeLicense ? {
                                ...licenseStats.activeLicense,
                                hoursRemaining: Number(licenseStats.activeLicense.hoursRemaining),
                                expiresAt: licenseStats.activeLicense.expiresAt ? new Date(licenseStats.activeLicense.expiresAt) : null,
                                license: {
                                    ...licenseStats.activeLicense.license,
                                    hoursTotal: Number(licenseStats.activeLicense.license.hoursTotal)
                                }
                            } : null} />

                            {/* Trial Claim Section */}
                            {licenseStats && !licenseStats.activeLicense && trialEligibility.canClaim && (
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124c-.85 0-1.673.133-2.5.374C8.243 3.094 5 6.795 5 11.25v.875c0 .621.504 1.125 1.125 1.125z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-lg font-medium text-blue-900">
                                                ¡Reclama tu Trial Gratuito!
                                            </h3>
                                            <p className="mt-2 text-sm text-blue-700">
                                                Tienes derecho a 2 horas gratuitas para probar nuestro asistente legal.
                                                ¡No necesitas tarjeta de crédito!
                                            </p>

                                            {claimTrialFetcher.data?.success && (
                                                <div className="mt-3 text-sm font-medium text-green-700">
                                                    {claimTrialFetcher.data.message}
                                                </div>
                                            )}

                                            {claimTrialFetcher.data?.error && (
                                                <div className="mt-3 text-sm font-medium text-red-700">
                                                    {claimTrialFetcher.data.error}
                                                </div>
                                            )}

                                            <div className="mt-4">
                                                <claimTrialFetcher.Form method="post">
                                                    <input type="hidden" name="action" value="claim-trial" />
                                                    <button
                                                        type="submit"
                                                        disabled={claimTrialFetcher.state === "submitting"}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                                    >
                                                        {claimTrialFetcher.state === "submitting" ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Activando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124c-.85 0-1.673.133-2.5.374C8.243 3.094 5 6.795 5 11.25v.875c0 .621.504 1.125 1.125 1.125z" />
                                                                </svg>
                                                            </>
                                                        )}
                                                    </button>
                                                </claimTrialFetcher.Form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {licenseStats && !licenseStats.activeLicense && !trialEligibility.canClaim && (
                                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">
                                        {trialEligibility.reason || "No tienes licencias activas"}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Available Plans */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Planes Disponibles</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {availableLicenses.map((license) =>
                                    license ? (
                                        <div key={license.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-law-accent transition-colors">
                                            <div className="text-center">
                                                <h3 className="text-lg font-semibold text-gray-900">{license.name}</h3>
                                                <div className="mt-4">
                                                    <span className="text-3xl font-bold text-gray-900">
                                                        {formatCurrency(Number(license.priceCents))}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm text-gray-500">
                                                    {Number(license.hoursTotal)} horas • {license.validityDays} días
                                                </p>
                                            </div>

                                            <div className="mt-6">
                                                <ul className="space-y-2 text-sm text-gray-600">
                                                    <li className="flex items-center">
                                                        <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                        Acceso al chat de IA legal
                                                    </li>
                                                    {license.appliesTo === "both" && (
                                                        <li className="flex items-center">
                                                            <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                            </svg>
                                                            Consultas con abogados
                                                        </li>
                                                    )}
                                                    <li className="flex items-center">
                                                        <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                        Soporte 24/7
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="mt-6">
                                                <button
                                                    className="w-full bg-law-accent text-white px-4 py-2 rounded-md hover:bg-law-accent/90 transition-colors"
                                                    disabled={!!licenseStats && !!licenseStats.activeLicense}
                                                >
                                                    {licenseStats && licenseStats.activeLicense ? 'Ya tienes una licencia activa' : 'Comprar Plan'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : null
                                )}
                            </div>
                        </div>

                        {/* License History */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de Licencias</h2>
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                {licenseHistory.length > 0 ? (
                                    <div className="divide-y divide-gray-200">
                                        {licenseHistory.map((userLicense) =>
                                            userLicense ? (
                                                <div key={userLicense.id} className="p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="text-sm font-medium text-gray-900">
                                                                {userLicense.license.name}
                                                                {userLicense.source === "trial" && (
                                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                        Trial
                                                                    </span>
                                                                )}
                                                            </h3>
                                                            <div className="mt-1 text-sm text-gray-500">
                                                                <span>Horas restantes: {Number(userLicense.hoursRemaining).toFixed(1)}</span>
                                                                {userLicense.expiresAt && (
                                                                    <span className="ml-4">
                                                                        Expira: {new Date(userLicense.expiresAt).toLocaleDateString('es-CO')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Creada: {new Date(userLicense.createdAt).toLocaleDateString('es-CO')}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userLicense.status)}`}>
                                                                {userLicense.status === 'active' ? 'Activa' :
                                                                    userLicense.status === 'expired' ? 'Expirada' : userLicense.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : null
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-gray-500">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0.621 0 1.125-.504 1.125-1.125V9.375c0-.621.504-1.125 1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                        </svg>
                                        <p className="mt-2">No tienes historial de licencias</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar with Stats */}
                    <div className="space-y-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas de Uso</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Horas usadas en total</span>
                                        <span className="font-medium">{licenseStats ? Number(licenseStats.totalHoursUsed).toFixed(1) : "0.0"}h</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Sesiones totales</span>
                                        <span className="font-medium">{licenseStats ? licenseStats.totalSessions : "0"}</span>
                                    </div>
                                </div>
                                {licenseStats && licenseStats.lastSession && (
                                    <div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Última sesión</span>
                                            <span className="font-medium">
                                                {new Date(licenseStats.lastSession).toLocaleDateString('es-CO')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-blue-900 mb-2">¿Necesitas ayuda?</h3>
                            <p className="text-sm text-blue-700 mb-4">
                                Contáctanos si tienes preguntas sobre los planes o necesitas asistencia.
                            </p>
                            <Link
                                to="/contacto"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                            >
                                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 00-3.224 0l-1.638 1.637-1.637-1.637a2.25 2.25 0 00-3.224 3.224l1.637 1.637-1.637 1.637a2.25 2.25 0 003.224 3.224l1.637-1.637 1.638 1.637a2.25 2.25 0 003.224-3.224l-1.637-1.637 1.637-1.637a2.25 2.25 0 000-3.224z" />
                                </svg>
                                Contactar Soporte
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
