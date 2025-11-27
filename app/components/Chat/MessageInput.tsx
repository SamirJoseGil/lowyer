import { useState, useRef, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { motion } from "framer-motion";

interface MessageInputProps {
    sessionId: string;
    onMessageSent?: (message: any) => void;
    disabled?: boolean;
}

export default function MessageInput({ sessionId, onMessageSent, disabled }: MessageInputProps) {
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fetcher = useFetcher();

    const isSubmitting = fetcher.state === "submitting";
    const maxLength = 2000;

    useEffect(() => {
        if (fetcher.data) {
            if (typeof fetcher.data === 'object' && fetcher.data !== null && 'success' in fetcher.data) {
                if (fetcher.data.success) {
                    setMessage("");
                    onMessageSent?.(fetcher.data);
                    console.log(`✅ Message sent successfully`);
                } else {
                    console.error(`❌ Error sending message:`, (fetcher.data as { error?: string }).error);
                }
            }
        }
    }, [fetcher.data, onMessageSent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim() || isSubmitting || disabled) {
            return;
        }

        console.log(`📤 Sending message to session ${sessionId}`);

        try {
            // Enviar como JSON usando fetch
            const response = await fetch("/api/chat/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sessionId,
                    content: message.trim(),
                    senderRole: "user"
                })
            });

            const result = await response.json();

            if (result.success) {
                setMessage("");
                onMessageSent?.(result);
                console.log(`✅ Message sent successfully`);
            } else {
                console.error(`❌ Error sending message:`, result.error);
            }
        } catch (error) {
            console.error(`💥 Error in message submit:`, error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }

        // Typing indicator (opcional para implementación futura)
        if (!isTyping) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 1000);
        }
    };

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe tu consulta legal aquí..."
                        disabled={disabled || isSubmitting}
                        maxLength={maxLength}
                        rows={1}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            minHeight: "48px",
                            maxHeight: "120px"
                        }}
                    />

                    {/* Character counter */}
                    <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                        {message.length}/{maxLength}
                    </div>
                </div>

                <motion.button
                    type="submit"
                    disabled={!message.trim() || isSubmitting || disabled}
                    className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isSubmitting ? (
                        <motion.div
                            className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                    ) : (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    )}
                </motion.button>
            </form>

            {/* Tips */}
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                <span>Presiona Enter para enviar, Shift+Enter para nueva línea</span>
                {disabled && (
                    <span className="text-red-500 font-medium">
                        Sesión inactiva
                    </span>
                )}
            </div>
        </div>
    );
}
