import { Form } from "@remix-run/react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface NormasPanelProps {
    normas: any[];
    isSubmitting: boolean;
}

export default function NormasPanel({ normas, isSubmitting }: NormasPanelProps) {
    const [editingNorma, setEditingNorma] = useState<any>(null);
    const normaFormRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingNorma && normaFormRef.current) {
            normaFormRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        }
    }, [editingNorma]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Crear/Editar Norma */}
            <div 
                ref={normaFormRef}
                className="bg-white shadow-xl rounded-2xl p-8 border-2 border-purple-100"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {editingNorma ? "Editar Norma" : "Crear Nueva Norma"}
                </h2>

                <Form method="post" className="space-y-4" onSubmit={() => setEditingNorma(null)}>
                    <input type="hidden" name="action" value={editingNorma ? "update-norma" : "create-norma"} />
                    {editingNorma && <input type="hidden" name="id" value={editingNorma.id} />}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tipo de Norma
                            </label>
                            <select
                                name="tipo"
                                required
                                defaultValue={editingNorma?.tipo}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500"
                            >
                                <option value="Principal">Principal</option>
                                <option value="Complementaria">Complementaria</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Año
                            </label>
                            <input
                                type="number"
                                name="anio"
                                min="1800"
                                max="2100"
                                defaultValue={editingNorma?.anio}
                                placeholder="2024"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nombre de la Norma
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            required
                            defaultValue={editingNorma?.nombre}
                            placeholder="ej: Código Civil Colombiano"
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
                            defaultValue={editingNorma?.descripcion}
                            placeholder="Descripción de la norma..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500"
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700"
                        >
                            {editingNorma ? "Actualizar Norma" : "Crear Norma"}
                        </button>
                        {editingNorma && (
                            <button
                                type="button"
                                onClick={() => setEditingNorma(null)}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </Form>
            </div>

            {/* Lista de Normas */}
            <div className="bg-white shadow-xl rounded-2xl p-8 border-2 border-purple-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Normas Existentes ({normas.length})
                </h2>

                <div className="space-y-4">
                    {normas.map((norma) => (
                        <div
                            key={norma.id}
                            className="p-4 border-2 border-gray-200 rounded-xl hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            norma.tipo === 'Principal' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {norma.tipo}
                                        </span>
                                        {norma.anio && (
                                            <span className="text-sm text-gray-500">
                                                {norma.anio}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">
                                        {norma.nombre}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {norma.descripcion}
                                    </p>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {norma._count?.normasSubareas || 0} asignaciones
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setEditingNorma(norma)}
                                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-200 transition-all"
                                >
                                    ✏️ Editar
                                </button>
                                <Form method="post" className="flex-1">
                                    <input type="hidden" name="action" value="delete-norma" />
                                    <input type="hidden" name="id" value={norma.id} />
                                    <button
                                        type="submit"
                                        onClick={(e) => {
                                            if (!confirm(`¿Eliminar "${norma.nombre}"?`)) {
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
            </div>
        </motion.div>
    );
}
