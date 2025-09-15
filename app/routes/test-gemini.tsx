import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { testGeminiConnection, getGeminiResponse, listAvailableModels } from "~/lib/gemini.server";

type ActionData = {
    success: boolean;
    error?: string;
    response?: string;
    models?: string[];
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const action = formData.get("action");

    try {
        switch (action) {
            case "test-connection": {
                console.log(`🧪 Manual Gemini connection test requested`);
                const result = await testGeminiConnection();
                return json(result);
            }

            case "test-message": {
                const message = formData.get("message")?.toString() || "Hola, ¿puedes ayudarme?";
                console.log(`💬 Manual Gemini message test: "${message}"`);
                const result = await getGeminiResponse(message);
                return json(result);
            }

            case "list-models": {
                console.log(`📋 Listing available models`);
                const result = await listAvailableModels();
                return json(result);
            }

            default:
                return json({ success: false, error: "Acción no válida" }, { status: 400 });
        }
    } catch (error) {
        console.error("💥 Error in Gemini test:", error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido"
        }, { status: 500 });
    }
};

export default function TestGemini() {
    const actionData = useActionData<ActionData>();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-2xl w-full space-y-8 p-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Prueba de Gemini API
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Verifica la conectividad y funcionamiento del servicio de IA con los nuevos modelos
                    </p>
                </div>

                <div className="space-y-4">
                    <Form method="post">
                        <input type="hidden" name="action" value="list-models" />
                        <button
                            type="submit"
                            className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                        >
                            📋 Listar Modelos Disponibles
                        </button>
                    </Form>

                    <Form method="post">
                        <input type="hidden" name="action" value="test-connection" />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            🧪 Probar Conexión (Gemini 2.5 Flash)
                        </button>
                    </Form>

                    <Form method="post" className="space-y-4">
                        <input type="hidden" name="action" value="test-message" />
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                Mensaje de prueba:
                            </label>
                            <textarea
                                name="message"
                                id="message"
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                placeholder="Escribe un mensaje para probar la IA..."
                                defaultValue="¿Puedes explicarme brevemente qué es el derecho civil en Colombia?"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            💬 Enviar Mensaje de Prueba
                        </button>
                    </Form>
                </div>

                {actionData && (
                    <div className={`mt-6 p-4 rounded-md ${actionData.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <h3 className={`font-medium ${actionData.success ? 'text-green-800' : 'text-red-800'}`}>
                            {actionData.success ? '✅ Éxito' : '❌ Error'}
                        </h3>
                        <div className={`mt-2 text-sm ${actionData.success ? 'text-green-700' : 'text-red-700'}`}>
                            {actionData.success ? (
                                actionData.response ? (
                                    <div>
                                        <p className="font-medium">Respuesta de Gemini:</p>
                                        <div className="mt-2 p-3 bg-white border rounded">
                                            {actionData.response}
                                        </div>
                                    </div>
                                ) : actionData.models ? (
                                    <div>
                                        <p className="font-medium">Modelos disponibles:</p>
                                        <ul className="mt-2 list-disc list-inside">
                                            {actionData.models.map((model: string) => (
                                                <li key={model} className="font-mono text-xs">{model}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    "Conexión exitosa con Gemini API"
                                )
                            ) : (
                                actionData.error
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-8 text-sm text-gray-600">
                    <h3 className="font-medium text-gray-900 mb-2">Información actualizada:</h3>
                    <ul className="space-y-1 text-xs font-mono">
                        <li>• Modelo principal: <strong>gemini-2.5-flash</strong> (más rápido y económico)</li>
                        <li>• Modelo fallback: <strong>gemini-2.5-flash-lite</strong></li>
                        <li>• <strong>gemini-pro</strong> ya no está disponible en v1beta</li>
                        <li>• Revisa los logs de la consola para más detalles</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
