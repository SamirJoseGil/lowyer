import { useState, useEffect, useRef } from "react";
import { useFetcher } from "@remix-run/react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import HoursCounter from "../HoursCounter";

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
};

type ChatSession = {
    id: string;
    status: string;
    startedAt: string;
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
        hoursRemaining: number;
        license: {
            name: string;
        };
    };
};

type ChatContainerProps = {
    session: ChatSession;
    initialMessages: Message[];
    userId: string;
};

type MessageFetcherResponse = {
    success: boolean;
    message?: Message;
    aiResponse?: Message;
    error?: string;
};

type CloseFetcherResponse = {
    success: boolean;
    error?: string;
};

export default function ChatContainer({ session, initialMessages, userId }: ChatContainerProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const messageFetcher = useFetcher();
    const closeFetcher = useFetcher();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout>();
    const lastMessageIdRef = useRef<string>(initialMessages[initialMessages.length - 1]?.id || '');

    console.log(`💬 ChatContainer initialized for session ${session.id} with ${initialMessages.length} initial messages`);

    // Auto scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling for new messages (simple approach instead of WebSockets)
    useEffect(() => {
        const pollMessages = async () => {
            if (session.status !== "active") return;

            try {
                const currentLastMessageId = messages[messages.length - 1]?.id || '';

                if (currentLastMessageId === lastMessageIdRef.current) {
                    // No new messages to fetch
                    return;
                }

                console.log(`🔄 Polling for messages after ${lastMessageIdRef.current}`);

                const response = await fetch(`/api/chat/messages?sessionId=${session.id}&after=${lastMessageIdRef.current}`);
                if (response.ok) {
                    const newMessages = await response.json();

                    if (newMessages.length > 0) {
                        console.log(`📨 Received ${newMessages.length} new messages`);
                        setMessages(prev => {
                            // Avoid duplicates by checking message IDs
                            const existingIds = new Set(prev.map(msg => msg.id));
                            const uniqueNewMessages = newMessages.filter((msg: Message) => !existingIds.has(msg.id));

                            if (uniqueNewMessages.length > 0) {
                                lastMessageIdRef.current = uniqueNewMessages[uniqueNewMessages.length - 1].id;
                                return [...prev, ...uniqueNewMessages];
                            }

                            return prev;
                        });
                    }
                }
            } catch (error) {
                console.error("💥 Error polling messages:", error);
            }
        };

        // Poll every 2 seconds
        pollIntervalRef.current = setInterval(pollMessages, 2000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [session.id, session.status, messages.length]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isLoading) {
            console.log(`⚠️ Cannot send message: empty content or loading`);
            return;
        }

        console.log(`📤 Sending message: "${content.substring(0, 50)}..."`);
        setIsLoading(true);

        // Send message without optimistic update to avoid duplicates
        messageFetcher.submit(
            {
                action: "send",
                sessionId: session.id,
                content,
                senderRole: "user"
            },
            {
                method: "post",
                action: "/api/chat/send"
            }
        );
    };

    const handleCloseChat = () => {
        if (confirm("¿Estás seguro de que quieres cerrar el chat? Se guardará un resumen de la conversación.")) {
            console.log(`🔒 Closing chat session ${session.id}`);
            closeFetcher.submit(
                {
                    action: "close",
                    sessionId: session.id
                },
                {
                    method: "post",
                    action: "/api/chat/close"
                }
            );
        }
    };

    // Handle fetcher responses
    useEffect(() => {
        if (messageFetcher.data) {
            setIsLoading(false);
            const data = messageFetcher.data as MessageFetcherResponse;

            if (data.success) {
                console.log(`✅ Message sent successfully`);

                // Add the user message and AI response if present
                const newMessages = data.message ? [data.message] : [];
                if (data.aiResponse) {
                    newMessages.push(data.aiResponse);
                    console.log(`🤖 AI response received`);
                }

                setMessages(prev => {
                    // Avoid duplicates
                    const existingIds = new Set(prev.map(msg => msg.id));
                    const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));

                    if (uniqueNewMessages.length > 0) {
                        lastMessageIdRef.current = uniqueNewMessages[uniqueNewMessages.length - 1].id;
                        return [...prev, ...uniqueNewMessages];
                    }

                    return prev;
                });
            } else {
                alert(data.error || "Error al enviar el mensaje");
            }
        }
    }, [messageFetcher.data]);

    // Handle session close
    useEffect(() => {
        if ((closeFetcher.data as CloseFetcherResponse)?.success) {
            console.log(`✅ Chat session closed successfully`);
            // Optionally redirect or update UI
        }
    }, [closeFetcher.data]);

    const sessionStartTime = new Date(session.startedAt);
    const isActive = session.status === "active";

    console.log(`🖥️ Rendering ChatContainer with ${messages.length} messages, active: ${isActive}`);

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <ChatHeader
                session={session}
                onCloseChat={handleCloseChat}
                isClosing={closeFetcher.state === "submitting"}
            />

            {/* Hours Counter */}
            <div className="p-4 bg-gray-50 border-b">
                <HoursCounter
                    sessionStartTime={sessionStartTime}
                    hoursRemaining={Number(session.licenseInstance.hoursRemaining)}
                    onWarning={() => {
                        console.log(`⚠️ Hour warning triggered for session ${session.id}`);
                        alert("Te quedan menos de 10 minutos en tu licencia. Considera renovar para continuar.");
                    }}
                    onExhausted={() => {
                        console.log(`🚫 Hours exhausted for session ${session.id}`);
                        alert("Tu tiempo ha expirado. La sesión se cerrará automáticamente.");
                        handleCloseChat();
                    }}
                />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
                <MessageList
                    messages={messages}
                    currentUserId={userId}
                />
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {isActive ? (
                <MessageInput
                    onSendMessage={handleSendMessage}
                    disabled={isLoading || messageFetcher.state === "submitting"}
                    placeholder="Escribe tu consulta legal..."
                />
            ) : (
                <div className="p-4 bg-gray-100 text-center text-gray-600">
                    Esta sesión de chat ha finalizado
                </div>
            )}

            {/* Loading indicator */}
            {(isLoading || messageFetcher.state === "submitting") && (
                <div className="p-2 bg-blue-50 text-center text-blue-600 text-sm">
                    Enviando mensaje...
                </div>
            )}
        </div>
    );
}
