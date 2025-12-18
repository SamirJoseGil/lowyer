import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin, isAdmin } from "~/lib/permissions.server";
import { getFAQsPendientes } from "~/lib/faq/faq-admin.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user) && !isAdmin(user)) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const faqs = await getFAQsPendientes();

  return json({ faqs });
};

export default function AdminFAQPendientes() {
  const { faqs } = useLoaderData<typeof loader>();

  const getEstadoBadge = (estado: string) => {
    const badges = {
      pendiente: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", text: "Pendiente" },
      revisada: { color: "bg-blue-100 text-blue-700 border-blue-200", text: "Revisada" },
      publicada: { color: "bg-green-100 text-green-700 border-green-200", text: "Publicada" },
      rechazada: { color: "bg-red-100 text-red-700 border-red-200", text: "Rechazada" },
    };
    return badges[estado as keyof typeof badges] || badges.pendiente;
  };

  return (
    <>
      <div className="mb-6">
        <Link
          to="/admin/faq"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al dashboard
        </Link>
      </div>

      <h2 
        className="text-2xl font-bold text-gray-900 mb-6"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        Cola de FAQs Pendientes
      </h2>

      {faqs.length === 0 ? (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center">
          <svg className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¡Todo al día!
          </h3>
          <p className="text-gray-600">
            No hay FAQs pendientes de revisión
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border-2 border-gray-100 hover:border-blue-300 rounded-2xl p-6 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`
                      px-3 py-1 rounded-lg text-xs font-semibold border
                      ${getEstadoBadge(faq.estado).color}
                    `}>
                      {getEstadoBadge(faq.estado).text}
                    </span>

                    {faq.procesadaPorIA && (
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 flex items-center">
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Procesada por IA
                      </span>
                    )}

                    {faq.confianzaIA && (
                      <span className="text-xs text-gray-600">
                        Confianza: {Math.round(faq.confianzaIA * 100)}%
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {faq.pregunta}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {faq.categoria}
                    </span>

                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(faq.createdAt).toLocaleDateString('es-CO')}
                    </span>

                    {faq.usuarioNombre && (
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {faq.usuarioNombre}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/admin/faq/${faq.id}/editar`}
                  className="ml-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center"
                >
                  Revisar
                  <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {faq.respuestaIA && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Respuesta generada por IA:
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {faq.respuestaIA.substring(0, 200)}...
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
