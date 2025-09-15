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
};

type MessageListProps = {
    messages: Message[];
    currentUserId: string;
};

export default function MessageList({ messages, currentUserId }: MessageListProps) {
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSenderName = (message: Message) => {
        if (message.senderRole === "user") return "Tú";
        if (message.senderRole === "ia") return "Asistente IA";
        if (message.senderRole === "admin") return "Administrador";

        const profile = message.sender?.profile;
        if (profile?.firstName && profile?.lastName) {
            return `${profile.firstName} ${profile.lastName}`;
        }
        return message.sender?.email || "Abogado";
    };

    const getMessageStyles = (message: Message) => {
        const isCurrentUser = message.senderRole === "user";

        if (isCurrentUser) {
            return {
                container: "justify-end",
                bubble: "bg-law-accent text-white rounded-l-lg rounded-tr-lg",
                text: "text-white"
            };
        }

        if (message.senderRole === "ia") {
            return {
                container: "justify-start",
                bubble: "bg-blue-100 text-blue-900 rounded-r-lg rounded-tl-lg",
                text: "text-blue-900"
            };
        }

        return {
            container: "justify-start",
            bubble: "bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg",
            text: "text-gray-900"
        };
    };

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.691 1.358 3.061 3.049 3.061h4.203l2.477 2.477c.329.329.821.329 1.15 0l2.477-2.477h4.203c1.691 0 3.049-1.37 3.049-3.061V6.75c0-1.691-1.358-3.061-3.049-3.061H3.299c-1.691 0-3.049 1.37-3.049 3.061v8.25z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">¡Inicia la conversación!</h3>
                    <p className="text-sm">Envía tu primera consulta legal para comenzar.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ maxHeight: 'calc(100vh - 300px)' }}
        >
            {messages.map((message) => {
                const styles = getMessageStyles(message);
                const senderName = getSenderName(message);

                return (
                    <div key={message.id} className={`flex ${styles.container}`}>
                        <div className="max-w-xs lg:max-w-md">
                            {/* Sender name (only for non-user messages) */}
                            {message.senderRole !== "user" && (
                                <div className="text-xs text-gray-500 mb-1 px-3">
                                    {senderName}
                                </div>
                            )}

                            {/* Message bubble */}
                            <div className={`px-4 py-2 ${styles.bubble}`}>
                                <p className={`text-sm ${styles.text} break-words`}>
                                    {message.content}
                                </p>
                            </div>

                            {/* Timestamp */}
                            <div className={`text-xs text-gray-400 mt-1 px-3 ${message.senderRole === "user" ? "text-right" : "text-left"}`}>
                                {formatTime(message.createdAt)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
