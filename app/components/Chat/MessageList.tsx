import { motion } from "framer-motion";
import clsx from "clsx";
import MarkdownMessage from "./MarkdownMessage";

interface Message {
  id: string;
  content: string;
  senderRole: string;
  senderId: string | null;
  createdAt: string;
  sender?: {
    profile?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  } | null;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="h-20 w-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Inicia la conversación
          </h3>
          <p className="text-gray-600 text-sm"
             style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Escribe tu consulta legal para comenzar
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#3b82f6 #e5e7eb'
      }}
    >
      {messages.map((message) => {
        const isOwnMessage = message.senderId === currentUserId;
        const isAI = message.senderRole === "ia";
        
        const displayName = message.sender?.profile?.firstName && message.sender?.profile?.lastName
          ? `${message.sender.profile.firstName} ${message.sender.profile.lastName}`
          : isAI ? "Asistente Legal IA" : "Usuario";

        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={clsx(
              "flex items-start gap-3 w-full",
              isOwnMessage ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div className={clsx(
              "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-md",
              isOwnMessage
                ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                : isAI
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-gradient-to-r from-green-500 to-teal-500"
            )}>
              {isAI ? (
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z" />
                  <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-sm font-medium text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Message Bubble */}
            <div className={clsx(
              "flex-1 rounded-2xl px-5 py-3 shadow-md max-w-2xl",
              isOwnMessage
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                : "bg-white border-2 border-gray-100"
            )}>
              {/* Sender Name - Solo para mensajes que NO son del usuario actual */}
              {!isOwnMessage && (
                <p className={clsx(
                  "text-xs font-semibold mb-2",
                  isAI ? "text-purple-600" : "text-gray-600"
                )}>
                  {isAI ? (
                    <span className="flex items-center">
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 7H7v6h6V7z" />
                        <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                      </svg>
                      Asistente Legal IA
                    </span>
                  ) : displayName}
                </p>
              )}

              {/* Message Content con Markdown para IA */}
              {isAI ? (
                <MarkdownMessage content={message.content} />
              ) : (
                <p className={clsx(
                  "text-sm leading-relaxed whitespace-pre-wrap",
                  isOwnMessage ? "text-white" : "text-gray-800"
                )}>
                  {message.content}
                </p>
              )}

              {/* Timestamp */}
              <p className={clsx(
                "text-xs mt-2",
                isOwnMessage ? "text-blue-100" : "text-gray-500"
              )}>
                {new Date(message.createdAt).toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
