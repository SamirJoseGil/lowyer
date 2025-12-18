import { Link } from "@remix-run/react";
import { motion } from "framer-motion";

interface FAQCardProps {
  faq: {
    id: string;
    pregunta: string;
    respuesta: string | null;
    categoria: string;
    vistas: number;
    votosUtiles: number;
    createdAt: Date;
  };
}

const CATEGORIA_ICONS: Record<string, string> = {
  civil: '📜',
  laboral: '💼',
  penal: '⚖️',
  familia: '👨‍👩‍👧‍👦',
  contratos: '📝',
  propiedad: '🏠',
  comercial: '🏢',
  tributario: '💰',
  consumidor: '🛒',
  otros: '📋',
};

const CATEGORIA_COLORS: Record<string, string> = {
  civil: 'bg-blue-100 text-blue-700 border-blue-200',
  laboral: 'bg-purple-100 text-purple-700 border-purple-200',
  penal: 'bg-red-100 text-red-700 border-red-200',
  familia: 'bg-pink-100 text-pink-700 border-pink-200',
  contratos: 'bg-green-100 text-green-700 border-green-200',
  propiedad: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  comercial: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  tributario: 'bg-orange-100 text-orange-700 border-orange-200',
  consumidor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  otros: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function FAQCard({ faq }: FAQCardProps) {
  const preview = faq.respuesta?.substring(0, 150) + (faq.respuesta && faq.respuesta.length > 150 ? '...' : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
      className="bg-white border-2 border-gray-100 rounded-2xl p-6 transition-all"
    >
      {/* Categoría Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`
          inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border
          ${CATEGORIA_COLORS[faq.categoria] || CATEGORIA_COLORS.otros}
        `}>
          <span className="mr-1">{CATEGORIA_ICONS[faq.categoria] || CATEGORIA_ICONS.otros}</span>
          {faq.categoria.charAt(0).toUpperCase() + faq.categoria.slice(1)}
        </span>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {faq.vistas}
          </span>
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {faq.votosUtiles}
          </span>
        </div>
      </div>

      {/* Pregunta */}
      <h3 
        className="text-lg font-bold text-gray-900 mb-3 line-clamp-2"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {faq.pregunta}
      </h3>

      {/* Preview de Respuesta */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        {preview}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          {new Date(faq.createdAt).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>

        <Link
          to={`/faq/${faq.id}`}
          className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Leer más
          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}
