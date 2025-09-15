import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { requireUser } from "~/lib/auth.server";
import { db } from "~/lib/db.server";
import Layout from "~/components/Layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);
    return json({ user });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const user = await requireUser(request);
    const formData = await request.formData();

    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const documentType = formData.get("documentType");
    const documentNumber = formData.get("documentNumber");
    const phone = formData.get("phone");
    const address = formData.get("address");

    // Validation
    const errors: any = {};

    if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
        errors.firstName = "El nombre es requerido";
    }

    if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
        errors.lastName = "El apellido es requerido";
    }

    if (phone && typeof phone === "string" && phone.trim().length > 0) {
        const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
        if (!phoneRegex.test(phone.trim())) {
            errors.phone = "Formato de teléfono inválido";
        }
    }

    if (Object.keys(errors).length > 0) {
        return json({ errors }, { status: 400 });
    }

    try {
        // Update or create profile
        await db.profile.upsert({
            where: { userId: user.id },
            update: {
                firstName: firstName?.toString().trim(),
                lastName: lastName?.toString().trim(),
                documentType: documentType?.toString() || null,
                documentNumber: documentNumber?.toString() || null,
                phone: phone?.toString().trim() || null,
                address: address?.toString().trim() || null,
            },
            create: {
                userId: user.id,
                firstName: firstName?.toString().trim(),
                lastName: lastName?.toString().trim(),
                documentType: documentType?.toString() || null,
                documentNumber: documentNumber?.toString() || null,
                phone: phone?.toString().trim() || null,
                address: address?.toString().trim() || null,
            },
        });

        return json({ success: true, message: "Perfil actualizado correctamente" });
    } catch (error) {
        console.error("Error updating profile:", error);
        return json({ errors: { general: "Error al actualizar el perfil" } }, { status: 500 });
    }
};

export default function Perfil() {
    const { user } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const firstNameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (
            actionData &&
            "errors" in actionData &&
            actionData.errors?.firstName
        ) {
            firstNameRef.current?.focus();
        }
    }, [actionData]);

    return (
        <Layout user={user}>
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                    <p className="mt-2 text-gray-600">
                        Actualiza tu información personal y preferencias.
                    </p>
                </div>

                {actionData && typeof actionData === "object" && "success" in actionData && (actionData as { success?: boolean }).success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{(actionData as { message?: string }).message}</p>
                            </div>
                        </div>
                    </div>
                )}

                {actionData && typeof actionData === "object" && "errors" in actionData && actionData.errors?.general && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{actionData.errors.general}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
                    </div>

                    <Form method="post" className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                    Nombre *
                                </label>
                                <div className="mt-1">
                                    <input
                                        ref={firstNameRef}
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        defaultValue={user.profile?.firstName || ""}
                                        aria-invalid={actionData && "errors" in actionData && actionData.errors?.firstName ? true : undefined}
                                        aria-describedby="firstName-error"
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-law-accent focus:outline-none focus:ring-law-accent sm:text-sm"
                                    />
                                    {"errors" in (actionData ?? {}) && (actionData as { errors?: any }).errors?.firstName && (
                                        <div className="pt-1 text-red-700 text-sm" id="firstName-error">
                                            {(actionData as { errors?: any }).errors?.firstName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                    Apellido *
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        defaultValue={user.profile?.lastName || ""}
                                        aria-invalid={"errors" in (actionData ?? {}) && (actionData as { errors?: any }).errors?.lastName ? true : undefined}
                                        aria-describedby="lastName-error"
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-law-accent focus:outline-none focus:ring-law-accent sm:text-sm"
                                    />
                                    {"errors" in (actionData ?? {}) && (actionData as { errors?: any }).errors?.lastName && (
                                        <div className="pt-1 text-red-700 text-sm" id="lastName-error">
                                            {(actionData as { errors?: any }).errors.lastName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                                    Tipo de Documento
                                </label>
                                <div className="mt-1">
                                    <select
                                        id="documentType"
                                        name="documentType"
                                        defaultValue={user.profile?.documentType || ""}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-law-accent focus:outline-none focus:ring-law-accent sm:text-sm"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="CE">Cédula de Extranjería</option>
                                        <option value="NIT">NIT</option>
                                        <option value="PASSPORT">Pasaporte</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700">
                                    Número de Documento
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="documentNumber"
                                        name="documentNumber"
                                        type="text"
                                        defaultValue={user.profile?.documentNumber || ""}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-law-accent focus:outline-none focus:ring-law-accent sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Teléfono
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+57 300 123 4567"
                                        defaultValue={user.profile?.phone || ""}
                                        aria-invalid={actionData && "errors" in actionData && actionData.errors?.phone ? true : undefined}
                                        aria-describedby="phone-error"
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-law-accent focus:outline-none focus:ring-law-accent sm:text-sm"
                                    />
                                    {"errors" in (actionData ?? {}) && (actionData as { errors?: any }).errors?.phone && (
                                        <div className="pt-1 text-red-700 text-sm" id="phone-error">
                                            {(actionData as { errors?: any }).errors.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Dirección
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="address"
                                    name="address"
                                    rows={3}
                                    defaultValue={user.profile?.address || ""}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-law-accent focus:outline-none focus:ring-law-accent sm:text-sm"
                                    placeholder="Ingresa tu dirección completa"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-law-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-law-accent/90 focus:outline-none focus:ring-2 focus:ring-law-accent focus:ring-offset-2"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </Form>
                </div>

                {/* Account Info */}
                <div className="mt-8 bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Información de la Cuenta</h3>
                    </div>
                    <div className="p-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Rol</dt>
                                <dd className="mt-1 text-sm text-gray-900 capitalize">{user.role.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                                <dd className="mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.status === 'active' ? 'Activo' : user.status}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Fecha de registro</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(user.createdAt).toLocaleDateString('es-CO', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
