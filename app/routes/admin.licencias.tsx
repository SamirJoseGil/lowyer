import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { isAdmin } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";
import { jsonWithBigInt } from "~/lib/utils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    const [licenses, userLicenses] = await Promise.all([
        db.license.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        userLicenses: true,
                        purchases: true
                    }
                }
            }
        }),
        db.userLicense.findMany({
            where: {
                status: "active"
            },
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                license: true
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        })
    ]);

    return jsonWithBigInt({
        user,
        licenses,
        userLicenses
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
            case "create-license": {
                const name = formData.get("name")?.toString();
                const type = formData.get("type")?.toString();
                const hoursTotal = parseFloat(formData.get("hoursTotal")?.toString() || "0");
                const validityDays = parseInt(formData.get("validityDays")?.toString() || "0");
                const appliesTo = formData.get("appliesTo")?.toString();
                const priceCents = parseInt(formData.get("priceCents")?.toString() || "0");

                if (!name || !type || !hoursTotal || !validityDays || !appliesTo) {
                    return json({ error: "Todos los campos son requeridos" }, { status: 400 });
                }

                await db.license.create({
                    data: {
                        name,
                        type,
                        hoursTotal,
                        validityDays,
                        appliesTo,
                        priceCents
                    }
                });

                return json({ success: "Licencia creada correctamente" });
            }

            case "toggle-license": {
                const licenseId = formData.get("licenseId")?.toString();
                if (!licenseId) {
                    return json({ error: "ID de licencia requerido" }, { status: 400 });
                }

                const license = await db.license.findUnique({ where: { id: licenseId } });
                if (!license) {
                    return json({ error: "Licencia no encontrada" }, { status: 404 });
                }

                await db.license.update({
                    where: { id: licenseId },
                    data: { active: !license.active }
                });

                return json({ success: `Licencia ${!license.active ? "activada" : "desactivada"}` });
            }

            default:
                return json({ error: "Acción no válida" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error in admin license action:", error);
        return json({ error: "Error interno del servidor" }, { status: 500 });
    }
};

export default function AdminLicencias() {
    const { user, licenses, userLicenses } = useLoaderData<typeof loader>();

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(cents / 100);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'trial': return 'bg-blue-100 text-blue-800';
            case 'standard': return 'bg-green-100 text-green-800';
            case 'premium': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
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
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Licencias</h1>
                        <p className="mt-2 text-gray-600">
                            Crear y administrar planes de licencias del sistema.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create License Form */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Crear Nueva Licencia</h3>
                    </div>
                    <Form method="post" className="p-6 space-y-4">
                        <input type="hidden" name="action" value="create-license" />

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Ej: Plan Básico"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo</label>
                            <select name="type" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                                <option value="">Seleccionar tipo</option>
                                <option value="trial">Trial</option>
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Horas Totales</label>
                                <input
                                    type="number"
                                    name="hoursTotal"
                                    step="0.5"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Validez (días)</label>
                                <input
                                    type="number"
                                    name="validityDays"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Aplica a</label>
                            <select name="appliesTo" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                                <option value="">Seleccionar</option>
                                <option value="ia">Solo IA</option>
                                <option value="lawyer">Solo Abogados</option>
                                <option value="both">IA y Abogados</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Precio (COP)</label>
                            <input
                                type="number"
                                name="priceCents"
                                step="100"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                placeholder="0 para gratis"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-law-accent text-white px-4 py-2 rounded-md hover:bg-law-accent/90 transition-colors"
                        >
                            Crear Licencia
                        </button>
                    </Form>
                </div>

                {/* Licenses List */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Licencias Existentes</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {licenses.map((license: {
                                id: string;
                                name: string;
                                type: string;
                                hoursTotal: number;
                                validityDays: number;
                                appliesTo: string;
                                priceCents: number | string;
                                active: boolean;
                                _count: {
                                    userLicenses: number;
                                    purchases: number;
                                };
                            }) => (
                                <div key={license.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-medium text-gray-900">{license.name}</h4>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(license.type)}`}>
                                                    {license.type}
                                                </span>
                                                {license.active ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                                        Activa
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                                        Inactiva
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 text-sm text-gray-500">
                                                {license.hoursTotal} horas • {license.validityDays} días • {license.appliesTo} • {formatCurrency(Number(license.priceCents))}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-400">
                                                {license._count.userLicenses} usuarios activos • {license._count.purchases} compras
                                            </div>
                                        </div>
                                        <Form method="post" className="inline">
                                            <input type="hidden" name="action" value="toggle-license" />
                                            <input type="hidden" name="licenseId" value={license.id} />
                                            <button
                                                type="submit"
                                                className={`px-3 py-1 rounded text-xs font-medium ${license.active
                                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                                    }`}
                                            >
                                                {license.active ? "Desactivar" : "Activar"}
                                            </button>
                                        </Form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Licenses Table */}
            <div className="mt-8 bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Licencias Activas de Usuarios</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Licencia
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Horas Restantes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Expira
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {userLicenses.map((userLicense: {
                                id: string;
                                user: {
                                    email: string;
                                    profile?: {
                                        firstName?: string;
                                        lastName?: string;
                                    } | null;
                                };
                                license: {
                                    name: string;
                                    type: string;
                                };
                                hoursRemaining: number | string;
                                expiresAt?: string | Date | null;
                                status: string;
                            }) => (
                                <tr key={userLicense.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {userLicense.user.profile?.firstName && userLicense.user.profile?.lastName
                                            ? `${userLicense.user.profile.firstName} ${userLicense.user.profile.lastName}`
                                            : userLicense.user.email
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(userLicense.license.type)}`}>
                                            {userLicense.license.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {Number(userLicense.hoursRemaining).toFixed(1)}h
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {userLicense.expiresAt
                                            ? new Date(userLicense.expiresAt).toLocaleDateString('es-CO')
                                            : 'No expira'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {userLicense.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
