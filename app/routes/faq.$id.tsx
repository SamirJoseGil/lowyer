import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, Form, useNavigation } from "@remix-run/react";
import { motion } from "framer-motion";
import { marked } from "marked";
import { getFAQById, incrementFAQViews, getRelatedFAQs, voteFAQ, hasUserVoted } from "~/lib/faq/faq.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.faq) {
    return [{ title: "FAQ no encontrada - Lawyer Platform" }];
  }

  return [
    { title: `${data.faq.pregunta} - FAQ - Lawyer Platform` },
    { name: "description", content: data.faq.respuesta?.substring(0, 160) || "" },
  ];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { id } = params;

  if (!id) {
    throw new Response("ID no proporcionado", { status: 400 });
  }

  const faq = await getFAQById(id);

  if (!faq || !faq.publicada) {
    throw new Response("FAQ no encontrada", { status: 404 });
  }

  // Incrementar contador de vistas
  await incrementFAQViews(id);

  // Obtener FAQs relacionadas
  const relacionadas = await getRelatedFAQs(id, faq.categoria);

  // Verificar si el usuario ya votó
  const ipAddress = request.headers.get("x-forwarded-for") || 
                   request.headers.get("x-real-ip") || 
                   "unknown";
  const userVote = await hasUserVoted(id, ipAddress);

  return json({ faq, relacionadas, userVote });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { id } = params;
  
  if (!id) {
    return json({ error: "ID no proporcionado" }, { status: 400 });
  }

  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "vote") {
    const util = formData.get("util") === "true";
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    const result = await voteFAQ(id, ipAddress, util);

    if (result.success) {
      return json({ success: true, message: "¡Gracias por tu feedback!" });
    } else {
      return json({ success: false, error: result.error }, { status: 500 });
    }
  }

  return json({ error: "Acción no válida" }, { status: 400 });
};

export default function FAQDetail() {
  const { faq, relacionadas, userVote } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isVoting = navigation.state === "submitting";

  const respuestaHTML = faq.respuesta ? marked(faq.respuesta) : "";

  const CATEGORIA_COLORS: Record<string, string> = {
    civil: 'text-blue-700 bg-blue-100 border-blue-200',
    laboral: 'text-purple-700 bg-purple-100 border-purple-200',
    penal: 'text-red-700 bg-red-100 border-red-200',
    familia: 'text-pink-700 bg-pink-100 border-pink-200',
    contratos: 'text-green-700 bg-green-100 border-green-200',
    propiedad: 'text-yellow-700 bg-yellow-100 border-yellow-200',
    comercial: 'text-indigo-700 bg-indigo-100 border-indigo-200',
    tributario: 'text-orange-700 bg-orange-100 border-orange-200',
    consumidor: 'text-cyan-700 bg-cyan-100 border-cyan-200',
    otros: 'text-gray-700 bg-gray-100 border-gray-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center text-sm text-gray-600"
        >
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Inicio
          </Link>
          <svg className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/faq" className="hover:text-blue-600 transition-colors">
            FAQs
          </Link>
          <svg className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">Pregunta</span>
        </motion.nav>

        {/* Contenido Principal */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100 mb-8"
        >
          {/* Header */}
          <header className="mb-8 pb-8 border-b-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className={`
                inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border-2
                ${CATEGORIA_COLORS[faq.categoria] || CATEGORIA_COLORS.otros}
              `}>
                {faq.categoria.charAt(0).toUpperCase() + faq.categoria.slice(1)}
              </span>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {faq.vistas} vistas
                </span>
                <span className="flex items-center">
                  <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  {faq.votosUtiles} útiles
                </span>
              </div>
            </div>

            <h1 
              className="text-3xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {faq.pregunta}
            </h1>

            <div className="flex items-center text-sm text-gray-600">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Publicada el {new Date(faq.publicadaAt || faq.createdAt).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </header>

          {/* Respuesta */}
          <div 
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: respuestaHTML }}
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          />

          {/* Sistema de Votos */}
          <div className="mt-8 pt-8 border-t-2 border-gray-100">
            <p className="text-lg font-semibold text-gray-900 mb-4">
              ¿Te resultó útil esta respuesta?
            </p>

            {userVote === null ? (
              <div className="flex gap-4">
                <Form method="post">
                  <input type="hidden" name="action" value="vote" />
                  <input type="hidden" name="util" value="true" />
                  <motion.button
                    type="submit"
                    disabled={isVoting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    Sí, me ayudó
                  </motion.button>
                </Form>

                <Form method="post">
                  <input type="hidden" name="action" value="vote" />
                  <input type="hidden" name="util" value="false" />
                  <motion.button
                    type="submit"
                    disabled={isVoting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                    </svg>
                    No, no me ayudó
                  </motion.button>
                </Form>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">
                  Gracias por tu feedback. Ya votaste esta FAQ como {userVote ? "útil" : "no útil"}.
                </span>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ¿No resolvió tu duda?
            </h3>
            <p className="text-gray-700 mb-4">
              Habla directamente con nuestros abogados especialistas o con nuestro asistente legal con IA.
            </p>
            <Link
              to="/chat"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Iniciar consulta
              <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </motion.article>

        {/* FAQs Relacionadas */}
        {relacionadas.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 
              className="text-2xl font-bold text-gray-900 mb-6"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Preguntas relacionadas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relacionadas.map((related) => (
                <Link
                  key={related.id}
                  to={`/faq/${related.id}`}
                  className="block bg-white p-6 rounded-xl shadow-md border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {related.pregunta}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {related.respuesta?.substring(0, 100)}...
                  </p>
                  <div className="mt-4 flex items-center text-xs text-gray-500">
                    <span>{related.vistas} vistas</span>
                    <span className="mx-2">•</span>
                    <span>{related.votosUtiles} útiles</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
