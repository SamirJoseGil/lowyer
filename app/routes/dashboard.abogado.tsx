import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { isLawyer } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";
import Layout from "~/components/Layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    if (!isLawyer(user)) {
        return redirect("/dashboard");
    }

    // Get lawyer data
    const lawyer = await db.lawyer.findUnique({
        where: { userId: user.id },
        include: {
            documents: true,
            reviews: {
                include: { user: { include: { profile: true } } },
                orderBy: { createdAt: 'desc' },
                take: 5
            }
        }
    });

    if (!lawyer) {
        throw new Response("Lawyer profile not found", { status: 404 });
    }

    // Get lawyer stats
    const [totalChats, activeChats, avgRating, totalReviews] = await Promise.all([
        db.chatSession.count({ where: { lawyerId: lawyer.id } }),
        db.chatSession.count({ where: { lawyerId: lawyer.id, status: 'active' } }),
        db.lawyerReview.aggregate({
            where: { lawyerId: lawyer.id },
            _avg: { rating: true }
        }),
        db.lawyerReview.count({ where: { lawyerId: lawyer.id } })
    ]);

    return json({
        user,
        lawyer,
        stats: {
            totalChats,
            activeChats,
            avgRating: avgRating._avg.rating || 0,
            totalReviews
        }
    });
};

export default function LawyerDashboard() {
    const { user, lawyer, stats } = useLoaderData<typeof loader>();

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
                            <h1 className="text-3xl font-bold text-gray-900">Panel de Abogado</h1>
                            <p className="mt-2 text-gray-600">
                                Gestiona tu perfil profesional y consultas de clientes.
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lawyer.status)}`}>
                                {lawyer.status === 'verified' ? 'Verificado' :
                                    lawyer.status === 'pending' ? 'Pendiente' :
                                        lawyer.status === 'suspended' ? 'Suspendido' : lawyer.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Verification Alert */}
                {lawyer.status === 'pending' && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Verificación Pendiente
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>Tu perfil está en proceso de verificación. Por favor, asegúrate de haber subido todos los documentos requeridos.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-md bg-blue-500 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.691 1.358 3.061 3.049 3.061h4.203l2.477 2.477c.329.329.821.329 1.15 0l2.477-2.477h4.203c1.691 0 3.049-1.37 3.049-3.061V6.75c0-1.691-1.358-3.061-3.049-3.061H3.299c-1.691 0-3.049 1.37-3.049 3.061v8.25z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Consultas</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.totalChats}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-md bg-green-500 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Activas</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.activeChats}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-md bg-yellow-500 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Calificación</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.avgRating.toFixed(1)}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-md bg-purple-500 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.691 1.358 3.061 3.049 3.061h4.203l2.477 2.477c.329.329.821.329 1.15 0l2.477-2.477h4.203c1.691 0 3.049-1.37 3.049-3.061V6.75c0-1.691-1.358-3.061-3.049-3.061H3.299c-1.691 0-3.049 1.37-3.049 3.061v8.25z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Reseñas</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.totalReviews}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Documents Status */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Estado de Documentos</h3>
                        </div>
                        <div className="p-6">
                            {lawyer.documents.length > 0 ? (
                                <div className="space-y-3">
                                    {lawyer.documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{doc.docType || 'Documento'}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(doc.createdAt).toLocaleDateString('es-CO')}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocStatusColor(doc.status)}`}>
                                                {doc.status === 'approved' ? 'Aprobado' :
                                                    doc.status === 'pending' ? 'Pendiente' :
                                                        doc.status === 'rejected' ? 'Rechazado' : doc.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    <p className="mt-2">No has subido documentos aún</p>
                                </div>
                            )}
                            <div className="mt-4">
                                <Link
                                    to="/abogado/documentos"
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-law-accent bg-law-accent/10 hover:bg-law-accent/20 transition-colors"
                                >
                                    Gestionar documentos
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Reviews */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Reseñas Recientes</h3>
                        </div>
                        <div className="p-6">
                            {lawyer.reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {lawyer.reviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-100 pb-3 last:border-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-law-accent flex items-center justify-center">
                                                        <span className="text-xs font-medium text-white">
                                                            {review.user.profile?.firstName?.charAt(0) || review.user.email.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {review.user.profile?.firstName || review.user.email.split('@')[0]}
                                                        </p>
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <svg
                                                                    key={i}
                                                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(review.createdAt).toLocaleDateString('es-CO')}
                                                </span>
                                            </div>
                                            {review.comment && (
                                                <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                    </svg>
                                    <p className="mt-2">Aún no tienes reseñas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
