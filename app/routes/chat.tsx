import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MetaFunction } from "@remix-run/node";
import Layout from "~/components/Layout";
import {
    PaperAirplaneIcon,
    ArrowPathIcon,
    InformationCircleIcon,
    LightBulbIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
    return [
        { title: "Chat con Asistente Legal - Lawyer" },
        { name: "description", content: "Consulta con nuestro asistente legal basado en IA para obtener respuestas rápidas a tus preguntas jurídicas." },
    ];
};

// Tipo para los mensajes
type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
};

// Ejemplos predefinidos
const examples = [
    "¿Cómo puedo reclamar por un producto defectuoso?",
    "¿Cuáles son mis derechos laborales si me despiden?",
    "¿Qué debo hacer ante una multa de tránsito injusta?",
    "¿Cómo funciona el proceso de divorcio en Colombia?"
];

// Respuestas predefinidas
const predefinedResponses: Record<string, string> = {
    "¿Cómo puedo reclamar por un producto defectuoso?":
        "Para reclamar por un producto defectuoso, debes seguir estos pasos:\n\n1. Reúne evidencia del defecto (fotos, videos)\n2. Contacta al vendedor o fabricante presentando tu factura de compra\n3. Presenta una reclamación formal por escrito detallando el problema\n4. Si no obtienes respuesta en 15 días, puedes acudir a la Superintendencia de Industria y Comercio\n\nRecuerda que por ley tienes derecho a garantía, reparación, cambio o devolución del dinero según el caso.",

    "¿Cuáles son mis derechos laborales si me despiden?":
        "Si te despiden, tus derechos laborales incluyen:\n\n1. Indemnización por despido sin justa causa (si aplica)\n2. Pago de salarios pendientes\n3. Liquidación de prestaciones sociales (cesantías, intereses, prima, vacaciones)\n4. Certificado laboral\n\nSi consideras que fue un despido injustificado, tienes 3 años para reclamar judicialmente. Te recomendaría conservar toda comunicación relacionada con el despido y consultar con un abogado laboral para evaluar tu caso específico.",

    "¿Qué debo hacer ante una multa de tránsito injusta?":
        "Para impugnar una multa de tránsito que consideres injusta:\n\n1. Verifica los detalles de la infracción en el comparendo\n2. Recopila evidencia que respalde tu versión (fotos, videos, testimonios)\n3. Presenta un recurso de reconsideración por escrito dentro de los 5 días hábiles siguientes\n4. Si es rechazado, puedes presentar recurso de apelación\n\nEs importante actuar rápidamente, ya que los plazos son estrictos. Si no impugnas a tiempo, perderás el derecho a objetar la multa.",

    "¿Cómo funciona el proceso de divorcio en Colombia?":
        "El divorcio en Colombia puede tramitarse de dos formas:\n\n1. Divorcio de mutuo acuerdo:\n   - Se realiza ante notario si no hay hijos menores\n   - Ante juez de familia si hay hijos menores\n   - Requiere un acuerdo sobre bienes, custodia y alimentos\n   - Suele durar entre 3 y 6 meses\n\n2. Divorcio contencioso:\n   - Se tramita ante juez de familia\n   - Requiere demostrar una causal de divorcio (infidelidad, maltrato, etc.)\n   - Puede durar entre 1 y 2 años\n\nEn ambos casos, necesitarás documentos como registro civil de matrimonio, registros de nacimiento de hijos, y un inventario de bienes."
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hola, soy tu asistente legal. ¿En qué puedo ayudarte hoy?',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll a los mensajes más recientes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!input.trim()) return;

        // Añadir mensaje del usuario
        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        // Simular respuesta del bot (con delay para efecto realista)
        setTimeout(() => {
            let botResponse: string;

            // Buscar respuesta predefinida
            if (predefinedResponses[input]) {
                botResponse = predefinedResponses[input];
            } else {
                // Respuesta genérica
                botResponse = "Entiendo tu consulta sobre este tema legal. Para darte una respuesta más precisa, necesitaría conocer más detalles sobre tu situación particular. Sin embargo, te recomendaría consultar con un abogado especializado, ya que cada caso puede tener matices importantes. ¿Hay algún aspecto específico sobre el que necesites orientación?";
            }

            const botMessage: Message = {
                id: Date.now().toString(),
                text: botResponse,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setLoading(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleExampleClick = (example: string) => {
        setInput(example);
    };

    return (
        <Layout>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="py-10">
                    <motion.div
                        className="mx-auto max-w-4xl rounded-xl border border-gray-200 shadow-md overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Header */}
                        <div className="bg-white px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-law-accent flex items-center justify-center">
                                        <span className="text-white font-semibold text-lg">L</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Asistente Legal</h2>
                                        <p className="text-sm text-gray-500">Respuesta en segundos</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <span className="relative flex h-2 w-2 mr-2">
                                            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        En línea
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Chat area */}
                        <div className="bg-gray-50 h-[60vh] overflow-y-auto p-6">
                            <div className="space-y-6">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-lg rounded-lg px-4 py-2 ${message.sender === 'user'
                                                ? 'bg-law-accent text-white'
                                                : 'bg-white text-gray-800 border border-gray-200'
                                                }`}
                                        >
                                            <div className="whitespace-pre-line text-sm">
                                                {message.text}
                                            </div>
                                            <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                                                }`}>
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {loading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className="max-w-lg rounded-lg px-4 py-2 bg-white text-gray-800 border border-gray-200">
                                            <div className="flex space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Examples */}
                        <div className="bg-white px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center">
                                <LightBulbIcon className="h-5 w-5 text-gray-500 mr-2" />
                                <p className="text-sm text-gray-600">Ejemplos de preguntas:</p>
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {examples.map((example, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleExampleClick(example)}
                                        className="text-left text-sm px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
                                    >
                                        {example}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input area */}
                        <div className="bg-white px-6 py-4 border-t border-gray-200">
                            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Escribe tu consulta legal..."
                                    className="flex-1 min-h-[44px] max-h-32 overflow-auto resize-none block rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-law-accent sm:text-sm sm:leading-6"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="ml-3 inline-flex items-center rounded-md bg-law-accent px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-law-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-law-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <PaperAirplaneIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </form>
                            <div className="mt-2 flex items-center justify-center">
                                <div className="text-xs text-gray-500 flex items-center">
                                    <InformationCircleIcon className="h-3 w-3 mr-1" />
                                    Esta es una demostración. Para acceso completo, adquiere una licencia.
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}
