import { useState, useRef, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Escribe tu mensaje..."
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 1000;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Max 200px
    }
  }, [message]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    // Validaciones
    if (!trimmedMessage) {
      console.log("⚠️ Cannot send empty message");
      return;
    }

    if (trimmedMessage.length > MAX_CHARS) {
      console.log(`⚠️ Message exceeds ${MAX_CHARS} characters`);
      return;
    }

    if (isSending) {
      console.log("⚠️ Already sending a message");
      return;
    }

    if (disabled) {
      console.log("⚠️ Message input is disabled");
      return;
    }

    try {
      setIsSending(true);
      console.log(`📤 Sending message: "${trimmedMessage.substring(0, 50)}..."`);
      
      await onSendMessage(trimmedMessage);
      
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sin Shift = enviar
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    // Shift + Enter = nueva línea (comportamiento por defecto)
  };

  const remainingChars = MAX_CHARS - message.length;
  const isNearLimit = remainingChars < 100;
  const canSend = message.trim().length > 0 && 
                  message.length <= MAX_CHARS && 
                  !isSending && 
                  !disabled;

  return (
    <div className="border-t-2 border-gray-100 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSending}
              rows={1}
              className="w-full px-4 py-3 pr-16 border-2 border-gray-200 rounded-xl resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                minHeight: "48px",
                maxHeight: "200px",
                overflow: "auto"
              }}
            />

            {/* Character Counter */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <span 
                className={`text-xs font-medium transition-colors ${
                  isNearLimit 
                    ? remainingChars < 0 
                      ? 'text-red-600' 
                      : 'text-orange-600'
                    : 'text-gray-400'
                }`}
              >
                {remainingChars}
              </span>
            </div>
          </div>

          {/* Helper Text */}
          <div className="flex items-center justify-between mt-1 px-1">
            <span className="text-xs text-gray-500">
              Shift + Enter para nueva línea
            </span>
            {message.length > MAX_CHARS && (
              <span className="text-xs text-red-600 font-medium">
                Excede el límite de {MAX_CHARS} caracteres
              </span>
            )}
          </div>
        </div>

        {/* Send Button */}
        <motion.button
          type="submit"
          disabled={!canSend}
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.95 } : {}}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
            canSend
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          style={{ 
            fontFamily: "Georgia, 'Times New Roman', serif",
            minHeight: "48px"
          }}
        >
          {isSending ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              <span>Enviar</span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
