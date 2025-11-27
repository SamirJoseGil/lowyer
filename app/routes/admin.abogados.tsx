import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { isAdmin } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";
import { motion } from "framer-motion";

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
        <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20">
            {/* Decorative Background */}
            <div className="fixed inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-green-200/40 to-emerald-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-20 w-80 h-80 bg-gradient-to-r from-teal-200/30 to-green-200/20 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header con estilo editorial */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 mb-6 rounded-full" />

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
                                    Gestión de Abogados ⚖️
                                </h1>
                                <p className="text-lg text-gray-600 italic mt-2"
                                   style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    Verifica y administra los profesionales del derecho
                                </p>
                            </div>
                        </div>
                        <div className="text-sm font-medium text-gray-500"
                             style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            Total: {totalLawyers} abogados
                        </div>
                    </div>

                    <div className="h-0.5 bg-gradient-to-r from-green-400 via-transparent to-emerald-400" />
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8 bg-white shadow-lg rounded-xl p-6 border-2 border-green-100"
                    style={{ borderRadius: "2px" }}
                >
                    <Form method="get" className="flex items-center space-x-4">
                        <div className="flex-1">
                            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2"
                                   style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Estado de Verificación
                            </label>
                            <select
                                name="status"
                                id="status"
                                defaultValue={filters.status}
                                className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
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
                                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                            >
                                Filtrar
                            </button>
                        </div>
                    </Form>
                </motion.div>

                {/* Lawyers List */}
                <div className="space-y-6">
                    {lawyers.map((lawyer, index) => (
                        <motion.div
                            key={lawyer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            className="bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-green-100"
                            style={{ borderRadius: "2px" }}
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center shadow-lg">
                                                <span className="text-2xl font-bold text-white">
                                                    {lawyer.user.profile?.firstName?.charAt(0) || lawyer.user.email.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900"
                                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                    {lawyer.user.profile?.firstName && lawyer.user.profile?.lastName
                                                        ? `${lawyer.user.profile.firstName} ${lawyer.user.profile.lastName}`
                                                        : lawyer.user.email
                                                    }
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">{lawyer.user.email}</p>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lawyer.status)}`}>
                                                        {lawyer.status === 'verified' ? '✓ Verificado' :
                                                            lawyer.status === 'pending' ? '⏳ Pendiente' :
                                                                lawyer.status === 'suspended' ? '⊗ Suspendido' : lawyer.status}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        📅 {new Date(lawyer.user.createdAt).toLocaleDateString('es-CO')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Professional Info */}
                                        {(lawyer.specialty || lawyer.university || lawyer.experienceYears) && (
                                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                                                {lawyer.specialty && (
                                                    <div>
                                                        <span className="font-semibold text-gray-700 text-sm"
                                                              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                            Especialidad:
                                                        </span>
                                                        <p className="text-gray-600 text-sm mt-1">{lawyer.specialty}</p>
                                                    </div>
                                                )}
                                                {lawyer.university && (
                                                    <div>
                                                        <span className="font-semibold text-gray-700 text-sm"
                                                              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                            Universidad:
                                                        </span>
                                                        <p className="text-gray-600 text-sm mt-1">{lawyer.university}</p>
                                                    </div>
                                                )}
                                                {lawyer.experienceYears && (
                                                    <div>
                                                        <span className="font-semibold text-gray-700 text-sm"
                                                              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                            Experiencia:
                                                        </span>
                                                        <p className="text-gray-600 text-sm mt-1">{lawyer.experienceYears} años</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="mt-4 flex items-center space-x-8 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-2xl">💼</span>
                                                <span className="text-gray-600">
                                                    <span className="font-bold text-gray-900">{lawyer._count.chatSessions}</span> consultas
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-2xl">⭐</span>
                                                <span className="text-gray-600">
                                                    <span className="font-bold text-gray-900">{lawyer._count.reviews}</span> reseñas
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 flex space-x-2">
                                        {lawyer.status === 'pending' && (
                                            <Form method="post">
                                                <input type="hidden" name="lawyerId" value={lawyer.id} />
                                                <input type="hidden" name="action" value="verify-lawyer" />
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center px-4 py-2 border-2 border-green-600 text-sm font-semibold rounded-lg text-green-600 bg-white hover:bg-green-600 hover:text-white transition-all"
                                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                                >
                                                    ✓ Verificar
                                                </button>
                                            </Form>
                                        )}
                                        {lawyer.status === 'verified' && (
                                            <Form method="post">
                                                <input type="hidden" name="lawyerId" value={lawyer.id} />
                                                <input type="hidden" name="action" value="suspend-lawyer" />
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center px-4 py-2 border-2 border-red-600 text-sm font-semibold rounded-lg text-red-600 bg-white hover:bg-red-600 hover:text-white transition-all"
                                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                                >
                                                    ⊗ Suspender
                                                </button>
                                            </Form>
                                        )}
                                    </div>
                                </div>

                                {/* Documents */}
                                {lawyer.documents.length > 0 && (
                                    <div className="mt-6 pt-6 border-t-2 border-green-100">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4"
                                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                            📄 Documentos Profesionales
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {lawyer.documents.map((doc) => (
                                                <div key={doc.id} className="border-2 border-green-100 rounded-lg p-4 bg-gradient-to-br from-white to-green-50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-900 truncate"
                                                               style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                                {doc.docType?.replace('_', ' ').toUpperCase() || '📎 Documento'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {new Date(doc.createdAt).toLocaleDateString('es-CO')}
                                                            </p>
                                                        </div>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDocStatusColor(doc.status)}`}>
                                                            {doc.status === 'approved' ? '✓' :
                                                                doc.status === 'pending' ? '⏳' :
                                                                    doc.status === 'rejected' ? '✗' : doc.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 mt-3">
                                                        <a
                                                            href={doc.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-green-600 hover:text-green-800 font-medium"
                                                        >
                                                            👁️ Ver
                                                        </a>
                                                        {doc.status === 'pending' && (
                                                            <>
                                                                <span className="text-gray-300">|</span>
                                                                <Form method="post" className="inline">
                                                                    <input type="hidden" name="documentId" value={doc.id} />
                                                                    <input type="hidden" name="action" value="approve-document" />
                                                                    <button
                                                                        type="submit"
                                                                        className="text-xs text-green-600 hover:text-green-800 font-medium"
                                                                    >
                                                                        ✓ Aprobar
                                                                    </button>
                                                                </Form>
                                                                <span className="text-gray-300">|</span>
                                                                <Form method="post" className="inline">
                                                                    <input type="hidden" name="documentId" value={doc.id} />
                                                                    <input type="hidden" name="action" value="reject-document" />
                                                                    <button
                                                                        type="submit"
                                                                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                                                                    >
                                                                        ✗ Rechazar
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
                        </motion.div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 flex items-center justify-between bg-white shadow-lg rounded-xl p-4 border-2 border-green-100"
                    >
                        <div>
                            <p className="text-sm text-gray-700"
                               style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Mostrando <span className="font-bold">{(currentPage - 1) * 20 + 1}</span> a{' '}
                                <span className="font-bold">{Math.min(currentPage * 20, totalLawyers)}</span> de{' '}
                                <span className="font-bold">{totalLawyers}</span> abogados
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            {currentPage > 1 && (
                                <Link
                                    to={`?page=${currentPage - 1}${filters.status ? `&status=${filters.status}` : ''}`}
                                    className="px-4 py-2 border-2 border-green-600 text-sm font-semibold rounded-lg text-green-600 hover:bg-green-600 hover:text-white transition-all"
                                >
                                    ← Anterior
                                </Link>
                            )}
                            {currentPage < totalPages && (
                                <Link
                                    to={`?page=${currentPage + 1}${filters.status ? `&status=${filters.status}` : ''}`}
                                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                                >
                                    Siguiente →
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
