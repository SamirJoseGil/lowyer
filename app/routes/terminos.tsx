import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => {
  return [
    { title: "Términos de Servicio - Lawyer Platform" },
    { name: "description", content: "Términos y condiciones de uso de la plataforma Lawyer" },
  ];
};

export default function Terminos() {
  const lastUpdated = "4 de Diciembre de 2024";
  const version = "1.0.0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-blue-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4 transition-colors"
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
            Términos de Servicio
          </motion.h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mb-4"
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
          className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100"
        >
          {/* Introducción */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              1. Introducción
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bienvenido a <strong>Lawyer Platform</strong>. Estos Términos de Servicio ("Términos") rigen su acceso y uso de nuestra plataforma web,
              incluyendo cualquier contenido, funcionalidad y servicios ofrecidos.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Al acceder o usar nuestros servicios, usted acepta estar sujeto a estos Términos. Si no está de acuerdo con alguna parte de estos términos,
              no debe usar nuestra plataforma.
            </p>
          </section>

          {/* Servicios */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              2. Descripción de Servicios
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Lawyer Platform ofrece:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Asistente legal con inteligencia artificial especializado en derecho colombiano</li>
              <li>Conexión con abogados certificados para consultas legales</li>
              <li>Sistema de licencias por horas de consulta</li>
              <li>Trial gratuito de 2 horas para nuevos usuarios</li>
              <li>Chat en tiempo real con profesionales del derecho</li>
            </ul>
          </section>

          {/* Disclaimer Legal */}
          <section className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-xl">
            <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              3. Disclaimer Legal Importante
            </h2>
            <p className="text-red-900 leading-relaxed font-medium">
              <strong>ESTA PLATAFORMA NO PROPORCIONA ASESORÍA LEGAL FORMAL.</strong> La información proporcionada por el asistente de IA es de carácter
              general e informativo. Para casos específicos, es OBLIGATORIO consultar con un abogado colegiado que pueda analizar los detalles particulares
              de su situación.
            </p>
          </section>

          {/* Cuenta de Usuario */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              4. Cuenta de Usuario
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para utilizar nuestros servicios, debe crear una cuenta proporcionando información precisa y completa. Usted es responsable de:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mantener la confidencialidad de su contraseña</li>
              <li>Todas las actividades que ocurran bajo su cuenta</li>
              <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
              <li>Proporcionar información verídica y actualizada</li>
            </ul>
          </section>

          {/* Licencias */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              5. Sistema de Licencias
            </h2>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">5.1 Trial Gratuito</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Los nuevos usuarios reciben <strong>2 horas gratuitas</strong> válidas por 7 días. El trial:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Se asigna automáticamente al registrarse</li>
              <li>Puede reclamarse manualmente si la asignación automática falla</li>
              <li>Solo puede ser utilizado UNA VEZ por usuario</li>
              <li>No requiere tarjeta de crédito</li>
              <li>Expira después de 7 días o al agotar las horas</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">5.2 Licencias de Pago</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Las licencias de pago incluyen:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Horas específicas según el plan adquirido</li>
              <li>Validez temporal según el tipo de licencia</li>
              <li>Acceso a chat con IA y/o abogados según el plan</li>
              <li>Las horas no utilizadas expiran con la licencia</li>
            </ul>
          </section>

          {/* Uso Aceptable */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              6. Uso Aceptable
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Usted se compromete a NO:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Usar la plataforma para actividades ilegales o no autorizadas</li>
              <li>Enviar contenido ofensivo, discriminatorio o inapropiado</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Interferir con el funcionamiento de la plataforma</li>
              <li>Hacer ingeniería inversa o copiar el software</li>
              <li>Compartir información confidencial de otros usuarios</li>
            </ul>
          </section>

          {/* Propiedad Intelectual */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              7. Propiedad Intelectual
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Todo el contenido, características y funcionalidad de la plataforma son propiedad exclusiva de Lawyer Platform. Esto incluye,
              pero no se limita a, texto, gráficos, logos, iconos, imágenes, clips de audio, descargas digitales y compilaciones de datos.
            </p>
          </section>

          {/* Limitación de Responsabilidad */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              8. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Lawyer Platform NO será responsable por:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Decisiones legales tomadas basándose en información de la IA</li>
              <li>Daños indirectos, incidentales o consecuentes</li>
              <li>Pérdida de datos o interrupción del servicio</li>
              <li>Acciones u omisiones de abogados terceros</li>
              <li>Resultados de procesos legales iniciados por el usuario</li>
            </ul>
          </section>

          {/* Modificaciones */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              9. Modificaciones
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente
              después de su publicación. Su uso continuado de la plataforma después de cualquier cambio constituye su aceptación de los nuevos términos.
            </p>
          </section>

          {/* Contacto */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              10. Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para preguntas sobre estos Términos de Servicio, puede contactarnos en:
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-700">
                <strong>Email:</strong> <a href="mailto:legal@lawyer.com" className="text-blue-600 hover:underline">legal@lawyer.com</a>
              </p>
              <p className="text-gray-700">
                <strong>Teléfono:</strong> +57 300 123 4567
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Al usar Lawyer Platform, usted reconoce haber leído, entendido y aceptado estos Términos de Servicio.
            </p>
          </div>
        </motion.div>

        {/* Link a Privacidad */}
        <div className="mt-8 text-center">
          <Link
            to="/privacidad"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
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
