import { useState, useRef, KeyboardEvent } from "react";

type MessageInputProps = {
    onSendMessage: (content: string) => void;
    disabled?: boolean;
    placeholder?: string;
};

export default function MessageInput({
    onSendMessage,
    disabled = false,
    placeholder = "Escribe tu mensaje..."
}: MessageInputProps) {
    const [message, setMessage] = useState("");
    const [isComposing, setIsComposing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage("");

            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        // Auto-resize textarea
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    };

    const characterCount = message.length;
    const maxCharacters = 2000;
    const isOverLimit = characterCount > maxCharacters;

    return (
        <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-end space-x-3">
                <div className="flex-1">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className={`w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-law-accent focus:border-transparent transition-colors ${disabled
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'border-gray-300 hover:border-gray-400'
                            } ${isOverLimit ? 'border-red-300 focus:ring-red-500' : ''
                            }`}
                        style={{
                            minHeight: '40px',
                            maxHeight: '120px'
                        }}
                    />

                    {/* Character counter */}
                    <div className={`text-xs mt-1 ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                        {characterCount}/{maxCharacters}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={disabled || !message.trim() || isOverLimit}
                    className="p-2 bg-law-accent text-white rounded-lg hover:bg-law-accent/90 focus:outline-none focus:ring-2 focus:ring-law-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Enviar mensaje (Enter)"
                >
                    {disabled ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Help text */}
            <div className="text-xs text-gray-500 mt-2">
                Presiona Enter para enviar, Shift+Enter para nueva línea
            </div>
        </div>
    );
}
