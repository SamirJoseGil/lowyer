import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { motion } from "framer-motion";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin, isAdmin } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user) && !isAdmin(user)) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const url = new URL(request.url);
  const categoria = url.searchParams.get("categoria");
  const estado = url.searchParams.get("estado");
  const busqueda = url.searchParams.get("q");

  const whereClause: any = {};

  if (categoria) whereClause.categoria = categoria;
  if (estado) whereClause.estado = estado;
  if (busqueda) {
    whereClause.OR = [
      { pregunta: { contains: busqueda, mode: "insensitive" } },
      { respuesta: { contains: busqueda, mode: "insensitive" } },
    ];
  }

  const faqs = await db.fAQ.findMany({
    where: whereClause,
    orderBy: [
      { publicada: "desc" },
      { relevancia: "desc" },
      { vistas: "desc" },
    ],
    include: {
      revisor: {
        include: {
          profile: true,
        },
      },
    },
  });

  const categorias = await db.fAQ.groupBy({
    by: ["categoria"],
    _count: true,
  });

  return json({ faqs, categorias });
};

export default function TodasLasFAQs() {
  const { faqs, categorias } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoriaActual = searchParams.get("categoria");
  const estadoActual = searchParams.get("estado");
  const busquedaActual = searchParams.get("q") || "";

  const getEstadoBadge = (estado: string) => {
    const badges = {
      pendiente: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", text: "Pendiente" },
      revisada: { color: "bg-blue-100 text-blue-700 border-blue-200", text: "Revisada" },
      publicada: { color: "bg-green-100 text-green-700 border-green-200", text: "Publicada" },
      rechazada: { color: "bg-red-100 text-red-700 border-red-200", text: "Rechazada" },
    };
    return badges[estado as keyof typeof badges] || badges.pendiente;
  };

  const handleFiltro = (tipo: string, valor: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (valor) {
      params.set(tipo, valor);
    } else {
      params.delete(tipo);
    }
    setSearchParams(params);
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
        Todas las FAQs
      </h2>

      {/* Filtros */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                value={busquedaActual}
                onChange={(e) => handleFiltro("q", e.target.value || null)}
                placeholder="Buscar en preguntas..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={estadoActual || ""}
              onChange={(e) => handleFiltro("estado", e.target.value || null)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="revisada">Revisadas</option>
              <option value="publicada">Publicadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
          </div>

          {/* Filtro por Categoría */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={categoriaActual || ""}
              onChange={(e) => handleFiltro("categoria", e.target.value || null)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.categoria} value={cat.categoria}>
                  {cat.categoria} ({cat._count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filtros */}
        {(categoriaActual || estadoActual || busquedaActual) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setSearchParams({})}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de FAQs */}
      {faqs.length === 0 ? (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center">
          <svg className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No se encontraron FAQs
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Mostrando {faqs.length} FAQ{faqs.length !== 1 ? 's' : ''}
          </div>

          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border-2 border-gray-100 hover:border-blue-300 rounded-2xl p-6 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getEstadoBadge(faq.estado).color}`}>
                      {getEstadoBadge(faq.estado).text}
                    </span>

                    {faq.publicada && (
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 border border-green-200 flex items-center">
                        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Pública
                      </span>
                    )}

                    {faq.procesadaPorIA && (
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 flex items-center">
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        IA
                      </span>
                    )}

                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      {faq.categoria}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {faq.pregunta}
                  </h3>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {faq.vistas} vistas
                    </span>

                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      {faq.votosUtiles} útiles
                    </span>

                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Relevancia: {faq.relevancia}
                    </span>
                  </div>

                  {faq.revisor && (
                    <p className="text-xs text-gray-500">
                      Revisada por: {faq.revisor.profile?.firstName} {faq.revisor.profile?.lastName}
                    </p>
                  )}
                </div>

                <Link
                  to={`/admin/faq/${faq.id}/editar`}
                  className="ml-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
