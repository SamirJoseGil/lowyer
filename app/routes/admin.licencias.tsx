import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isAdmin } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    const licenses = await db.license.findMany({
        include: {
            _count: {
                select: {
                    userLicenses: true,
                    purchases: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Fetch user licenses with user and license info
    const userLicenses = await db.userLicense.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    profile: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            },
            license: {
                select: {
                    id: true,
                    name: true,
                    hoursTotal: true
                }
            }
        },
        orderBy: { startedAt: 'desc' }
    });

    // Serializar BigInt y Decimal fields
    const serializedLicenses = licenses.map(license => ({
        ...license,
        hoursTotal: Number(license.hoursTotal),
        priceCents: Number(license.priceCents)
    }));

    const serializedUserLicenses = userLicenses.map(userLicense => ({
        ...userLicense,
        hoursRemaining: Number(userLicense.hoursRemaining),
        license: {
            ...userLicense.license,
            hoursTotal: Number(userLicense.license.hoursTotal)
        }
    }));

    return json({
        user,
        licenses: serializedLicenses,
        userLicenses: serializedUserLicenses
    });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    const formData = await request.formData();
    const actionType = formData.get("action");

    try {
        switch (actionType) {
            case "create-license": {
                const name = formData.get("name") as string;
                const type = formData.get("type") as string;
                const hoursTotal = parseFloat(formData.get("hoursTotal") as string);
                const validityDaysRaw = formData.get("validityDays");
                const appliesTo = formData.get("appliesTo") as string;
                const priceCents = parseInt(formData.get("priceCents") as string);
                const currency = (formData.get("currency") as string) || "COP";

                // validityDays puede ser vacío o 0 para infinito
                let validityDays = 9999;
                if (validityDaysRaw !== null && validityDaysRaw !== "" && !isNaN(Number(validityDaysRaw))) {
                    validityDays = parseInt(validityDaysRaw as string);
                    if (validityDays === 0) validityDays = 9999;
                }

                if (
                    !name ||
                    !type ||
                    isNaN(hoursTotal) ||
                    isNaN(priceCents) ||
                    !appliesTo
                ) {
                    return json({ error: "Datos inválidos" }, { status: 400 });
                }

                await db.license.create({
                    data: {
                        name,
                        type,
                        hoursTotal,
                        validityDays,
                        appliesTo,
                        priceCents: BigInt(priceCents),
                        currency,
                        active: true,
                    },
                });

                return json({ success: "Licencia creada correctamente" });
            }

            case "toggle-license": {
                const licenseId = formData.get("licenseId") as string;
                if (!licenseId) {
                    return json({ error: "ID de licencia faltante" }, { status: 400 });
                }
                const license = await db.license.findUnique({ where: { id: licenseId } });
                if (!license) {
                    return json({ error: "Licencia no encontrada" }, { status: 404 });
                }
                await db.license.update({
                    where: { id: licenseId },
                    data: { active: !license.active },
                });
                return json({ success: "Estado de licencia actualizado" });
            }

            case "assign-license": {
                const userEmail = formData.get("userEmail") as string;
                const licenseId = formData.get("licenseId") as string;

                if (!userEmail || !licenseId) {
                    return json({ error: "Email de usuario y licencia requeridos" }, { status: 400 });
                }

                // Buscar usuario por email
                const targetUser = await db.user.findUnique({
                    where: { email: userEmail },
                });

                if (!targetUser) {
                    return json({ error: "Usuario no encontrado" }, { status: 404 });
                }

                // Buscar licencia
                const license = await db.license.findUnique({
                    where: { id: licenseId },
                });

                if (!license) {
                    return json({ error: "Licencia no encontrada" }, { status: 404 });
                }

                // Asignar licencia al usuario
                await db.userLicense.create({
                    data: {
                        userId: targetUser.id,
                        licenseId: license.id,
                        hoursRemaining: license.hoursTotal,
                        startedAt: new Date(),
                        expiresAt: license.validityDays >= 9999 ? null : new Date(Date.now() + license.validityDays * 24 * 60 * 60 * 1000),
                        status: "active",
                    },
                });

                return json({ success: "Licencia asignada correctamente" });
            }

            default:
                return json({ error: "Acción no válida" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error in admin action:", error);
        return json({ error: "Error interno del servidor" }, { status: 500 });
    }
};

export default function AdminLicencias() {
    const { licenses, userLicenses } = useLoaderData<typeof loader>();
    const [basePriceUSD, setBasePriceUSD] = useState(0);

    // Hardcoded exchange rate for USD to COP (you can replace with a dynamic value if needed)
    const exchangeRates = {
        USD_TO_COP: 4000, // Ejemplo: 1 USD = 4000 COP
    };

    // Converts USD to COP using the exchange rate
    const convertUSDToCOP = (usd: number) => {
        return Math.round(usd * exchangeRates.USD_TO_COP);
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(cents / 100);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'trial': return 'from-blue-500 to-cyan-500';
            case 'standard': return 'from-green-500 to-emerald-500';
            case 'premium': return 'from-purple-500 to-pink-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'expired': return 'bg-red-100 text-red-800';
            case 'trial': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20">
            {/* Decorative Background */}
            <div className="fixed inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-indigo-200/40 to-purple-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-20 w-80 h-80 bg-gradient-to-r from-purple-200/30 to-pink-200/20 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header con estilo editorial */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-6 rounded-full" />

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
                                    Gestión de Licencias 🎫
                                </h1>
                                <p className="text-lg text-gray-600 italic mt-2"
                                   style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    Administra planes, precios y licencias activas del sistema
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-0.5 bg-gradient-to-r from-indigo-400 via-transparent to-purple-400" />
                </motion.div>

                {/* Asignar Licencia a Usuario */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="border-2 border-dashed border-green-200 rounded-xl p-5 mt-6 mb-8"
                >
                    <Form method="post" className="space-y-3">
                        <input type="hidden" name="action" value="assign-license" />
                        <h4 className="font-bold text-gray-900 mb-3"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            🎁 Asignar Licencia a Usuario
                        </h4>
                        <input
                            type="email"
                            name="userEmail"
                            placeholder="Email del usuario"
                            required
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 w-full"
                        />
                        <select
                            name="licenseId"
                            required
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 w-full"
                        >
                            <option value="">Selecciona una licencia</option>
                            {licenses.map((license) => (
                                <option key={license.id} value={license.id}>
                                    {license.name} ({license.type})
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all"
                        >
                            Asignar Licencia
                        </button>
                    </Form>
                </motion.div>


                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Available Licenses */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white shadow-xl rounded-2xl border-2 border-indigo-100"
                        style={{ borderRadius: "2px" }}
                    >
                        <div className="px-6 py-5 border-b-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="h-1 bg-gradient-to-r from-indigo-400 to-purple-400 mb-4 rounded-full" />
                            <h3 className="text-xl font-bold text-gray-900"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Planes Disponibles 📋
                            </h3>
                            <div className="h-0.5 bg-indigo-300 mt-3 w-1/3" />
                        </div>

                        <div className="p-6 space-y-4">
                            {licenses.map((license, index) => (
                                <motion.div
                                    key={license.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    className="relative overflow-hidden rounded-xl border-2 border-indigo-100 p-5"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${getTypeColor(license.type)} opacity-5`} />
                                    
                                    <div className="relative">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900"
                                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                    {license.name}
                                                </h4>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTypeColor(license.type)} text-white mt-1`}>
                                                    {license.type}
                                                </span>
                                            </div>
                                            <Form method="post" className="inline">
                                                <input type="hidden" name="action" value="toggle-license" />
                                                <input type="hidden" name="licenseId" value={license.id} />
                                                <button
                                                    type="submit"
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${license.active
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {license.active ? '✓ Activo' : '✗ Inactivo'}
                                                </button>
                                            </Form>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-600 font-medium">Horas:</span>
                                                <p className="font-bold text-gray-900">{license.hoursTotal}h</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 font-medium">Validez:</span>
                                                <p className="font-bold text-gray-900">
                                                    {license.validityDays >= 9999 ? '∞ Infinita' : `${license.validityDays} días`}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 font-medium">Precio:</span>
                                                <p className="font-bold text-gray-900">{formatCurrency(license.priceCents)}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 font-medium">Aplica a:</span>
                                                <p className="font-bold text-gray-900">{license.appliesTo}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                                            <span>👥 {license._count.userLicenses} usuarios</span>
                                            <span>💳 {license._count.purchases} compras</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Create New License Form with Currency Converter */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="border-2 border-dashed border-indigo-200 rounded-xl p-5"
                            >
                                <Form method="post" className="space-y-3">
                                    <input type="hidden" name="action" value="create-license" />
                                    <h4 className="font-bold text-gray-900 mb-3"
                                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                        ➕ Nueva Licencia
                                    </h4>
                                    
                                    {/* Currency Converter Section */}
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200 mb-4">
                                        <p className="text-xs font-semibold text-gray-700 mb-2">
                                            💱 Convertidor de Monedas
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-gray-600">De USD $</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={basePriceUSD}
                                                    onChange={(e) => setBasePriceUSD(parseFloat(e.target.value) || 0)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-600">A COP $</label>
                                                <input
                                                    type="text"
                                                    value={convertUSDToCOP(basePriceUSD).toLocaleString()}
                                                    readOnly
                                                    className="w-full px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 italic">
                                            Tasa: 1 USD = {exchangeRates.USD_TO_COP.toLocaleString()} COP
                                        </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Nombre"
                                            required
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <select
                                            name="type"
                                            required
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Tipo</option>
                                            <option value="trial">Trial</option>
                                            <option value="standard">Standard</option>
                                            <option value="premium">Premium</option>
                                        </select>
                                        <input
                                            type="number"
                                            name="hoursTotal"
                                            placeholder="Horas"
                                            required
                                            step="0.5"
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <input
                                            type="number"
                                            name="validityDays"
                                            placeholder="Días (0 = infinito)"
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <input
                                            type="number"
                                            name="priceCents"
                                            placeholder="Precio (centavos)"
                                            required
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <select
                                            name="currency"
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="COP">COP</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="MXN">MXN</option>
                                        </select>
                                        <select
                                            name="appliesTo"
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 col-span-2"
                                        >
                                            <option value="both">Ambos (IA + Abogado)</option>
                                            <option value="ia">Solo IA</option>
                                            <option value="lawyer">Solo Abogado</option>
                                        </select>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                                    >
                                        Crear Licencia
                                    </button>
                                    
                                    <p className="text-xs text-gray-500 italic text-center">
                                        💡 Deja "Días" en 0 o vacío para licencia infinita
                                    </p>
                                </Form>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Active User Licenses */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white shadow-xl rounded-2xl border-2 border-purple-100"
                        style={{ borderRadius: "2px" }}
                    >
                        <div className="px-6 py-5 border-b-2 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 mb-4 rounded-full" />
                            <h3 className="text-xl font-bold text-gray-900"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Licencias de Usuarios 👥
                            </h3>
                            <div className="h-0.5 bg-purple-300 mt-3 w-1/3" />
                        </div>

                        <div className="p-6 max-h-[700px] overflow-y-auto space-y-4">
                            {userLicenses.length > 0 ? (
                                userLicenses.map((userLicense, index) => (
                                    <motion.div
                                        key={userLicense.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + index * 0.05 }}
                                        className="p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg border-2 border-purple-100"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
                                                    <span className="text-sm font-bold text-white">
                                                        {userLicense.user.profile?.firstName?.charAt(0) || userLicense.user.email.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm"
                                                       style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                        {userLicense.user.profile?.firstName && userLicense.user.profile?.lastName
                                                            ? `${userLicense.user.profile.firstName} ${userLicense.user.profile.lastName}`
                                                            : userLicense.user.email.split('@')[0]
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-500">{userLicense.user.email}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userLicense.status)}`}>
                                                {userLicense.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                            <div>
                                                <span className="text-gray-600">Plan:</span>
                                                <p className="font-bold text-gray-900">{userLicense.license.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Horas:</span>
                                                <p className="font-bold text-gray-900">{userLicense.hoursRemaining}h restantes</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Inicio:</span>
                                                <p className="text-gray-900">
                                                    {new Date(userLicense.startedAt).toLocaleDateString('es-CO')}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Expira:</span>
                                                <p className="text-gray-900">
                                                    {userLicense.expiresAt
                                                        ? new Date(userLicense.expiresAt).toLocaleDateString('es-CO')
                                                        : 'Sin límite'
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(100, (userLicense.hoursRemaining / userLicense.license.hoursTotal) * 100)}%`
                                                }}
                                            />
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                    </svg>
                                    <p className="mt-4 text-gray-500 italic"
                                       style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                        No hay licencias activas
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
