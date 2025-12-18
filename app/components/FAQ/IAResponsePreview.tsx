import { motion } from "framer-motion";
import { marked } from "marked";

interface IAResponsePreviewProps {
  respuestaIA: string | null;
  confianzaIA: number | null;
  procesada: boolean;
}

export default function IAResponsePreview({
  respuestaIA,
  confianzaIA,
  procesada,
}: IAResponsePreviewProps) {
  if (!procesada) {
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
        <p className="text-gray-600 text-center">
          Esta FAQ aún no ha sido procesada por la IA
        </p>
      </div>
    );
  }

  if (!respuestaIA) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <p className="text-red-700 text-center">
          ❌ Error al procesar con IA - Requiere respuesta manual
        </p>
      </div>
    );
  }

  const confianzaPorcentaje = confianzaIA ? Math.round(confianzaIA * 100) : 0;
  const confianzaColor = confianzaPorcentaje >= 75 
    ? "text-green-700 bg-green-100 border-green-300" 
    : confianzaPorcentaje >= 50
    ? "text-yellow-700 bg-yellow-100 border-yellow-300"
    : "text-orange-700 bg-orange-100 border-orange-300";

  const respuestaHTML = marked(respuestaIA);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header con Confianza */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          Respuesta Generada por IA
        </h3>

        <div className={`px-4 py-2 rounded-lg border-2 ${confianzaColor}`}>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold">
              Confianza: {confianzaPorcentaje}%
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Confianza */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confianzaPorcentaje}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-2 rounded-full ${
            confianzaPorcentaje >= 75 
              ? "bg-green-500" 
              : confianzaPorcentaje >= 50
              ? "bg-yellow-500"
              : "bg-orange-500"
          }`}
        />
      </div>

      {/* Respuesta con Markdown */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: respuestaHTML }}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        />
      </div>

      {/* Recomendación */}
      {confianzaPorcentaje < 75 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-900">
            <strong>⚠️ Recomendación:</strong> La confianza de la IA es menor al 75%. 
            Se recomienda revisar y editar la respuesta antes de publicar.
          </p>
        </div>
      )}
    </motion.div>
  );
}
