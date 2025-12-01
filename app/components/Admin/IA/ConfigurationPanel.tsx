import { Form } from "@remix-run/react";
import { motion } from "framer-motion";

interface ConfigurationPanelProps {
    aiConfig: {
        modeloActivo: string;
        temperaturaGlobal: number;
        maxTokensRespuesta: number;
        ventanaContexto: number;
    };
    isSubmitting: boolean;
}

export default function ConfigurationPanel({ aiConfig, isSubmitting }: ConfigurationPanelProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-xl rounded-2xl p-8 border-2 border-purple-100"
        >
            <h2 className="text-2xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Configuración del Modelo de IA
            </h2>

            <Form method="post" className="space-y-6">
                <input type="hidden" name="action" value="update-ai-config" />

                {/* Modelo Activo */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Modelo de IA Activo
                    </label>
                    <select
                        name="modeloActivo"
                        defaultValue={aiConfig.modeloActivo}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    >
                        <option value="gemini">Google Gemini (Recomendado)</option>
                        <option value="openai">OpenAI GPT-4 (Próximamente)</option>
                        <option value="claude">Anthropic Claude (Próximamente)</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-2">
                        Selecciona el modelo que se usará en toda la plataforma
                    </p>
                </div>

                {/* Temperatura */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Temperatura (Creatividad): {aiConfig.temperaturaGlobal}
                    </label>
                    <input
                        type="range"
                        name="temperaturaGlobal"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue={aiConfig.temperaturaGlobal}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Preciso (0.0)</span>
                        <span>Balanceado (0.7)</span>
                        <span>Creativo (1.0)</span>
                    </div>
                </div>

                {/* Max Tokens */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Máximo de Tokens por Respuesta
                    </label>
                    <input
                        type="number"
                        name="maxTokensRespuesta"
                        defaultValue={aiConfig.maxTokensRespuesta}
                        min="512"
                        max="4096"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500"
                    />
                </div>

                {/* Ventana de Contexto */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Ventana de Contexto (Mensajes)
                    </label>
                    <input
                        type="number"
                        name="ventanaContexto"
                        defaultValue={aiConfig.ventanaContexto}
                        min="5"
                        max="50"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        Número de mensajes previos que la IA recordará
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
                >
                    {isSubmitting ? "Guardando..." : "Guardar Configuración"}
                </button>
            </Form>
        </motion.div>
    );
}
