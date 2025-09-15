import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { isAdmin } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";
import Layout from "~/components/Layout";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    const userId = params.userId;
    if (!userId) {
        throw new Response("User ID required", { status: 400 });
    }

    const [targetUser, roles, auditLogs, userMetrics] = await Promise.all([
        db.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                role: true,
                userLicenses: {
                    include: {
                        license: true
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                purchases: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                chatSessions: {
                    orderBy: { startedAt: 'desc' },
                    take: 5
                },
                loginAttempts: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        }),
        db.role.findMany({ orderBy: { name: 'asc' } }),
        db.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        }),
        db.userMetric.findUnique({
            where: { id: userId }
        })
    ]);

    if (!targetUser) {
        throw new Response("User not found", { status: 404 });
    }

    return json({
        user,
        targetUser,
        roles,
        auditLogs,
        userMetrics
    });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    const userId = params.userId;
    if (!userId) {
        return json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    const formData = await request.formData();
    const action = formData.get("action");

    try {
        switch (action) {
            case "change-role": {
                const newRoleId = parseInt(formData.get("roleId")?.toString() || "");
                if (!newRoleId) {
                    return json({ error: "ID de rol requerido" }, { status: 400 });
                }

                await db.user.update({
                    where: { id: userId },
                    data: { roleId: newRoleId }
                });

                // Log the action
                await db.auditLog.create({
                    data: {
                        userId: user.id,
                        action: `Cambió rol de usuario ${userId}`,
                        meta: { targetUserId: userId, newRoleId }
                    }
                });

                return json({ success: "Rol actualizado correctamente" });
            }

            case "toggle-status": {
                const targetUser = await db.user.findUnique({ where: { id: userId } });
                if (!targetUser) {
                    return json({ error: "Usuario no encontrado" }, { status: 404 });
                }

                const newStatus = targetUser.status === "active" ? "inactive" : "active";
                await db.user.update({
                    where: { id: userId },
                    data: { status: newStatus }
                });

                // Log the action
                await db.auditLog.create({
                    data: {
                        userId: user.id,
                        action: `${newStatus === "active" ? "Activó" : "Desactivó"} usuario ${userId}`,
                        meta: { targetUserId: userId, newStatus }
                    }
                });

                return json({ success: `Usuario ${newStatus === "active" ? "activado" : "desactivado"}` });
            }

            default:
                return json({ error: "Acción no válida" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error in admin action:", error);
        return json({ error: "Error interno del servidor" }, { status: 500 });
    }
};

export default function AdminUserDetail() {
    const { user, targetUser, roles, auditLogs, userMetrics } = useLoaderData<typeof loader>();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'banned': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleColor = (roleName: string) => {
        switch (roleName) {
            case 'superadmin': return 'bg-purple-100 text-purple-800';
            case 'admin': return 'bg-blue-100 text-blue-800';
            case 'abogado': return 'bg-green-100 text-green-800';
            case 'usuario': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const displayName = targetUser.profile?.firstName && targetUser.profile?.lastName
        ? `${targetUser.profile.firstName} ${targetUser.profile.lastName}`
        : targetUser.email;

    return (
        <Layout user={user}>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/admin/usuarios"
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                                <p className="text-gray-600">{targetUser.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(targetUser.status)}`}>
                                {targetUser.status}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(targetUser.role.name)}`}>
                                {targetUser.role.name}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* User Details */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
                            </div>
                            <div className="p-6">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{targetUser.profile?.firstName || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Apellido</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{targetUser.profile?.lastName || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Documento</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {targetUser.profile?.documentType ? `${targetUser.profile.documentType}: ${targetUser.profile.documentNumber}` : '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{targetUser.profile?.phone || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{targetUser.profile?.address || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email Verificado</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {targetUser.emailVerified ? (
                                                <span className="text-green-600">Sí</span>
                                            ) : (
                                                <span className="text-red-600">No</span>
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Registro</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {new Date(targetUser.createdAt).toLocaleDateString('es-CO', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Último Login</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {targetUser.lastLogin ? new Date(targetUser.lastLogin).toLocaleDateString('es-CO', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'Nunca'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Activity History */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Historial de Actividad</h3>
                            </div>
                            <div className="p-6">
                                {auditLogs.length > 0 ? (
                                    <div className="flow-root">
                                        <ul className="-mb-8">
                                            {auditLogs.map((log, logIdx) => (
                                                <li key={log.id}>
                                                    <div className="relative pb-8">
                                                        {logIdx !== auditLogs.length - 1 ? (
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
                                                                    <p className="text-sm text-gray-500">{log.action}</p>
                                                                </div>
                                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                                    {new Date(log.createdAt).toLocaleDateString('es-CO', {
                                                                        month: 'short',
                                                                        day: 'numeric',
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
                                    <p className="text-gray-500 text-center">No hay actividad registrada</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Actions */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Acciones</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Change Role */}
                                <Form method="post">
                                    <input type="hidden" name="action" value="change-role" />
                                    <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
                                        Cambiar Rol
                                    </label>
                                    <div className="mt-1 flex space-x-2">
                                        <select
                                            name="roleId"
                                            id="roleId"
                                            defaultValue={targetUser.roleId}
                                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-law-accent focus:outline-none focus:ring-law-accent"
                                        >
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-law-accent hover:bg-law-accent/90"
                                        >
                                            Cambiar
                                        </button>
                                    </div>
                                </Form>

                                {/* Toggle Status */}
                                <Form method="post">
                                    <input type="hidden" name="action" value="toggle-status" />
                                    <button
                                        type="submit"
                                        className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${targetUser.status === "active"
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-green-600 hover:bg-green-700"
                                            }`}
                                    >
                                        {targetUser.status === "active" ? "Desactivar Usuario" : "Activar Usuario"}
                                    </button>
                                </Form>
                            </div>
                        </div>

                        {/* Stats */}
                        {userMetrics && (
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Estadísticas</h3>
                                </div>
                                <div className="p-6">
                                    <dl className="space-y-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Horas Usadas</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{userMetrics.hoursUsedTotal.toString()}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Sesiones Totales</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{userMetrics.sessionsCount}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Última Sesión</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {userMetrics.lastSessionAt ? new Date(userMetrics.lastSessionAt).toLocaleDateString('es-CO') : 'Nunca'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
