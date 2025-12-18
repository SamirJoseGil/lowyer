import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import FAQCard from "~/components/FAQ/FAQCard";
import FAQForm from "~/components/FAQ/FAQForm";
import FAQSearch from "~/components/FAQ/FAQSearch";
import { getTopFAQs, submitFAQQuestion } from "~/lib/faq/faq.server";
import { buscarFAQs } from "~/lib/faq/faq-busqueda.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Preguntas Frecuentes - Lawyer Platform" },
    { name: "description", content: "Encuentra respuestas a las preguntas legales más frecuentes" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const categoria = url.searchParams.get("categoria") || undefined;
  const query = url.searchParams.get("q");

  let faqs;

  if (query) {
    // Búsqueda
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
    
    faqs = await buscarFAQs({ 
      query, 
      categoria, 
      limite: 20,
      ipAddress 
    });
  } else {
    // Top FAQs
    faqs = await getTopFAQs({ categoria, limit: 10 });
  }

  return json({ faqs, searchQuery: query });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "submit-faq") {
    const pregunta = formData.get("pregunta") as string;
    const categoria = formData.get("categoria") as string;
    const nombre = (formData.get("nombre") as string) || null;
    const email = (formData.get("email") as string) || null;

    if (!pregunta || pregunta.length < 10) {
      return json(
        { errors: { pregunta: "La pregunta debe tener al menos 10 caracteres" } },
        { status: 400 }
      );
    }

    if (pregunta.length > 500) {
      return json(
        { errors: { pregunta: "La pregunta no puede exceder 500 caracteres" } },
        { status: 400 }
      );
    }

    if (!categoria) {
      return json(
        { errors: { categoria: "Debes seleccionar una categoría" } },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    try {
      await submitFAQQuestion({
        pregunta,
        categoria,
        usuarioNombre: nombre,
        usuarioEmail: email,
        ipAddress,
      });

      return json({ 
        success: true, 
        message: "¡Gracias! Tu pregunta ha sido enviada y será respondida pronto." 
      });
    } catch (error) {
      console.error("Error submitting FAQ:", error);
      return json(
        { errors: { pregunta: "Error al enviar la pregunta. Intenta de nuevo." } },
        { status: 500 }
      );
    }
  }

  return json({ errors: { pregunta: "Acción no válida" } }, { status: 400 });
};

export default function FAQ() {
  const { faqs, searchQuery } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showForm, setShowForm] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);

  const categorias = [
    { id: null, nombre: 'Todas', icono: '📚' },
    { id: 'civil', nombre: 'Civil', icono: '📜' },
    { id: 'laboral', nombre: 'Laboral', icono: '💼' },
    { id: 'penal', nombre: 'Penal', icono: '⚖️' },
    { id: 'familia', nombre: 'Familia', icono: '👨‍👩‍👧‍👦' },
    { id: 'contratos', nombre: 'Contratos', icono: '📝' },
  ];

  const faqsFiltradas = categoriaFiltro 
    ? faqs.filter(faq => faq.categoria === categoriaFiltro)
    : faqs;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 
            className="text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Preguntas Frecuentes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encuentra respuestas a las dudas legales más comunes. Si no encuentras lo que buscas, 
            puedes hacer tu propia pregunta.
          </p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6"
          />
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {actionData?.success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 bg-green-50 border-2 border-green-200 rounded-xl"
            >
              <p className="text-green-800 font-medium flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {actionData.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA para hacer pregunta */}
        {!showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 text-center"
          >
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ¿Tienes una pregunta legal?
            </button>
          </motion.div>
        )}

        {/* Formulario */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12"
            >
              <FAQForm 
                onClose={() => setShowForm(false)}
                actionData={actionData}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buscador */}
        <div className="mb-8">
          <FAQSearch initialQuery={searchQuery || ""} categoria={categoriaFiltro || undefined} />
        </div>

        {/* Mensaje de búsqueda */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              {faqs.length > 0 ? (
                <>
                  Se encontraron <strong>{faqs.length}</strong> resultados para "<strong>{searchQuery}</strong>"
                </>
              ) : (
                <>No se encontraron resultados para "<strong>{searchQuery}</strong>"</>
              )}
            </p>
          </div>
        )}

        {/* Filtros por Categoría */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categorias.map((cat) => (
              <button
                key={cat.id || 'todas'}
                onClick={() => setCategoriaFiltro(cat.id)}
                className={`
                  px-6 py-2 rounded-xl font-semibold transition-all
                  ${categoriaFiltro === cat.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <span className="mr-2">{cat.icono}</span>
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de FAQs */}
        {faqsFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqsFiltradas.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <FAQCard faq={faq} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No hay FAQs en esta categoría
            </h3>
            <p className="text-gray-600">
              Intenta con otra categoría o haz tu propia pregunta
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
