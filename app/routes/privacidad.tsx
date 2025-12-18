import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => {
  return [
    { title: "Política de Privacidad - Lawyer Platform" },
    { name: "description", content: "Política de privacidad y protección de datos de Lawyer Platform" },
  ];
};

export default function Privacidad() {
  const lastUpdated = "4 de Diciembre de 2024";
  const version = "1.0.0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-purple-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 mb-4 transition-colors"
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
            Política de Privacidad
          </motion.h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 mb-4"
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
          className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100"
        >
          {/* Introducción */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              1. Introducción
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              En <strong>Lawyer Platform</strong>, nos comprometemos a proteger su privacidad y sus datos personales. Esta Política de Privacidad
              explica qué información recopilamos, cómo la usamos, compartimos y protegemos.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Cumplimos con las regulaciones de protección de datos aplicables en Colombia, incluyendo la Ley 1581 de 2012 (Habeas Data) y el RGPD
              cuando sea aplicable.
            </p>
          </section>

          {/* Información que Recopilamos */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              2. Información que Recopilamos
            </h2>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Información que Usted Proporciona</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li><strong>Datos de registro:</strong> Email, contraseña (encriptada)</li>
              <li><strong>Perfil:</strong> Nombre, apellido, número de documento, teléfono, dirección</li>
              <li><strong>Consultas legales:</strong> Contenido de sus mensajes y conversaciones</li>
              <li><strong>Información de pago:</strong> Datos de transacciones (no almacenamos tarjetas)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Información Recopilada Automáticamente</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Logs de uso:</strong> Páginas visitadas, tiempo de sesión, acciones realizadas</li>
              <li><strong>Información técnica:</strong> Dirección IP, navegador, dispositivo, sistema operativo</li>
              <li><strong>Cookies:</strong> Para mantener su sesión y mejorar la experiencia</li>
            </ul>
          </section>

          {/* Cómo Usamos su Información */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              3. Cómo Usamos su Información
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos sus datos personales para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Proporcionar y mantener nuestros servicios</li>
              <li>Procesar sus consultas legales con IA y abogados</li>
              <li>Gestionar su cuenta y licencias</li>
              <li>Procesar pagos y generar facturas</li>
              <li>Enviar notificaciones importantes sobre su cuenta</li>
              <li>Mejorar nuestros servicios mediante análisis de uso</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Prevenir fraude y garantizar seguridad</li>
            </ul>
          </section>

          {/* Base Legal */}
          <section className="mb-8 p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">
              4. Base Legal para el Procesamiento
            </h2>
            <p className="text-purple-900 leading-relaxed mb-4">
              Procesamos sus datos personales bajo las siguientes bases legales:
            </p>
            <ul className="list-disc list-inside text-purple-900 space-y-2 ml-4">
              <li><strong>Consentimiento:</strong> Al aceptar estos términos y crear una cuenta</li>
              <li><strong>Ejecución de contrato:</strong> Para proporcionar los servicios solicitados</li>
              <li><strong>Obligación legal:</strong> Para cumplir con normativas aplicables</li>
              <li><strong>Interés legítimo:</strong> Para mejorar servicios y prevenir fraude</li>
            </ul>
          </section>

          {/* Compartir Información */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              5. Cómo Compartimos su Información
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos compartir sus datos con:
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">5.1 Abogados Verificados</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cuando solicita una consulta con un abogado, compartimos información necesaria para atender su caso (nombre, consulta).
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">5.2 Proveedores de Servicios</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li><strong>Supabase:</strong> Almacenamiento de base de datos</li>
              <li><strong>Google (Gemini AI):</strong> Procesamiento de consultas de IA</li>
              <li><strong>Wompi:</strong> Procesamiento de pagos</li>
              <li><strong>Vercel:</strong> Hosting de la plataforma</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">5.3 Autoridades</h3>
            <p className="text-gray-700 leading-relaxed">
              Podemos divulgar información si es requerido por ley o para proteger derechos legales.
            </p>
          </section>

          {/* Seguridad */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              6. Seguridad de los Datos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encriptación de contraseñas con bcrypt</li>
              <li>Conexiones HTTPS (SSL/TLS)</li>
              <li>Autenticación de dos factores (próximamente)</li>
              <li>Backups regulares y seguros</li>
              <li>Acceso restringido a datos personales</li>
              <li>Auditorías de seguridad periódicas</li>
            </ul>
          </section>

          {/* Retención de Datos */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              7. Retención de Datos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conservamos sus datos personales mientras:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Su cuenta esté activa</li>
              <li>Sea necesario para proporcionar servicios</li>
              <li>Sea requerido por obligaciones legales (ej: facturación por 5 años)</li>
              <li>Logs de auditoría: 90 días</li>
              <li>Conversaciones: Indefinidamente salvo solicitud de eliminación</li>
            </ul>
          </section>

          {/* Derechos del Usuario */}
          <section className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
            <h2 className="text-2xl font-bold text-green-900 mb-4">
              8. Sus Derechos (Habeas Data)
            </h2>
            <p className="text-green-900 leading-relaxed mb-4">
              Usted tiene derecho a:
            </p>
            <ul className="list-disc list-inside text-green-900 space-y-2 ml-4">
              <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos (derecho al olvido)</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
              <li><strong>Oposición:</strong> Objetar el procesamiento de sus datos</li>
              <li><strong>Restricción:</strong> Limitar cómo procesamos sus datos</li>
            </ul>
            <p className="text-green-900 mt-4">
              Para ejercer estos derechos, contáctenos en: <a href="mailto:privacidad@lawyer.com" className="underline font-semibold">privacidad@lawyer.com</a>
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              9. Cookies y Tecnologías Similares
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos cookies para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Cookies esenciales:</strong> Mantener su sesión activa</li>
              <li><strong>Cookies de análisis:</strong> Entender cómo usa la plataforma</li>
              <li><strong>Cookies de preferencias:</strong> Recordar sus configuraciones</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Puede gestionar cookies desde su navegador, pero esto puede afectar funcionalidades de la plataforma.
            </p>
          </section>

          {/* Transferencias Internacionales */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              10. Transferencias Internacionales
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Sus datos pueden ser transferidos y procesados en servidores ubicados fuera de Colombia (ej: Google Cloud, AWS).
              Garantizamos que estas transferencias cumplen con estándares adecuados de protección mediante cláusulas contractuales estándar.
            </p>
          </section>

          {/* Menores de Edad */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              11. Menores de Edad
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos intencionalmente datos de menores.
              Si descubrimos que hemos recopilado datos de un menor, los eliminaremos inmediatamente.
            </p>
          </section>

          {/* Cambios */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              12. Cambios a esta Política
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta política periódicamente. Le notificaremos sobre cambios significativos mediante email o aviso en la plataforma.
              La fecha de "Última actualización" al inicio indica cuándo fue modificada por última vez.
            </p>
          </section>

          {/* Contacto */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              13. Contacto - Oficial de Protección de Datos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para consultas sobre privacidad o ejercer sus derechos:
            </p>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-gray-700">
                <strong>Email:</strong> <a href="mailto:privacidad@lawyer.com" className="text-purple-600 hover:underline">privacidad@lawyer.com</a>
              </p>
              <p className="text-gray-700">
                <strong>Oficial de Protección de Datos:</strong> María Rodríguez
              </p>
              <p className="text-gray-700">
                <strong>Dirección:</strong> Calle 123 #45-67, Bogotá, Colombia
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Al usar Lawyer Platform, usted acepta esta Política de Privacidad y el procesamiento de sus datos personales como se describe aquí.
            </p>
          </div>
        </motion.div>

        {/* Link a Términos */}
        <div className="mt-8 text-center space-x-4">
          <Link
            to="/terminos"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            Ver Términos de Servicio
            <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          
          <Link
            to="/cookies"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Política de Cookies
            <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
