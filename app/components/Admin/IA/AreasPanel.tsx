import { Form } from "@remix-run/react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface AreasPanelProps {
    areas: any[];
    isSubmitting: boolean;
}

export default function AreasPanel({ areas, isSubmitting }: AreasPanelProps) {
    const [editingArea, setEditingArea] = useState<any>(null);
    const areaFormRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingArea && areaFormRef.current) {
            areaFormRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        }
    }, [editingArea]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Crear/Editar Área */}
            <div 
                ref={areaFormRef}
                className="bg-white shadow-xl rounded-2xl p-8 border-2 border-purple-100"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    {editingArea ? "Editar Área de Derecho" : "Crear Nueva Área de Derecho"}
                </h2>

                <Form method="post" className="space-y-4" onSubmit={() => setEditingArea(null)}>
                    <input type="hidden" name="action" value={editingArea ? "update-area" : "create-area"} />
                    {editingArea && <input type="hidden" name="id" value={editingArea.id} />}
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nombre del Área
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            required
                            defaultValue={editingArea?.nombre}
                            placeholder="ej: Derecho Civil"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Descripción
                        </label>
                        <textarea
                            name="descripcion"
                            required
                            rows={3}
                            defaultValue={editingArea?.descripcion}
                            placeholder="Descripción detallada del área..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500"
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                        >
                            {editingArea ? "Actualizar Área" : "Crear Área"}
                        </button>
                        {editingArea && (
                            <button
                                type="button"
                                onClick={() => setEditingArea(null)}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </Form>
            </div>

            {/* Lista de Áreas */}
            <div className="bg-white shadow-xl rounded-2xl p-8 border-2 border-purple-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    Áreas Existentes ({areas.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {areas.map((area) => (
                        <div
                            key={area.id}
                            className="p-6 border-2 border-purple-100 rounded-xl hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {area.nombre}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {area.descripcion}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                        </svg>
                                        {area._count?.subareas || 0} subáreas
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setEditingArea(area)}
                                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-200 transition-all"
                                >
                                    ✏️ Editar
                                </button>
                                <Form method="post" className="flex-1">
                                    <input type="hidden" name="action" value="delete-area" />
                                    <input type="hidden" name="id" value={area.id} />
                                    <button
                                        type="submit"
                                        onClick={(e) => {
                                            if (!confirm(`¿Eliminar "${area.nombre}"? Esto eliminará todas sus subáreas.`)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-full px-3 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200 transition-all"
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </Form>
                            </div>
                        </div>
                    ))}
                </div>

                {areas.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">No hay áreas creadas</p>
                        <Form method="post">
                            <input type="hidden" name="action" value="initialize-knowledge" />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700"
                            >
                                Inicializar Base de Conocimiento
                            </button>
                        </Form>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
