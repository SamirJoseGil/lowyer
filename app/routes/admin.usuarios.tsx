import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams, Form, Link } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { isAdmin, PERMISSIONS, hasPermission } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const role = url.searchParams.get("role") || "";

    const limit = 20;
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
        where.OR = [
            { email: { contains: search, mode: 'insensitive' } },
            { profile: { firstName: { contains: search, mode: 'insensitive' } } },
            { profile: { lastName: { contains: search, mode: 'insensitive' } } },
        ];
    }

    if (status) {
        where.status = status;
    }

    if (role) {
        where.role = { name: role };
    }

    const [users, totalUsers, roles] = await Promise.all([
        db.user.findMany({
            where,
            include: {
                profile: true,
                role: true,
                _count: {
                    select: {
                        chatSessions: true,
                        purchases: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        }),
        db.user.count({ where }),
        db.role.findMany({ orderBy: { name: 'asc' } })
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    // ✅ No necesita serialización adicional ya que _count solo tiene enteros
    return json({
        user,
        users,
        totalUsers,
        totalPages,
        currentPage: page,
        filters: { search, status, role },
        roles
    });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    const formData = await request.formData();
    const action = formData.get("action");
    const userId = formData.get("userId")?.toString();

    if (!userId) {
        return json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    try {
        switch (action) {
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

                return json({ success: `Usuario ${newStatus === "active" ? "activado" : "desactivado"}` });
            }

            case "change-role": {
                const newRoleId = parseInt(formData.get("roleId")?.toString() || "");
                if (!newRoleId) {
                    return json({ error: "ID de rol requerido" }, { status: 400 });
                }

                await db.user.update({
                    where: { id: userId },
                    data: { roleId: newRoleId }
                });

                return json({ success: "Rol actualizado correctamente" });
            }

            default:
                return json({ error: "Acción no válida" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error in admin action:", error);
        return json({ error: "Error interno del servidor" }, { status: 500 });
    }
};

export default function AdminUsuarios() {
    const { user, users, totalUsers, totalPages, currentPage, filters, roles } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

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

    return (
        <div className="flex min-h-screen flex-col">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
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
                                <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                                <p className="mt-2 text-gray-600">
                                    Administra usuarios, roles y estados del sistema.
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            Total: {totalUsers} usuarios
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <Form method="get" className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                                Buscar
                            </label>
                            <input
                                type="text"
                                name="search"
                                id="search"
                                defaultValue={filters.search}
                                placeholder="Email, nombre..."
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-law-accent focus:outline-none focus:ring-law-accent"
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Estado
                            </label>
                            <select
                                name="status"
                                id="status"
                                defaultValue={filters.status}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-law-accent focus:outline-none focus:ring-law-accent"
                            >
                                <option value="">Todos</option>
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                                <option value="banned">Bloqueado</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Rol
                            </label>
                            <select
                                name="role"
                                id="role"
                                defaultValue={filters.role}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-law-accent focus:outline-none focus:ring-law-accent"
                            >
                                <option value="">Todos</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.name}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full rounded-md bg-law-accent px-3 py-2 text-sm font-semibold text-white hover:bg-law-accent/90 focus:outline-none focus:ring-2 focus:ring-law-accent focus:ring-offset-2"
                            >
                                Filtrar
                            </button>
                        </div>
                    </Form>
                </div>

                {/* Users Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actividad
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Registro
                                    </th>
                                    <th className="relative px-6 py-3">
                                        <span className="sr-only">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((userData) => (
                                    <tr key={userData.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-law-accent flex items-center justify-center">
                                                    <span className="text-sm font-medium text-white">
                                                        {userData.profile?.firstName?.charAt(0) || userData.email.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {userData.profile?.firstName && userData.profile?.lastName
                                                            ? `${userData.profile.firstName} ${userData.profile.lastName}`
                                                            : userData.email.split('@')[0]
                                                        }
                                                    </div>
                                                    <div className="text-sm text-gray-500">{userData.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userData.role.name)}`}>
                                                {userData.role.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userData.status)}`}>
                                                {userData.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>Chats: {userData._count.chatSessions}</div>
                                            <div>Compras: {userData._count.purchases}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(userData.createdAt).toLocaleDateString('es-CO')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Form method="post">
                                                    <input type="hidden" name="userId" value={userData.id} />
                                                    <input type="hidden" name="action" value="toggle-status" />
                                                    <button
                                                        type="submit"
                                                        className={`inline-flex items-center px-2.5 py-1.5 rounded text-xs font-medium ${userData.status === "active"
                                                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                            : "bg-green-100 text-green-700 hover:bg-green-200"
                                                            }`}
                                                    >
                                                        {userData.status === "active" ? "Desactivar" : "Activar"}
                                                    </button>
                                                </Form>
                                                <Link
                                                    to={`/admin/usuario/${userData.id}`}
                                                    className="inline-flex items-center px-2.5 py-1.5 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                >
                                                    Ver
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                                    <p className="text-sm text-gray-700">
                                        Mostrando <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> a{' '}
                                        <span className="font-medium">{Math.min(currentPage * 20, totalUsers)}</span> de{' '}
                                        <span className="font-medium">{totalUsers}</span> usuarios
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {/* Pagination buttons */}
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Link
                                                key={page}
                                                to={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: page.toString() })}`}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                    ? 'z-10 bg-law-accent border-law-accent text-white'
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
                </div>
            </div>
        </div>
    );
}
