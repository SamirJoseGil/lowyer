import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { marked } from "marked";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin, isAdmin } from "~/lib/permissions.server";
import { getFAQById, updateFAQ, publishFAQ } from "~/lib/faq/faq-admin.server";
import IAResponsePreview from "~/components/FAQ/IAResponsePreview";

const CATEGORIAS_FAQ = [
  { id: 'civil', nombre: 'Derecho Civil', icono: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { id: 'laboral', nombre: 'Derecho Laboral', icono: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  { id: 'penal', nombre: 'Derecho Penal', icono: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg> },
  { id: 'familia', nombre: 'Derecho de Familia', icono: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
  { id: 'contratos', nombre: 'Contratos', icono: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { id: 'propiedad', nombre: 'Propiedad e Inmuebles', icono: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { id: 'comercial', nombre: 'Derecho Comercial', icono: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
  { id: 'tributario', nombre: 'Derecho Tributario', icono: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { id: 'consumidor', nombre: 'Derechos del Consumidor', icono: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
  { id: 'otros', nombre: 'Otros', icono: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user) && !isAdmin(user)) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const { id } = params;
  if (!id) {
    throw new Response("ID no proporcionado", { status: 400 });
  }

  const faq = await getFAQById(id);

  if (!faq) {
    throw new Response("FAQ no encontrada", { status: 404 });
  }

  return json({ faq, user });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user) && !isAdmin(user)) {
    return json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return json({ error: "ID no proporcionado" }, { status: 400 });
  }

  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "guardar": {
        const respuesta = formData.get("respuesta") as string;
        const categoria = formData.get("categoria") as string;
        const relevancia = parseInt(formData.get("relevancia") as string) || 0;

        await updateFAQ(id, {
          respuesta,
          categoria,
          relevancia,
          estado: "revisada",
          revisadaPor: user.id,
        });

        return json({ success: true, message: "FAQ guardada exitosamente" });
      }

      case "publicar": {
        const respuesta = formData.get("respuesta") as string;
        const categoria = formData.get("categoria") as string;
        const relevancia = parseInt(formData.get("relevancia") as string) || 0;

        await updateFAQ(id, {
          respuesta,
          categoria,
          relevancia,
        });

        await publishFAQ(id, user.id);

        return redirect("/admin/faq/pendientes");
      }

      case "rechazar": {
        await updateFAQ(id, {
          estado: "rechazada",
          revisadaPor: user.id,
        });

        return redirect("/admin/faq/pendientes");
      }

      default:
        return json({ error: "Acción no válida" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error en acción de FAQ:", error);
    return json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
};

export default function EditarFAQ() {
  const { faq, user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [respuesta, setRespuesta] = useState(faq.respuesta || faq.respuestaIA || "");
  const [categoria, setCategoria] = useState(faq.categoria);
  const [relevancia, setRelevancia] = useState(faq.relevancia);
  const [preview, setPreview] = useState(false);

  const respuestaHTML = marked(respuesta);

  return (
    <>
      <div className="mb-6">
        <Link
          to="/admin/faq/pendientes"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a pendientes
        </Link>
      </div>

      <h2 
        className="text-2xl font-bold text-gray-900 mb-6"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        Editar FAQ
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna Izquierda - Editor */}
        <div className="space-y-6">
          {/* Pregunta Original */}
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Pregunta del Usuario
            </h2>
            <p className="text-lg text-gray-800 leading-relaxed" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              {faq.pregunta}
            </p>

            {faq.usuarioNombre && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Enviada por:</strong> {faq.usuarioNombre}
                  {faq.usuarioEmail && ` (${faq.usuarioEmail})`}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Fecha:</strong> {new Date(faq.createdAt).toLocaleDateString('es-CO')}
                </p>
              </div>
            )}
          </div>

          {/* Respuesta IA */}
          {faq.procesadaPorIA && (
            <IAResponsePreview
              respuestaIA={faq.respuestaIA}
              confianzaIA={faq.confianzaIA}
              procesada={faq.procesadaPorIA}
            />
          )}

          {/* Formulario de Edición */}
          <Form method="post" className="bg-white border-2 border-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Editar Respuesta
            </h2>

            {/* Tabs: Editar / Preview */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPreview(false)}
                className={`px-4 py-2 font-semibold rounded-lg transition-colors flex items-center ${
                  !preview
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              <button
                type="button"
                onClick={() => setPreview(true)}
                className={`px-4 py-2 font-semibold rounded-lg transition-colors flex items-center ${
                  preview
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
            </div>

            {!preview ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Respuesta (Markdown)
                </label>
                <textarea
                  name="respuesta"
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-mono text-sm"
                  placeholder="Escribe la respuesta en formato Markdown..."
                />
                <p className="mt-2 text-xs text-gray-500">
                  Puedes usar Markdown: **negrita**, *cursiva*, ## títulos, - listas, etc.
                </p>
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[500px]"
                dangerouslySetInnerHTML={{ __html: respuestaHTML }}
              />
            )}

            {/* Categoría */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Categoría
              </label>
              <select
                name="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                {CATEGORIAS_FAQ.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icono} {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Relevancia */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Relevancia: {relevancia}
              </label>
              <input
                type="range"
                name="relevancia"
                min="0"
                max="100"
                value={relevancia}
                onChange={(e) => setRelevancia(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Baja</span>
                <span>Media</span>
                <span>Alta</span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="submit"
                name="action"
                value="guardar"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Guardar Borrador
              </button>

              <button
                type="submit"
                name="action"
                value="publicar"
                disabled={isSubmitting || !respuesta}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Publicar
              </button>

              <button
                type="submit"
                name="action"
                value="rechazar"
                disabled={isSubmitting}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Rechazar
              </button>
            </div>
          </Form>
        </div>

        {/* Columna Derecha - Preview y Stats */}
        <div className="space-y-6">
          {/* Preview de Card Pública */}
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Vista Previa Pública
            </h2>
            
            <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
              <span className={`
                inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border mb-3
                ${categoria === 'civil' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  categoria === 'laboral' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                  categoria === 'penal' ? 'bg-red-100 text-red-700 border-red-200' :
                  'bg-gray-100 text-gray-700 border-gray-200'}
              `}>
                {CATEGORIAS_FAQ.find(c => c.id === categoria)?.icono} {
                  CATEGORIAS_FAQ.find(c => c.id === categoria)?.nombre
                }
              </span>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {faq.pregunta}
              </h3>

              <p className="text-sm text-gray-600 line-clamp-3">
                {respuesta.substring(0, 150)}...
              </p>

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                <span>0 vistas</span>
                <span>•</span>
                <span>0 útiles</span>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Estadísticas
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Estado actual</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  faq.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                  faq.estado === 'revisada' ? 'bg-blue-100 text-blue-700' :
                  faq.estado === 'publicada' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {faq.estado}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Vistas actuales</span>
                <span className="font-bold text-gray-900">{faq.vistas}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Votos útiles</span>
                <span className="font-bold text-gray-900">{faq.votosUtiles}</span>
              </div>

              {faq.confianzaIA && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Confianza IA</span>
                  <span className="font-bold text-purple-600">
                    {Math.round(faq.confianzaIA * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Guía de Markdown */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Guía Rápida de Markdown
            </h3>
            <div className="space-y-2 text-sm text-blue-800 font-mono">
              <p><strong>## Título</strong> - Subtítulo</p>
              <p><strong>**texto**</strong> - Negrita</p>
              <p><strong>*texto*</strong> - Cursiva</p>
              <p><strong>- item</strong> - Lista</p>
              <p><strong>[texto](url)</strong> - Link</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
