import { Form, useNavigation } from "@remix-run/react";
import { motion } from "framer-motion";
import { useState } from "react";

const CATEGORIAS_FAQ = [
  { id: 'civil', nombre: 'Derecho Civil', icono: '📜' },
  { id: 'laboral', nombre: 'Derecho Laboral', icono: '💼' },
  { id: 'penal', nombre: 'Derecho Penal', icono: '⚖️' },
  { id: 'familia', nombre: 'Derecho de Familia', icono: '👨‍👩‍👧‍👦' },
  { id: 'contratos', nombre: 'Contratos', icono: '📝' },
  { id: 'propiedad', nombre: 'Propiedad e Inmuebles', icono: '🏠' },
  { id: 'comercial', nombre: 'Derecho Comercial', icono: '🏢' },
  { id: 'tributario', nombre: 'Derecho Tributario', icono: '💰' },
  { id: 'consumidor', nombre: 'Derechos del Consumidor', icono: '🛒' },
  { id: 'otros', nombre: 'Otros', icono: '📋' },
] as const;

interface FAQFormProps {
  onClose?: () => void;
  actionData?: any;
}

export default function FAQForm({ onClose, actionData }: FAQFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [pregunta, setPregunta] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  const maxLength = 500;
  const minLength = 10;
  const charsRemaining = maxLength - pregunta.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100"
    >
      <div className="mb-6">
        <h3 
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Hacer una pregunta
        </h3>
        <p className="text-gray-600 text-sm">
          Tu pregunta será revisada por nuestro equipo y respondida con inteligencia artificial. 
          Las respuestas más útiles se publicarán en nuestras FAQs.
        </p>
      </div>

      <Form method="post" className="space-y-6">
        <input type="hidden" name="action" value="submit-faq" />

        {/* Campo de Pregunta */}
        <div>
          <label 
            htmlFor="pregunta" 
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Tu pregunta legal *
          </label>
          <textarea
            id="pregunta"
            name="pregunta"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            required
            minLength={minLength}
            maxLength={maxLength}
            rows={6}
            disabled={isSubmitting}
            placeholder="Ejemplo: ¿Cuáles son mis derechos como inquilino si el propietario no repara averías graves?"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none disabled:opacity-50"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          />
          <div className="mt-2 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Mínimo {minLength} caracteres
            </p>
            <p className={`text-xs font-medium ${
              charsRemaining < 50 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {charsRemaining} caracteres restantes
            </p>
          </div>
          {actionData?.errors?.pregunta && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {actionData.errors.pregunta}
            </p>
          )}
        </div>

        {/* Selector de Categoría */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Categoría legal *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CATEGORIAS_FAQ.map((cat) => (
              <motion.label
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all
                  ${categoriaSeleccionada === cat.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="categoria"
                  value={cat.id}
                  checked={categoriaSeleccionada === cat.id}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="sr-only"
                />
                <span className="text-3xl mb-2">{cat.icono}</span>
                <span className="text-xs font-medium text-center text-gray-700">
                  {cat.nombre}
                </span>
                {categoriaSeleccionada === cat.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center"
                  >
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.label>
            ))}
          </div>
          {actionData?.errors?.categoria && (
            <p className="mt-2 text-sm text-red-600">
              {actionData.errors.categoria}
            </p>
          )}
        </div>

        {/* Información de Contacto (Opcional) */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Información de contacto (opcional)
          </p>
          <p className="text-xs text-gray-600 mb-4">
            Si deseas que te notifiquemos cuando tu pregunta sea respondida
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-xs font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                disabled={isSubmitting}
                placeholder="Tu nombre"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                disabled={isSubmitting}
                placeholder="tu@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <motion.button
            type="submit"
            disabled={isSubmitting || pregunta.length < minLength || !categoriaSeleccionada}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              '✉️ Enviar pregunta'
            )}
          </motion.button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Cancelar
            </button>
          )}
        </div>
      </Form>
    </motion.div>
  );
}
