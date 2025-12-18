import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin } from "~/lib/permissions.server";
import { 
    getAllAreas,
    getAllSubareas,
    getAllNormas,
    createArea,
    createSubarea,
    createNorma,
    createConcepto,
    assignNormaToSubarea,
    initializeLegalKnowledge,
    updateArea,
    deleteArea,
    updateSubarea,
    deleteSubarea,
    updateNorma,
    deleteNorma,
    updateConcepto,
    deleteConcepto
} from "~/lib/legal-knowledge-advanced.server";
import { getActiveAIConfig, updateAIConfig } from "~/lib/ai-models.server";
import { useState } from "react";

// Componentes modulares
import ConfigurationPanel from "~/components/Admin/IA/ConfigurationPanel";
import AreasPanel from "~/components/Admin/IA/AreasPanel";
import SubareasPanel from "~/components/Admin/IA/SubareasPanel";
import NormasPanel from "~/components/Admin/IA/NormasPanel";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await requireUser(request);

    if (!isSuperAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    const [areas, subareas, normas, aiConfig] = await Promise.all([
        getAllAreas(),
        getAllSubareas(),
        getAllNormas(),
        getActiveAIConfig()
    ]);

    return json({
        user,
        areas,
        subareas,
        normas,
        aiConfig: {
            ...aiConfig,
            temperaturaGlobal: Number(aiConfig.temperaturaGlobal)
        }
    });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const user = await requireUser(request);

    if (!isSuperAdmin(user)) {
        throw new Response("Not Found", { status: 404 });
    }

    const formData = await request.formData();
    const action = formData.get("action");

    try {
        switch (action) {
            case "initialize-knowledge": {
                const result = await initializeLegalKnowledge();
                return json({ success: true, message: result.message });
            }

            case "create-area": {
                const nombre = formData.get("nombre") as string;
                const descripcion = formData.get("descripcion") as string;
                
                await createArea({ nombre, descripcion });
                return json({ success: true, message: "Área creada exitosamente" });
            }

            case "create-subarea": {
                const areaId = formData.get("areaId") as string;
                const nombre = formData.get("nombre") as string;
                const descripcion = formData.get("descripcion") as string;
                
                await createSubarea({ areaId, nombre, descripcion });
                return json({ success: true, message: "Subárea creada exitosamente" });
            }

            case "create-norma": {
                const tipo = formData.get("tipo") as string;
                const nombre = formData.get("nombre") as string;
                const anio = parseInt(formData.get("anio") as string);
                const descripcion = formData.get("descripcion") as string;
                
                await createNorma({ tipo, nombre, anio, descripcion });
                return json({ success: true, message: "Norma creada exitosamente" });
            }

            case "create-concepto": {
                const subareaId = formData.get("subareaId") as string;
                const concepto = formData.get("concepto") as string;
                const definicion = formData.get("definicion") as string;
                const fuente = formData.get("fuente") as string;
                
                await createConcepto({ subareaId, concepto, definicion, fuente });
                return json({ success: true, message: "Concepto creado exitosamente" });
            }

            case "assign-norma": {
                const subareaId = formData.get("subareaId") as string;
                const normaId = formData.get("normaId") as string;
                
                await assignNormaToSubarea(subareaId, normaId);
                return json({ success: true, message: "Norma asignada exitosamente" });
            }

            case "update-ai-config": {
                const modeloActivo = formData.get("modeloActivo") as string;
                const temperaturaGlobal = parseFloat(formData.get("temperaturaGlobal") as string);
                const maxTokensRespuesta = parseInt(formData.get("maxTokensRespuesta") as string);
                const ventanaContexto = parseInt(formData.get("ventanaContexto") as string);
                const apiKeyOpenAI = formData.get("apiKeyOpenAI") as string;
                const apiKeyGemini = formData.get("apiKeyGemini") as string;
                
                await updateAIConfig({
                    modeloActivo: modeloActivo as any,
                    temperaturaGlobal,
                    maxTokensRespuesta,
                    ventanaContexto,
                    apiKeyOpenAI: apiKeyOpenAI || undefined,
                    apiKeyGemini: apiKeyGemini || undefined
                });
                
                console.log(`✅ AI config updated: Active model = ${modeloActivo}`);
                
                return json({ success: true, message: "Configuración actualizada correctamente" });
            }

            case "update-area": {
                const id = formData.get("id") as string;
                const nombre = formData.get("nombre") as string;
                const descripcion = formData.get("descripcion") as string;
                
                await updateArea(id, { nombre, descripcion });
                return json({ success: true, message: "Área actualizada exitosamente" });
            }

            case "delete-area": {
                const id = formData.get("id") as string;
                await deleteArea(id);
                return json({ success: true, message: "Área eliminada exitosamente" });
            }

            case "update-subarea": {
                const id = formData.get("id") as string;
                const nombre = formData.get("nombre") as string;
                const descripcion = formData.get("descripcion") as string;
                
                await updateSubarea(id, { nombre, descripcion });
                return json({ success: true, message: "Subárea actualizada exitosamente" });
            }

            case "delete-subarea": {
                const id = formData.get("id") as string;
                await deleteSubarea(id);
                return json({ success: true, message: "Subárea eliminada exitosamente" });
            }

            case "update-norma": {
                const id = formData.get("id") as string;
                const tipo = formData.get("tipo") as string;
                const nombre = formData.get("nombre") as string;
                const anio = formData.get("anio") ? parseInt(formData.get("anio") as string) : undefined;
                const descripcion = formData.get("descripcion") as string;
                
                await updateNorma(id, { tipo, nombre, anio, descripcion });
                return json({ success: true, message: "Norma actualizada exitosamente" });
            }

            case "delete-norma": {
                const id = formData.get("id") as string;
                await deleteNorma(id);
                return json({ success: true, message: "Norma eliminada exitosamente" });
            }

            case "update-concepto": {
                const id = formData.get("id") as string;
                const concepto = formData.get("concepto") as string;
                const definicion = formData.get("definicion") as string;
                const fuente = formData.get("fuente") as string;
                
                await updateConcepto(id, { concepto, definicion, fuente });
                return json({ success: true, message: "Concepto actualizado exitosamente" });
            }

            case "delete-concepto": {
                const id = formData.get("id") as string;
                await deleteConcepto(id);
                return json({ success: true, message: "Concepto eliminado exitosamente" });
            }

            default:
                return json({ error: "Acción no válida" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error in admin action:", error);
        return json({ error: "Error interno del servidor" }, { status: 500 });
    }
};

export default function AdminIA() {
    const { areas, subareas, normas, aiConfig } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<"config" | "areas" | "subareas" | "normas" | "conceptos">("config");

    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-blue-50/20">
            {/* Decorative Background */}
            <div className="fixed inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200/50 to-blue-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-20 w-80 h-80 bg-gradient-to-r from-cyan-200/40 to-purple-200/30 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 mb-6 rounded-full" />
                    
                    <h1 className="text-4xl font-bold text-gray-900 mb-2"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        Gestión de IA Legal
                    </h1>
                    <p className="text-lg text-gray-600 italic"
                       style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        Administra el conocimiento legal y configuración de modelos de IA
                    </p>

                    <div className="h-0.5 bg-gradient-to-r from-purple-400 via-transparent to-blue-400 mt-6" />
                </motion.div>

                {/* Tabs */}
                <div className="mb-8 bg-white shadow-lg rounded-xl p-2 border-2 border-purple-100">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {[{
                            id: "config",
                            label: "Configuración IA",
                            icon: "⚙️"
                        },
                        {
                            id: "areas",
                            label: "Áreas",
                            icon: "📚"
                        },
                        {
                            id: "subareas",
                            label: "Subáreas",
                            icon: "📑"
                        },
                        {
                            id: "normas",
                            label: "Normas",
                            icon: "📋"
                        },
                        {
                            id: "conceptos",
                            label: "Conceptos",
                            icon: "💡"
                        }
                    ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-purple-50'
                                }`}
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                            >
                                <span className="block md:inline mr-0 md:mr-2">{tab.icon}</span>
                                <span className="text-xs md:text-base">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Panels */}
                {activeTab === "config" && (
                    <ConfigurationPanel aiConfig={aiConfig} isSubmitting={isSubmitting} />
                )}

                {activeTab === "areas" && (
                    <AreasPanel areas={areas} isSubmitting={isSubmitting} />
                )}

                {activeTab === "subareas" && (
                    <SubareasPanel areas={areas} subareas={subareas} isSubmitting={isSubmitting} />
                )}

                {activeTab === "normas" && (
                    <NormasPanel normas={normas} isSubmitting={isSubmitting} />
                )}

                {activeTab === "conceptos" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white shadow-xl rounded-2xl p-8 border-2 border-purple-100"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Gestión de Conceptos Jurídicos
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Los conceptos jurídicos ayudan a la IA a explicar términos legales con precisión.
                        </p>

                        <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                            <p className="text-sm text-blue-900">
                                💡 <strong>Próximamente:</strong> Interfaz completa para gestión de conceptos jurídicos por subárea.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
