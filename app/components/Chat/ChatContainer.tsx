import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";

interface ChatContainerProps {
  session: any;
  initialMessages: any[];
  chatType: "ia" | "lawyer";
  onSessionEnd: () => void;
}

export default function ChatContainer({
  session,
  initialMessages,
  chatType,
  onSessionEnd,
}: ChatContainerProps) {
  const [messages, setMessages] = useState(initialMessages);
  const messageFetcher = useFetcher();

  // Poll para nuevos mensajes cada 3 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/chat/messages?sessionId=${session.id}`
        );
        const newMessages = await response.json();
        setMessages(newMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [session.id]);

  // Actualizar cuando llega respuesta del fetcher
  useEffect(() => {
    const fetchMessages = async () => {
      if (messageFetcher.data) {
        try {
          const response = await fetch(
            `/api/chat/messages?sessionId=${session.id}`
          );
          const newMessages = await response.json();
          setMessages(newMessages);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };
    fetchMessages();
  }, [messageFetcher.data, session.id]);

  const handleSendMessage = (content: string) => {
    // Validación adicional antes de enviar
    if (!session || !session.id) {
      console.error("❌ No session ID available");
      return;
    }

    if (!content || content.trim().length === 0) {
      console.error("❌ Cannot send empty message");
      return;
    }

    console.log(`📤 Sending message to session ${session.id}`);

    const formData = new FormData();
    formData.append("sessionId", session.id);
    formData.append("content", content.trim());
    formData.append("senderRole", "user");

    messageFetcher.submit(formData, {
      method: "post",
      action: "/api/chat/send",
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <ChatHeader session={session} chatType={chatType} onSessionEnd={onSessionEnd} />

      {/* Messages - COMPONENTE CON SCROLL */}
      <MessageList 
        messages={messages} 
        currentUserId={session.userId} 
      />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={messageFetcher.state === "submitting"}
        placeholder={
          chatType === "ia"
            ? "Escribe tu consulta legal..."
            : "Escribe tu mensaje al abogado..."
        }
      />
    </div>
  );
}
