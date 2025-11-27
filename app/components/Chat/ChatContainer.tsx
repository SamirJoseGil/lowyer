import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import TypingIndicator from "./TypingIndicator";

interface ChatContainerProps {
    session: any;
    initialMessages: any[];
    userId: string;
}

export default function ChatContainer({ session, initialMessages, userId }: ChatContainerProps) {
    const [messages, setMessages] = useState(initialMessages || []);
    const [isPolling, setIsPolling] = useState(true);
    const [showTyping, setShowTyping] = useState(false);
    const pollingRef = useRef<NodeJS.Timeout>();

    // Polling para obtener nuevos mensajes
    useEffect(() => {
        if (!isPolling) return;

        const pollMessages = async () => {
            try {
                const response = await fetch(`/api/chat/messages?sessionId=${session.id}&page=1&limit=50`);
                if (response.ok) {
                    const newMessages = await response.json();
                    setMessages(newMessages);
                }
            } catch (error) {
                console.error("Error polling messages:", error);
            }
        };

        // Poll every 2 seconds
        pollingRef.current = setInterval(pollMessages, 2000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [session.id, isPolling]);

    const handleMessageSent = (result: any) => {
        if (result.success) {
            // Mostrar indicador de "escribiendo" para respuesta de IA
            if (result.aiResponse) {
                setShowTyping(true);
                setTimeout(() => {
                    setShowTyping(false);
                    // El polling se encargará de cargar los nuevos mensajes
                }, 1000);
            }

            console.log(`📨 Message sent, polling will update UI`);
        }
    };

    const handleCloseSession = async () => {
        try {
            setIsPolling(false);

            const response = await fetch("/api/chat/close", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sessionId: session.id,
                    summary: "Sesión cerrada por el usuario"
                })
            });

            if (response.ok) {
                console.log(`✅ Session closed successfully`);
                window.location.reload(); // Reload to reset chat state
            }
        } catch (error) {
            console.error("Error closing session:", error);
        }
    };

    const isSessionActive = session.status === "active";
    const chatType = session.metadata?.chatType || "lawyer";

    return (
        <motion.div
            className="flex flex-col h-full bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Chat Header */}
            <ChatHeader
                session={session}
                onCloseSession={handleCloseSession}
                isClosing={false}
            />

            {/* Messages Area - Sin padding propio, MessageList lo maneja */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <MessageList
                    messages={messages}
                    currentUserId={userId}
                />

                {/* Typing Indicator */}
                {showTyping && (
                    <div className="px-6 pb-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex items-start gap-3"
                        >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082a.75.75 0 00-.678.744v.812M9.75 3.104a48.424 48.424 0 011.5 0M5 14.5c0 2.208 1.792 4 4 4s4-1.792 4-4M5 14.5c0-1.01.377-1.932 1-2.626M19 14.5v-5.714a2.25 2.25 0 00-.659-1.591L14.25 3.104M19 14.5c0 2.208-1.792 4-4 4s-4-1.792-4-4m8 0c1.01-.377 1.932-1 2.626-1" />
                                </svg>
                            </div>
                            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl px-4 py-3 max-w-xs border border-gray-200">
                                <div className="flex items-center space-x-1">
                                    <motion.div
                                        className="w-2 h-2 bg-gray-500 rounded-full"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            delay: 0
                                        }}
                                    />
                                    <motion.div
                                        className="w-2 h-2 bg-gray-500 rounded-full"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            delay: 0.2
                                        }}
                                    />
                                    <motion.div
                                        className="w-2 h-2 bg-gray-500 rounded-full"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            delay: 0.4
                                        }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Message Input */}
            <MessageInput
                sessionId={session.id}
                onMessageSent={handleMessageSent}
                disabled={!isSessionActive}
            />
        </motion.div>
    );
}
