import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect, unstable_createFileUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { isLawyer } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";
import { uploadLawyerDocument, validateFile } from "~/lib/storage.server";
import Layout from "~/components/Layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    if (!isLawyer(user)) {
        return redirect("/dashboard");
    }

    const lawyer = await db.lawyer.findUnique({
        where: { userId: user.id },
        include: {
            documents: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!lawyer) {
        return redirect("/dashboard");
    }

    return json({ user, lawyer });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const user = await requireUser(request);

    if (!isLawyer(user)) {
        return json({ error: "Acceso denegado" }, { status: 403 });
    }

    const lawyer = await db.lawyer.findUnique({
        where: { userId: user.id }
    });

    if (!lawyer) {
        return json({ error: "Perfil de abogado no encontrado" }, { status: 404 });
    }

    try {
        const formData = await unstable_parseMultipartFormData(
            request,
            async ({ name, data, filename, contentType }) => {
                if (name === "document" && filename) {
                    // Convert the data stream to a File object
                    const chunks = [];
                    for await (const chunk of data) {
                        chunks.push(chunk);
                    }
                    const buffer = Buffer.concat(chunks);
                    const file = new File([buffer], filename, { type: contentType });

                    // Validate file
                    const validation = validateFile(file, 'document');
                    if (!validation.valid) {
                        throw new Error(validation.error);
                    }

                    return file;
                }
                return undefined;
            }
        );

        const file = formData.get("document") as File;
        const docType = formData.get("docType") as string;

        if (!file || !docType) {
            return json({ error: "Archivo y tipo de documento son requeridos" }, { status: 400 });
        }

        // Upload to Supabase
        const uploadResult = await uploadLawyerDocument(file, lawyer.id, docType);

        if (!uploadResult.success) {
            return json({ error: uploadResult.error }, { status: 400 });
        }

        // Save to database
        await db.lawyerDocument.create({
            data: {
                lawyerId: lawyer.id,
                fileUrl: uploadResult.url!,
                docType: docType,
                status: "pending"
            }
        });

        return json({ success: true, message: "Documento subido correctamente" });

    } catch (error) {
        console.error("Error uploading document:", error);
        return json({ error: "Error al subir el documento" }, { status: 500 });
    }
};

export default function AbogadoDocumentos() {
    const { user, lawyer } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return 'Aprobado';
            case 'pending': return 'Pendiente';
            case 'rejected': return 'Rechazado';
            default: return status;
        }
    };

    return (
        <Layout user={user}>
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Documentos Profesionales</h1>
                    <p className="mt-2 text-gray-600">
                        Sube tus documentos profesionales para verificar tu perfil de abogado.
                    </p>
                </div>

                {/* Status Alert */}
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
                                    <p>Tu perfil está en proceso de verificación. Sube los documentos requeridos para acelerar el proceso.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success/Error Messages */}
                {actionData && "success" in actionData && actionData.success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{actionData.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                {actionData && "error" in actionData && typeof actionData.error === "string" && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{actionData.error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Form */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Subir Documento</h3>
                        </div>
                        <div className="p-6">
                            <Form method="post" encType="multipart/form-data" className="space-y-4">
                                <div>
                                    <label htmlFor="docType" className="block text-sm font-medium text-gray-700">
                                        Tipo de Documento *
                                    </label>
                                    <select
                                        id="docType"
                                        name="docType"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-law-accent focus:outline-none focus:ring-law-accent"
                                    >
                                        <option value="">Seleccionar tipo</option>
                                        <option value="tarjeta_profesional">Tarjeta Profesional</option>
                                        <option value="cedula">Cédula de Ciudadanía</option>
                                        <option value="diploma">Diploma Universitario</option>
                                        <option value="especializacion">Certificado de Especialización</option>
                                        <option value="rut">RUT</option>
                                        <option value="antecedentes">Certificado de Antecedentes</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="document" className="block text-sm font-medium text-gray-700">
                                        Archivo *
                                    </label>
                                    <input
                                        id="document"
                                        name="document"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        required
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-law-accent file:text-white hover:file:bg-law-accent/90"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Formatos permitidos: PDF, JPG, PNG. Máximo 10MB.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-md bg-law-accent px-4 py-2 text-white font-semibold hover:bg-law-accent/90 focus:outline-none focus:ring-2 focus:ring-law-accent focus:ring-offset-2"
                                >
                                    Subir Documento
                                </button>
                            </Form>
                        </div>
                    </div>

                    {/* Documents List */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Documentos Subidos</h3>
                        </div>
                        <div className="p-6">
                            {lawyer.documents.length > 0 ? (
                                <div className="space-y-4">
                                    {lawyer.documents.map((doc) => (
                                        <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        {doc.docType?.replace('_', ' ').toUpperCase() || 'Documento'}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Subido el {new Date(doc.createdAt).toLocaleDateString('es-CO')}
                                                    </p>
                                                    {doc.reviewedAt && (
                                                        <p className="text-xs text-gray-500">
                                                            Revisado el {new Date(doc.reviewedAt).toLocaleDateString('es-CO')}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                                        {getStatusText(doc.status)}
                                                    </span>
                                                    <a
                                                        href={doc.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-law-accent hover:text-law-accent/80 text-sm font-medium"
                                                    >
                                                        Ver
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    <p className="mt-2">No has subido documentos aún</p>
                                    <p className="text-sm">Comienza subiendo tu tarjeta profesional</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Required Documents Info */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-900 mb-4">Documentos Requeridos para Verificación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div>
                            <h4 className="font-medium">Obligatorios:</h4>
                            <ul className="mt-2 space-y-1">
                                <li>• Tarjeta Profesional de Abogado</li>
                                <li>• Cédula de Ciudadanía</li>
                                <li>• Diploma Universitario</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium">Opcionales:</h4>
                            <ul className="mt-2 space-y-1">
                                <li>• Certificados de Especialización</li>
                                <li>• RUT (si factura como empresa)</li>
                                <li>• Certificado de Antecedentes</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
