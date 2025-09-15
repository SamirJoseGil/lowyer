import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireUser } from "~/lib/auth.server";
import { getUserActiveLicense } from "~/lib/licenses.server";
import { getUserActiveChatSession, createChatSession, getChatMessages } from "~/lib/chat.server";
import Layout from "~/components/Layout";
import ChatContainer from "~/components/Chat/ChatContainer";
import LicenseStatus from "~/components/LicenseStatus";
import TrialBanner from "~/components/TrialBanner";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    // Verificar licencia activa
    const activeLicense = await getUserActiveLicense(user.id);

    if (!activeLicense) {
        // Redirigir a página de licencias si no tiene licencia válida
        return redirect("/licencias?message=need-license");
    }

    // Verificar si ya tiene una sesión activa
    const activeSession = await getUserActiveChatSession(user.id);

    let initialMessages: any[] = [];
    if (activeSession) {
        initialMessages = await getChatMessages(activeSession.id, user.id);
    }

    // Serialize BigInt fields
    const serializedActiveLicense = activeLicense ? {
        ...activeLicense,
        hoursRemaining: Number(activeLicense.hoursRemaining),
        license: {
            ...activeLicense.license,
            hoursTotal: Number(activeLicense.license.hoursTotal),
            priceCents: Number(activeLicense.license.priceCents)
        }
    } : null;

    const serializedActiveSession = activeSession ? {
        ...activeSession,
        licenseInstance: activeSession.licenseInstance ? {
            ...activeSession.licenseInstance,
            hoursRemaining: Number(activeSession.licenseInstance.hoursRemaining),
            license: {
                ...activeSession.licenseInstance.license,
                hoursTotal: Number(activeSession.licenseInstance.license.hoursTotal),
                priceCents: Number(activeSession.licenseInstance.license.priceCents)
            }
        } : null
    } : null;

    return json({
        user,
        activeLicense: serializedActiveLicense,
        activeSession: serializedActiveSession,
        initialMessages
    });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const user = await requireUser(request);
    const formData = await request.formData();
    const action = formData.get("action");

    switch (action) {
        case "create-session": {
            const chatType = formData.get("chatType") as "ia" | "lawyer";
            const result = await createChatSession(user.id, chatType);
            return json(result);
        }

        default:
            return json({ error: "Acción no válida" }, { status: 400 });
    }
};

export default function Chat() {
    const { user, activeLicense, activeSession, initialMessages } = useLoaderData<typeof loader>();
    const [currentSession, setCurrentSession] = useState(activeSession);
    const [chatType, setChatType] = useState<"ia" | "lawyer">("ia");
    const sessionCreator = useFetcher();

    const handleCreateSession = (type: "ia" | "lawyer") => {
        setChatType(type);
        sessionCreator.submit(
            { action: "create-session", chatType: type },
            { method: "post" }
        );
    };

    // Update session when fetcher returns
    useEffect(() => {
        if (sessionCreator.data && typeof sessionCreator.data === 'object' && sessionCreator.data !== null && 'success' in sessionCreator.data && 'sessionId' in sessionCreator.data) {
            // Reload to get the new session data
            window.location.reload();
        }
    }, [sessionCreator.data]);

    return (
        <Layout user={user}>
            <div className="h-screen flex flex-col">
                {/* License Banner */}
                <div className="flex-shrink-0">
                    <TrialBanner user={user} activeLicense={activeLicense as any} />
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Chat Legal</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Selecciona el tipo de asistencia que necesitas
                            </p>
                        </div>

                        {/* License Status */}
                        <div className="p-4 border-b border-gray-200">
                            <LicenseStatus activeLicense={activeLicense as any} />
                        </div>

                        {/* Chat Type Selection */}
                        {!currentSession && (
                            <div className="p-4 space-y-3">
                                <h3 className="font-medium text-gray-900 mb-3">Iniciar nueva conversación</h3>

                                <button
                                    onClick={() => handleCreateSession("ia")}
                                    disabled={sessionCreator.state === "submitting"}
                                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082a.75.75 0 00-.678.744v.812M9.75 3.104a48.424 48.424 0 011.5 0M5 14.5c0 2.208 1.792 4 4 4s4-1.792 4-4M5 14.5c0-1.01.377-1.932 1-2.626M19 14.5v-5.714a2.25 2.25 0 00-.659-1.591L14.25 3.104M19 14.5c0 2.208-1.792 4-4 4s-4-1.792-4-4m8 0c1.01-.377 1.932-1 2.626-1" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Asistente IA Legal</h4>
                                            <p className="text-sm text-gray-600">Consultas rápidas con inteligencia artificial</p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleCreateSession("lawyer")}
                                    disabled={sessionCreator.state === "submitting"}
                                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Consulta con Abogado</h4>
                                            <p className="text-sm text-gray-600">Asesoría personalizada con profesionales</p>
                                        </div>
                                    </div>
                                </button>

                                {sessionCreator.state === "submitting" && (
                                    <div className="text-center text-sm text-gray-500">
                                        Creando sesión de chat...
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Current Session Info */}
                        {currentSession && (
                            <div className="p-4 bg-white border-b border-gray-200">
                                <div className="flex items-center space-x-2">
                                    <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                                    <span className="text-sm font-medium text-gray-900">
                                        Sesión activa
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {currentSession.lawyer ? "Con abogado" : "Con asistente IA"}
                                </p>
                            </div>
                        )}

                        {/* Help Section */}
                        <div className="mt-auto p-4 bg-gray-100">
                            <h4 className="font-medium text-gray-900 mb-2">¿Necesitas ayuda?</h4>
                            <p className="text-xs text-gray-600 mb-3">
                                Nuestro equipo está disponible para asistirte con cualquier consulta legal.
                            </p>
                            <button className="w-full text-xs bg-law-accent text-white px-3 py-2 rounded hover:bg-law-accent/90">
                                Contactar Soporte
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col">
                        {currentSession ? (
                            <ChatContainer
                                session={currentSession as any}
                                initialMessages={initialMessages}
                                userId={user.id}
                            />
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.691 1.358 3.061 3.049 3.061h4.203l2.477 2.477c.329.329.821.329 1.15 0l2.477-2.477h4.203c1.691 0 3.049-1.37 3.049-3.061V6.75c0-1.691-1.358-3.061-3.049-3.061H3.299c-1.691 0-3.049 1.37-3.049 3.061v8.25z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Selecciona un tipo de chat para comenzar
                                    </h3>
                                    <p className="text-gray-600 max-w-md">
                                        Elige entre nuestro asistente de IA para consultas rápidas o conecta con un abogado profesional para asesoría especializada.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
