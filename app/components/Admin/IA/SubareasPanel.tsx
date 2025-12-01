import { Form } from "@remix-run/react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface SubareasPanelProps {
    areas: any[];
    subareas: any[];
    isSubmitting: boolean;
}

export default function SubareasPanel({ areas, subareas, isSubmitting }: SubareasPanelProps) {
    const [editingSubarea, setEditingSubarea] = useState<any>(null);
    const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>("");
    const subareaFormRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingSubarea && subareaFormRef.current) {
            subareaFormRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        }
    }, [editingSubarea]);

    const filteredSubareas = selectedAreaFilter
        ? subareas.filter(s => s.areaId === selectedAreaFilter)
        : subareas;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Crear/Editar Subárea */}
            <div 
                ref={subareaFormRef}
                className="bg-white shadow-xl rounded-2xl p-8 border-2 border-purple-100"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    {editingSubarea ? "Editar Subárea de Derecho" : "Crear Nueva Subárea"}
                </h2>

                <Form method="post" className="space-y-4" onSubmit={() => setEditingSubarea(null)}>
                    <input type="hidden" name="action" value={editingSubarea ? "update-subarea" : "create-subarea"} />
                    {editingSubarea && <input type="hidden" name="id" value={editingSubarea.id} />}
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Área de Derecho Padre
                        </label>
                        <select
                            name="areaId"
                            required
                            defaultValue={editingSubarea?.areaId}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500"
                        >
                            <option value="">Selecciona un área</option>
                            {areas.map((area) => (
                                <option key={area.id} value={area.id}>
                                    {area.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nombre de la Subárea
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            required
                            defaultValue={editingSubarea?.nombre}
                            placeholder="ej: Contratos Civiles"
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
                            defaultValue={editingSubarea?.descripcion}
                            placeholder="Descripción detallada de la subárea..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500"
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                        >
                            {editingSubarea ? "Actualizar Subárea" : "Crear Subárea"}
                        </button>
                        {editingSubarea && (
                            <button
                                type="button"
                                onClick={() => setEditingSubarea(null)}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </Form>
            </div>

            {/* Lista de Subáreas con Filtro */}
            <div className="bg-white shadow-xl rounded-2xl p-8 border-2 border-purple-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        Subáreas Existentes ({filteredSubareas.length})
                    </h2>
                    
                    <select
                        value={selectedAreaFilter}
                        onChange={(e) => setSelectedAreaFilter(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                    >
                        <option value="">Todas las áreas</option>
                        {areas.map((area) => (
                            <option key={area.id} value={area.id}>
                                {area.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    {filteredSubareas.map((subarea) => (
                        <div
                            key={subarea.id}
                            className="p-4 border-2 border-purple-100 rounded-xl hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                            {subarea.area?.nombre || 'Área no encontrada'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                        {subarea.nombre}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {subarea.descripcion}
                                    </p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <span>📋 {subarea._count?.normasSubareas || 0} normas</span>
                                        <span>💡 {subarea._count?.conceptosJuridicos || 0} conceptos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2 mt-4">
                                <button
                                    onClick={() => setEditingSubarea(subarea)}
                                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-200 transition-all"
                                >
                                    ✏️ Editar
                                </button>
                                <Form method="post" className="flex-1">
                                    <input type="hidden" name="action" value="delete-subarea" />
                                    <input type="hidden" name="id" value={subarea.id} />
                                    <button
                                        type="submit"
                                        onClick={(e) => {
                                            if (!confirm(`¿Eliminar "${subarea.nombre}"?`)) {
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

                {filteredSubareas.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            {selectedAreaFilter 
                                ? "No hay subáreas para el área seleccionada" 
                                : "No hay subáreas creadas"}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
