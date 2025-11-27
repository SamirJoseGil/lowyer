import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

type Message = {
    id: string;
    content: string;
    senderRole: "user" | "abogado" | "admin" | "ia";
    createdAt: string;
    sender?: {
        profile?: {
            firstName?: string;
            lastName?: string;
        };
        email: string;
    };
    isError?: boolean;
};

type MessageListProps = {
    messages: Message[];
    currentUserId: string;
    isTyping?: boolean;
};

export default function MessageList({ messages, currentUserId, isTyping }: MessageListProps) {
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getMessageAvatar = (senderRole: string, senderName?: string) => {
        switch (senderRole) {
            case "user":
                return (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-medium">
                        {senderName?.charAt(0) || "U"}
                    </div>
                );
            case "ia":
                return (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082a.75.75 0 00-.678.744v.812M9.75 3.104a48.424 48.424 0 011.5 0M5 14.5c0 2.208 1.792 4 4 4s4-1.792 4-4M5 14.5c0-1.01.377-1.932 1-2.626M19 14.5v-5.714a2.25 2.25 0 00-.659-1.591L14.25 3.104M19 14.5c0 2.208-1.792 4-4 4s-4-1.792-4-4m8 0c1.01-.377 1.932-1 2.626-1" />
                        </svg>
                    </div>
                );
            case "abogado":
                return (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                        {senderName?.charAt(0) || "A"}
                    </div>
                );
            case "system":
                return (
                    <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-medium">
                        ?
                    </div>
                );
        }
    };

    const getSenderName = (senderRole: string, sender?: any) => {
        switch (senderRole) {
            case "user":
                return "Tú";
            case "ia":
                return "Asistente Legal IA";
            case "abogado":
                return sender?.profile?.firstName
                    ? `${sender.profile.firstName} ${sender?.profile?.lastName || ""}`
                    : "Abogado";
            case "system":
                return "Sistema";
            default:
                return "Desconocido";
        }
    };

    const isFromCurrentUser = (senderId: string | null, senderRole: string) => {
        return senderId === currentUserId && senderRole === "user";
    };

    return (
        <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-6 py-8 space-y-6 chat-scroll-smooth"
        >
            {messages.map((message, index) => {
                const isUser = isFromCurrentUser(message.sender?.email ?? null, message.senderRole);
                const senderName = getSenderName(message.senderRole, message.sender);
                const showAvatar = !isUser;

                return (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`flex items-start gap-3 message-slide-in ${isUser ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        {/* Avatar para mensajes de IA/Abogado (lado izquierdo) */}
                        {showAvatar && (
                            <motion.div
                                className="flex-shrink-0"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                            >
                                {getMessageAvatar(message.senderRole, senderName)}
                            </motion.div>
                        )}

                        {/* Contenedor del mensaje */}
                        <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                            {/* Nombre del remitente (solo para IA/Abogado) */}
                            {showAvatar && (
                                <div className="text-xs font-medium text-gray-600 mb-1 px-1">
                                    {senderName}
                                </div>
                            )}

                            {/* Burbuja del mensaje */}
                            <motion.div
                                className={`relative rounded-2xl px-4 py-3 max-w-full ${isUser
                                        ? 'message-gradient-user text-white rounded-br-sm'
                                        : message.senderRole === 'ia'
                                            ? 'message-gradient-ai text-gray-900 rounded-bl-sm'
                                            : message.senderRole === 'abogado'
                                                ? 'message-gradient-lawyer text-gray-900 rounded-bl-sm'
                                                : message.isError
                                                    ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-sm'
                                                    : 'bg-gray-50 text-gray-900 border border-gray-200 rounded-bl-sm'
                                    } shadow-md hover:shadow-lg transition-all duration-200 group`}
                                whileHover={{ y: -1 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Contenido del mensaje */}
                                <div className="text-sm leading-relaxed whitespace-pre-wrap text-legal">
                                    {message.content}
                                </div>

                                {/* Indicador especial para IA */}
                                {message.senderRole === 'ia' && (
                                    <div className="flex items-center mt-3 pt-2 border-t border-gray-200">
                                        <motion.div
                                            animate={{ rotate: [0, 360] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="h-4 w-4 text-purple-500 mr-2"
                                        >
                                            <svg fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082a.75.75 0 00-.678.744v.812M9.75 3.104a48.424 48.424 0 011.5 0M5 14.5c0 2.208 1.792 4 4 4s4-1.792 4-4M5 14.5c0-1.01.377-1.932 1-2.626M19 14.5v-5.714a2.25 2.25 0 00-.659-1.591L14.25 3.104M19 14.5c0 2.208-1.792 4-4 4s-4-1.792-4-4m8 0c1.01-.377 1.932-1 2.626-1" />
                                            </svg>
                                        </motion.div>
                                        <span className="text-xs text-gray-600 font-medium">Respuesta generada por IA</span>
                                    </div>
                                )}

                                {/* Indicador para abogado */}
                                {message.senderRole === 'abogado' && (
                                    <div className="flex items-center mt-3 pt-2 border-t border-green-200">
                                        <svg className="h-4 w-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                        </svg>
                                        <span className="text-xs text-gray-700 font-medium">Abogado verificado</span>
                                    </div>
                                )}

                                {/* Timestamp */}
                                <div className={`absolute -bottom-6 text-xs transition-opacity duration-200 ${isUser ? 'right-0 text-gray-500' : 'left-0 text-gray-500'
                                    } opacity-0 group-hover:opacity-100`}>
                                    {formatTimestamp(message.createdAt)}
                                </div>
                            </motion.div>
                        </div>

                        {/* Avatar para mensajes del usuario (lado derecho) */}
                        {isUser && (
                            <motion.div
                                className="flex-shrink-0"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                            >
                                {getMessageAvatar('user', 'U')}
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}

            {/* Welcome message para chats nuevos */}
            {messages.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center py-16"
                >
                    <div className="text-center max-w-md px-6">
                        <motion.div
                            className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                            animate={{
                                scale: [1, 1.05, 1],
                                rotate: [0, 2, -2, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" />
                            </svg>
                        </motion.div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            ¡Bienvenido al chat legal!
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            Escribe tu consulta y obtén asistencia legal especializada.
                            Estamos aquí para ayudarte con todas tus dudas jurídicas.
                        </p>

                        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                </svg>
                                Confidencial
                            </div>
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                                Seguro
                            </div>
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                                </svg>
                                Profesional
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Espacio adicional para el último mensaje */}
            <div className="pb-6"></div>
        </div>
    );
}
