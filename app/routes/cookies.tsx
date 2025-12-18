import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => {
  return [
    { title: "Política de Cookies - Lawyer Platform" },
    { name: "description", content: "Información sobre el uso de cookies en Lawyer Platform" },
  ];
};

export default function Cookies() {
  const lastUpdated = "4 de Diciembre de 2024";
  const version = "1.0.0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-amber-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-amber-600 hover:text-amber-800 mb-4 transition-colors"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver al inicio
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Política de Cookies
          </motion.h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 mb-4"
          />

          <p className="text-gray-600">
            Última actualización: <span className="font-semibold">{lastUpdated}</span> • Versión {version}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 border-2 border-amber-100"
        >
          {/* Introducción */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              ¿Qué son las Cookies?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tablet o móvil) cuando 
              visita un sitio web. Nos ayudan a mejorar su experiencia y a entender cómo usa nuestra plataforma.
            </p>
          </section>

          {/* Tipos de Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Tipos de Cookies que Utilizamos
            </h2>

            {/* Cookies Esenciales */}
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                1. Cookies Esenciales (Obligatorias)
              </h3>
              <p className="text-green-900 mb-3">
                Estas cookies son necesarias para el funcionamiento básico de la plataforma y no se pueden desactivar.
              </p>
              <ul className="list-disc list-inside text-green-900 space-y-1 ml-4">
                <li><strong>__session</strong>: Mantiene su sesión activa cuando inicia sesión</li>
                <li><strong>csrf_token</strong>: Protege contra ataques de falsificación de peticiones</li>
                <li>Duración: Sesión o 30 días (si marca "Recordarme")</li>
              </ul>
            </div>

            {/* Cookies Funcionales */}
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                </svg>
                2. Cookies de Preferencias (Opcionales)
              </h3>
              <p className="text-blue-900 mb-3">
                Recuerdan sus preferencias y configuraciones para mejorar su experiencia.
              </p>
              <ul className="list-disc list-inside text-blue-900 space-y-1 ml-4">
                <li><strong>theme_preference</strong>: Guarda su preferencia de tema (claro/oscuro)</li>
                <li><strong>language</strong>: Idioma seleccionado</li>
                <li><strong>notification_prefs</strong>: Configuración de notificaciones</li>
                <li>Duración: 1 año</li>
              </ul>
            </div>

            {/* Cookies de Análisis */}
            <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
              <h3 className="text-lg font-semibold text-purple-900 mb-2 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                3. Cookies de Análisis (Opcionales)
              </h3>
              <p className="text-purple-900 mb-3">
                Nos ayudan a entender cómo usa la plataforma para mejorarla.
              </p>
              <ul className="list-disc list-inside text-purple-900 space-y-1 ml-4">
                <li><strong>_ga</strong>: Google Analytics - Identifica usuarios únicos</li>
                <li><strong>_gid</strong>: Google Analytics - Diferencia sesiones</li>
                <li><strong>analytics_session</strong>: Tracking de sesión interna</li>
                <li>Duración: 2 años (Google Analytics), 30 días (internas)</li>
              </ul>
            </div>
          </section>

          {/* Control de Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Control de Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Puede controlar y/o eliminar las cookies según desee. Tiene las siguientes opciones:
            </p>

            <div className="space-y-3">
              <div className="flex items-start">
                <svg className="h-6 w-6 text-amber-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Banner de Cookies</p>
                  <p className="text-gray-700 text-sm">
                    Al visitar por primera vez, le mostraremos un banner donde puede aceptar o rechazar cookies no esenciales.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="h-6 w-6 text-amber-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Configuración del Navegador</p>
                  <p className="text-gray-700 text-sm">
                    La mayoría de navegadores permiten controlar cookies desde sus configuraciones. Puede eliminar cookies existentes 
                    y bloquear todas o algunas cookies.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="h-6 w-6 text-amber-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Preferencias en la Plataforma</p>
                  <p className="text-gray-700 text-sm">
                    Usuarios registrados pueden gestionar preferencias de cookies desde su panel de configuración.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Enlaces a Navegadores */}
          <section className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3">
              Cómo Configurar Cookies en su Navegador:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  → Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  → Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  → Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  → Microsoft Edge
                </a>
              </li>
            </ul>
          </section>

          {/* Consecuencias */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Consecuencias de Desactivar Cookies
            </h2>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-900 mb-3">
                <strong>⚠️ Importante:</strong> Si bloquea o elimina cookies:
              </p>
              <ul className="list-disc list-inside text-yellow-900 space-y-2 ml-4">
                <li>No podrá mantener su sesión iniciada (cookies esenciales)</li>
                <li>Deberá aceptar cookies cada vez que visite el sitio</li>
                <li>Algunas funcionalidades pueden no trabajar correctamente</li>
                <li>Perderá preferencias guardadas</li>
              </ul>
            </div>
          </section>

          {/* Actualizaciones */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Actualización de esta Política
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta Política de Cookies ocasionalmente. Le notificaremos sobre cambios significativos 
              mediante un aviso en la plataforma. Le recomendamos revisar esta página periódicamente.
            </p>
          </section>

          {/* Contacto */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si tiene preguntas sobre nuestra Política de Cookies:
            </p>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-gray-700">
                <strong>Email:</strong> <a href="mailto:privacidad@lawyer.com" className="text-amber-600 hover:underline">privacidad@lawyer.com</a>
              </p>
              <p className="text-gray-700">
                <strong>Teléfono:</strong> +57 300 123 4567
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Esta política de cookies complementa nuestra Política de Privacidad y Términos de Servicio.
            </p>
          </div>
        </motion.div>

        {/* Links a otras políticas */}
        <div className="mt-8 flex justify-center gap-4 text-center">
          <Link
            to="/terminos"
            className="inline-flex items-center text-amber-600 hover:text-amber-800 font-medium transition-colors"
          >
            Ver Términos de Servicio
            <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          
          <Link
            to="/privacidad"
            className="inline-flex items-center text-amber-600 hover:text-amber-800 font-medium transition-colors"
          >
            Ver Política de Privacidad
            <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
