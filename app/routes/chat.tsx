import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireUser, getUser } from "~/lib/auth.server";
import { getUserActiveLicense } from "~/lib/licenses.server";
import { getUserActiveChatSession, createChatSession, getChatMessages } from "~/lib/chat.server";
import ChatContainer from "~/components/Chat/ChatContainer";
import LicenseStatus from "~/components/LicenseStatus";
import { motion } from "framer-motion";
import AuthRequiredModal from "~/components/AuthRequiredModal";
import { Link } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await getUser(request);

    // Si no hay usuario, retornar datos básicos para mostrar el modal
    if (!user) {
        return json({
            user: null,
            activeLicense: null,
            activeSession: null,
            initialMessages: [],
            requiresAuth: true,
            needsLicense: false
        });
    }

    // Verificar licencia activa
    const activeLicense = await getUserActiveLicense(user.id);

    // En lugar de redirigir, dejar que entre pero marcar que necesita licencia
    if (!activeLicense) {
        return json({
            user,
            activeLicense: null,
            activeSession: null,
            initialMessages: [],
            requiresAuth: false,
            needsLicense: true
        });
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
        initialMessages,
        requiresAuth: false,
        needsLicense: false
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
    const { user, requiresAuth, needsLicense, activeLicense, activeSession, initialMessages } = useLoaderData<typeof loader>();
    const [authModalOpen, setAuthModalOpen] = useState(false);
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

    // Mostrar modal si se requiere autenticación
    useEffect(() => {
        if (requiresAuth) {
            setAuthModalOpen(true);
        }
    }, [requiresAuth]);

    // Si no está autenticado, mostrar solo el modal
    if (requiresAuth) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <AuthRequiredModal
                    isOpen={authModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    feature="chat"
                />
            </div>
        );
    }

    // Si necesita licencia, mostrar mensaje en lugar de bloquear acceso
    if (needsLicense) {
        return (
            <div className="h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
                <div className="flex-1 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border-2 border-blue-100 relative overflow-hidden"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                        {/* Decorative Background */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400 to-blue-400 rounded-full blur-2xl" />
                        </div>

                        {/* Content */}
                        <div className="relative">
                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="flex justify-center mb-6"
                            >
                                <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl">
                                    <svg className="w-16 h-16 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </motion.div>

                            {/* Title */}
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-bold text-gray-900 text-center mb-4"
                            >
                                Licencia Requerida
                            </motion.h2>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-600 text-center mb-6 leading-relaxed text-lg"
                            >
                                Para utilizar el chat legal necesitas una licencia activa. 
                                Puedes obtener un trial gratuito de 2 horas o adquirir un plan de licencias.
                            </motion.p>

                            {/* Decorative Line */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 mx-auto mb-6"
                            />

                            {/* Benefits Box */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-100"
                            >
                                <h3 className="font-semibold text-gray-900 mb-3 text-center">
                                    ¿Por qué necesitas una licencia?
                                </h3>
                                <ul className="space-y-3 text-sm text-gray-700">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                        </svg>
                                        <span>Acceso ilimitado al <strong>asistente legal IA</strong> especializado</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                        </svg>
                                        <span>Consultas with <strong>abogados certificados</strong> disponibles 24/7</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                        </svg>
                                        <span>Control de horas para gestionar tu tiempo de consulta</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                        </svg>
                                        <span><strong>Privacidad y confidencialidad</strong> garantizadas</span>
                                    </li>
                                </ul>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="space-y-3"
                            >
                                <Link
                                    to="/licencias"
                                    className="block w-full px-6 py-3 bg-black text-white text-center rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold shadow-lg"
                                >
                                    Ver Planes de Licencias
                                </Link>

                                <Link
                                    to="/"
                                    className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 text-center rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all duration-300 font-medium"
                                >
                                    Volver al Inicio
                                </Link>
                            </motion.div>

                            {/* Footer Note */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="text-xs text-gray-500 text-center mt-6 italic"
                            >
                                💡 Trial gratuito disponible: 2 horas sin tarjeta de crédito
                            </motion.p>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Custom Layout without Footer and with notification navbar
    return (
        <div className="h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 overflow-hidden">
            {/* Custom Navbar with Trial Notification */}
            <div className="flex-shrink-0">
                <div dangerouslySetInnerHTML={{
                    __html: `
                        <script>
                            window.__CHAT_DATA__ = ${JSON.stringify({ activeLicense })};
                        </script>
                    `
                }} />
                {/* The navbar will be rendered by the Layout but we need to pass license data */}
            </div>

            {/* Main Content - ocupa todo el alto restante */}
            <div className="flex-1 flex overflow-hidden">
                {/* Enhanced Sidebar con estilo editorial */}
                <motion.div
                    className="w-80 bg-white border-r-2 border-blue-200 flex flex-col shadow-lg relative overflow-hidden flex-shrink-0"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Background decorativo */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-2xl" />
                    </div>

                    {/* Sidebar Header con estilo editorial */}
                    <div className="relative p-6 border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-0.5 bg-blue-300 mb-4"
                        />

                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    Chat Legal
                                </h2>
                                <p className="text-sm text-gray-600 italic"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                    Asistencia jurídica
                                </p>
                            </div>
                        </div>
                        
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "40%" }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="h-0.5 bg-blue-400 mt-4"
                        />
                    </div>

                    {/* License Status con estilo mejorado */}
                    <div className="p-4 border-b border-blue-100 bg-gray-50">
                        <LicenseStatus activeLicense={activeLicense as any} />
                    </div>

                    {/* Chat Type Selection */}
                    {!currentSession && (
                        <motion.div
                            className="p-6 space-y-4 overflow-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="font-semibold text-gray-900 text-lg mb-4">
                                ¿Cómo te gustaría comenzar?
                            </h3>

                            <motion.button
                                onClick={() => handleCreateSession("ia")}
                                disabled={sessionCreator.state === "submitting"}
                                className="group w-full p-5 border-2 border-gray-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 text-left relative overflow-hidden"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative flex items-start space-x-4">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                        <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082a.75.75 0 00-.678.744v.812M9.75 3.104a48.424 48.424 0 011.5 0M5 14.5c0 2.208 1.792 4 4 4s4-1.792 4-4M5 14.5c0-1.01.377-1.932 1-2.626M19 14.5v-5.714a2.25 2.25 0 00-.659-1.591L14.25 3.104M19 14.5c0 2.208-1.792 4-4 4s-4-1.792-4-4m8 0c1.01-.377 1.932-1 2.626-1" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 mb-1">Asistente IA Legal</h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Consultas rápidas con inteligencia artificial especializada en derecho colombiano
                                        </p>
                                        <div className="flex items-center text-xs text-purple-600">
                                            <span className="flex items-center">
                                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                                </svg>
                                                <span>Respuestas instantáneas</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                            <motion.button
                                onClick={() => handleCreateSession("lawyer")}
                                disabled={sessionCreator.state === "submitting"}
                                className="group w-full p-5 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-left relative overflow-hidden" 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative flex items-start space-x-4">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                        <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 mb-1">Consulta con Abogado</h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Habla directamente con abogados certificados para asesoría legal personalizada
                                        </p>
                                        <div className="flex items-center text-xs text-blue-600">
                                            <span className="flex items-center">
                                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                                </svg>
                                                <span>Asesoría personalizada</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Botón de ir al inicio - siempre visible en el footer del sidebar */}
                    <div className="mt-auto p-4 border-t-2 border-blue-100 bg-gray-50">
                        <Link
                            to="/"
                            className="flex items-center justify-center space-x-2 w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 font-medium"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            <span>Volver al Inicio</span>
                        </Link>
                    </div>
                </motion.div>

                {/* Chat Container - ocupa todo el espacio restante */}
                {currentSession && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <ChatContainer
                            session={currentSession}
                            initialMessages={initialMessages}
                            chatType={chatType}
                            onSessionEnd={() => setCurrentSession(null)}
                        />
                    </div>
                )}

                {/* Empty State cuando no hay sesión */}
                {!currentSession && (
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center px-6"
                        >
                            <div className="h-24 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-6">
                                <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Selecciona un tipo de consulta
                            </h2>
                            <p className="text-gray-600 italic"
                               style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Elige entre IA Legal o Abogado para comenzar
                            </p>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
