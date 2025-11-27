import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { isAdmin, isLawyer } from "~/lib/permissions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    // Redirect based on user role, but only if they're trying to access the general dashboard
    const url = new URL(request.url);
    if (url.pathname === "/dashboard") {
        if (isAdmin(user)) {
            return redirect("/dashboard/admin");
        }

        if (isLawyer(user)) {
            return redirect("/dashboard/abogado");
        }
    }

    return json({ user });
};

export default function Dashboard() {
    const { user } = useLoaderData<typeof loader>();

    return (
        <div className="flex min-h-screen flex-col">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        ¡Hola {user.profile?.firstName || user.email.split('@')[0]}!
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Bienvenido a tu panel de control. Aquí puedes gestionar tu perfil y licencias.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Profile Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-law-accent flex items-center justify-center">
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">Mi Perfil</h3>
                                    <p className="text-sm text-gray-500">Gestiona tu información personal</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Link
                                    to="/perfil"
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-law-accent bg-law-accent/10 hover:bg-law-accent/20 transition-colors"
                                >
                                    Editar perfil
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Licenses Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">Mis Licencias</h3>
                                    <p className="text-sm text-gray-500">Ver estado y comprar nuevas</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Link
                                    to="/licencias"
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-600 bg-green-50 hover:bg-green-100 transition-colors"
                                >
                                    Ver licencias
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Chat Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.691 1.358 3.061 3.049 3.061h4.203l2.477 2.477c.329.329.821.329 1.15 0l2.477-2.477h4.203c1.691 0 3.049-1.37 3.049-3.061V6.75c0-1.691-1.358-3.061-3.049-3.061H3.299c-1.691 0-3.049 1.37-3.049 3.061v8.25z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">Asistente Legal</h3>
                                    <p className="text-sm text-gray-500">Inicia una consulta</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Link
                                    to="/chat"
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                    Iniciar chat
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="mt-8">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
                        </div>
                        <div className="p-6">
                            <div className="text-center text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0.621 0 1.125-.504 1.125-1.125V9.375c0-.621.504-1.125 1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                </svg>
                                <p className="mt-2">No hay actividad reciente</p>
                                <p className="text-sm">Tu actividad aparecerá aquí cuando comiences a usar la plataforma</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
