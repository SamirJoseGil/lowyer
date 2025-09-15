import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { isAdmin } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";
import Layout from "~/components/Layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "";
    const page = parseInt(url.searchParams.get("page") || "1");

    const limit = 20;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (status) {
        where.status = status;
    }

    const [lawyers, totalLawyers] = await Promise.all([
        db.lawyer.findMany({
            where,
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                documents: {
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        chatSessions: true,
                        reviews: true
                    }
                }
            },
            orderBy: { user: { createdAt: 'desc' } },
            take: limit,
            skip: offset,
        }),
        db.lawyer.count({ where })
    ]);

    const totalPages = Math.ceil(totalLawyers / limit);

    return json({
        user,
        lawyers,
        totalLawyers,
        totalPages,
        currentPage: page,
        filters: { status }
    });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const user = await requireUser(request);

    if (!isAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    const formData = await request.formData();
    const action = formData.get("action");
    const lawyerId = formData.get("lawyerId")?.toString();
    const documentId = formData.get("documentId")?.toString();

    try {
        switch (action) {
            case "verify-lawyer": {
                if (!lawyerId) {
                    return json({ error: "ID de abogado requerido" }, { status: 400 });
                }

                await db.lawyer.update({
                    where: { id: lawyerId },
                    data: { status: "verified" }
                });

                return json({ success: "Abogado verificado correctamente" });
            }

            case "suspend-lawyer": {
                if (!lawyerId) {
                    return json({ error: "ID de abogado requerido" }, { status: 400 });
                }

                await db.lawyer.update({
                    where: { id: lawyerId },
                    data: { status: "suspended" }
                });

                return json({ success: "Abogado suspendido" });
            }

            case "approve-document": {
                if (!documentId) {
                    return json({ error: "ID de documento requerido" }, { status: 400 });
                }

                await db.lawyerDocument.update({
                    where: { id: documentId },
                    data: {
                        status: "approved",
                        reviewedBy: user.id,
                        reviewedAt: new Date()
                    }
                });

                return json({ success: "Documento aprobado" });
            }

            case "reject-document": {
                if (!documentId) {
                    return json({ error: "ID de documento requerido" }, { status: 400 });
                }

                await db.lawyerDocument.update({
                    where: { id: documentId },
                    data: {
                        status: "rejected",
                        reviewedBy: user.id,
                        reviewedAt: new Date()
                    }
                });

                return json({ success: "Documento rechazado" });
            }

            default:
                return json({ error: "Acción no válida" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error in admin action:", error);
        return json({ error: "Error interno del servidor" }, { status: 500 });
    }
};

export default function AdminAbogados() {
    const { user, lawyers, totalLawyers, totalPages, currentPage, filters } = useLoaderData<typeof loader>();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDocStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Layout user={user}>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Gestión de Abogados</h1>
                            <p className="mt-2 text-gray-600">
                                Verifica y gestiona los perfiles de abogados del sistema.
                            </p>
                        </div>
                        <div className="text-sm text-gray-500">
                            Total: {totalLawyers} abogados
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <Form method="get" className="flex items-center space-x-4">
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
                                <option value="pending">Pendiente</option>
                                <option value="verified">Verificado</option>
                                <option value="suspended">Suspendido</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="rounded-md bg-law-accent px-3 py-2 text-sm font-semibold text-white hover:bg-law-accent/90 focus:outline-none focus:ring-2 focus:ring-law-accent focus:ring-offset-2"
                            >
                                Filtrar
                            </button>
                        </div>
                    </Form>
                </div>

                {/* Lawyers List */}
                <div className="space-y-6">
                    {lawyers.map((lawyer) => (
                        <div key={lawyer.id} className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 rounded-full bg-law-accent flex items-center justify-center">
                                                <span className="text-lg font-medium text-white">
                                                    {lawyer.user.profile?.firstName?.charAt(0) || lawyer.user.email.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {lawyer.user.profile?.firstName && lawyer.user.profile?.lastName
                                                        ? `${lawyer.user.profile.firstName} ${lawyer.user.profile.lastName}`
                                                        : lawyer.user.email
                                                    }
                                                </h3>
                                                <p className="text-sm text-gray-500">{lawyer.user.email}</p>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lawyer.status)}`}>
                                                        {lawyer.status === 'verified' ? 'Verificado' :
                                                            lawyer.status === 'pending' ? 'Pendiente' :
                                                                lawyer.status === 'suspended' ? 'Suspendido' : lawyer.status}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Registrado: {new Date(lawyer.user.createdAt).toLocaleDateString('es-CO')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Professional Info */}
                                        {(lawyer.specialty || lawyer.university || lawyer.experienceYears) && (
                                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                                {lawyer.specialty && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">Especialidad:</span>
                                                        <p className="text-gray-600">{lawyer.specialty}</p>
                                                    </div>
                                                )}
                                                {lawyer.university && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">Universidad:</span>
                                                        <p className="text-gray-600">{lawyer.university}</p>
                                                    </div>
                                                )}
                                                {lawyer.experienceYears && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">Experiencia:</span>
                                                        <p className="text-gray-600">{lawyer.experienceYears} años</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                                            <span>Consultas: {lawyer._count.chatSessions}</span>
                                            <span>Reseñas: {lawyer._count.reviews}</span>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 flex space-x-2">
                                        {lawyer.status === 'pending' && (
                                            <Form method="post">
                                                <input type="hidden" name="lawyerId" value={lawyer.id} />
                                                <input type="hidden" name="action" value="verify-lawyer" />
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                    Verificar
                                                </button>
                                            </Form>
                                        )}
                                        {lawyer.status === 'verified' && (
                                            <Form method="post">
                                                <input type="hidden" name="lawyerId" value={lawyer.id} />
                                                <input type="hidden" name="action" value="suspend-lawyer" />
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    Suspender
                                                </button>
                                            </Form>
                                        )}
                                    </div>
                                </div>

                                {/* Documents */}
                                {lawyer.documents.length > 0 && (
                                    <div className="mt-6 border-t border-gray-200 pt-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Documentos</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {lawyer.documents.map((doc) => (
                                                <div key={doc.id} className="border border-gray-200 rounded-md p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {doc.docType?.replace('_', ' ').toUpperCase() || 'Documento'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(doc.createdAt).toLocaleDateString('es-CO')}
                                                            </p>
                                                        </div>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDocStatusColor(doc.status)}`}>
                                                            {doc.status === 'approved' ? 'Aprobado' :
                                                                doc.status === 'pending' ? 'Pendiente' :
                                                                    doc.status === 'rejected' ? 'Rechazado' : doc.status}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 flex items-center space-x-2">
                                                        <a
                                                            href={doc.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-law-accent hover:text-law-accent/80 font-medium"
                                                        >
                                                            Ver
                                                        </a>
                                                        {doc.status === 'pending' && (
                                                            <>
                                                                <Form method="post" className="inline">
                                                                    <input type="hidden" name="documentId" value={doc.id} />
                                                                    <input type="hidden" name="action" value="approve-document" />
                                                                    <button
                                                                        type="submit"
                                                                        className="text-xs text-green-600 hover:text-green-800 font-medium"
                                                                    >
                                                                        Aprobar
                                                                    </button>
                                                                </Form>
                                                                <Form method="post" className="inline">
                                                                    <input type="hidden" name="documentId" value={doc.id} />
                                                                    <input type="hidden" name="action" value="reject-document" />
                                                                    <button
                                                                        type="submit"
                                                                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                                                                    >
                                                                        Rechazar
                                                                    </button>
                                                                </Form>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Mostrando <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> a{' '}
                                <span className="font-medium">{Math.min(currentPage * 20, totalLawyers)}</span> de{' '}
                                <span className="font-medium">{totalLawyers}</span> abogados
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            {currentPage > 1 && (
                                <Link
                                    to={`?page=${currentPage - 1}${filters.status ? `&status=${filters.status}` : ''}`}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Anterior
                                </Link>
                            )}
                            {currentPage < totalPages && (
                                <Link
                                    to={`?page=${currentPage + 1}${filters.status ? `&status=${filters.status}` : ''}`}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Siguiente
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
