import { motion } from "framer-motion";
import { useState } from "react";

type ChatSession = {
    id: string;
    status: string;
    startedAt: string;
    endedAt?: string;
    lawyer?: {
        user: {
            profile?: {
                firstName?: string;
                lastName?: string;
            };
            email: string;
        };
    };
    licenseInstance: {
        license: {
            name: string;
        };
    };
};

interface ChatHeaderProps {
    session: ChatSession;
    onCloseSession: () => Promise<void>;
    isClosing: boolean;
}

export default function ChatHeader({ session, onCloseSession, isClosing }: ChatHeaderProps) {
    const [showInfo, setShowInfo] = useState(false);

    const isAI = !session.lawyer;
    const sessionType = isAI ? "IA Legal" : "Abogado";

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-400';
            case 'closed': return 'bg-gray-400';
            default: return 'bg-yellow-400';
        }
    };

    const formatDuration = (startTime: string) => {
        const start = new Date(startTime);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) {
            return `${diffMins} min`;
        }

        const diffHours = Math.floor(diffMins / 60);
        const remainingMins = diffMins % 60;
        return `${diffHours}h ${remainingMins}m`;
    };

    return (
        <motion.div
            className="p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between">
                {/* Session Info */}
                <div className="flex items-center space-x-4">
                    {/* Avatar/Icon */}
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isAI
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600'
                        }`}>
                        {isAI ? (
                            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082a.75.75 0 00-.678.744v.812M9.75 3.104a48.424 48.424 0 011.5 0M5 14.5c0 2.208 1.792 4 4 4s4-1.792 4-4M5 14.5c0-1.01.377-1.932 1-2.626M19 14.5v-5.714a2.25 2.25 0 00-.659-1.591L14.25 3.104M19 14.5c0 2.208-1.792 4-4 4s-4-1.792-4-4m8 0c1.01-.377 1.932-1 2.626-1" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        )}
                    </div>

                    {/* Session Details */}
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {isAI ? "Asistente Legal IA" :
                                    session.lawyer?.user?.profile?.firstName
                                        ? `${session.lawyer.user.profile.firstName} ${session.lawyer.user.profile.lastName || ""}`
                                        : "Abogado Profesional"
                                }
                            </h3>

                            {/* Status indicator */}
                            <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status)}`} />
                                <span className="text-sm text-gray-600 capitalize">{session.status}</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                                {isAI ? "Consulta con inteligencia artificial" : "Consulta con abogado profesional"}
                            </span>
                            {session.status === 'active' && (
                                <>
                                    <span>•</span>
                                    <span>Duración: {formatDuration(session.startedAt)}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                    {/* Info button */}
                    <motion.button
                        onClick={() => setShowInfo(!showInfo)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853L14.25 14.25M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                    </motion.button>

                    {/* Close session button */}
                    {session.status === 'active' && (
                        <motion.button
                            onClick={onCloseSession}
                            disabled={isClosing}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isClosing ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                </svg>
                            )}
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Extended info panel */}
            {showInfo && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">Tipo de consulta:</span>
                            <p className="text-gray-600">{sessionType}</p>
                        </div>

                        <div>
                            <span className="font-medium text-gray-700">Inicio:</span>
                            <p className="text-gray-600">
                                {new Date(session.startedAt).toLocaleString("es-CO")}
                            </p>
                        </div>

                        {session.endedAt && (
                            <div>
                                <span className="font-medium text-gray-700">Finalización:</span>
                                <p className="text-gray-600">
                                    {new Date(session.endedAt).toLocaleString("es-CO")}
                                </p>
                            </div>
                        )}

                        <div>
                            <span className="font-medium text-gray-700">ID de sesión:</span>
                            <p className="text-gray-600 font-mono text-xs">{session.id}</p>
                        </div>
                    </div>

                    {isAI && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-start space-x-2">
                                <svg className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                                </svg>
                                <div className="text-sm">
                                    <p className="font-medium text-purple-800">Información sobre IA Legal</p>
                                    <p className="text-purple-700 mt-1">
                                        Esta conversación es con nuestro asistente de inteligencia artificial especializado en derecho colombiano.
                                        Las respuestas son informativas y no constituyen asesoría legal formal.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}
