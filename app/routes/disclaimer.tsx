import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => {
  return [
    { title: "Aviso Legal - Lawyer Platform" },
    { name: "description", content: "Aviso legal y disclaimer de servicios de Lawyer Platform" },
  ];
};

export default function Disclaimer() {
  const lastUpdated = "4 de Diciembre de 2024";
  const version = "1.0.0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-red-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-red-600 hover:text-red-800 mb-4 transition-colors"
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
            Aviso Legal
          </motion.h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-red-500 to-orange-500 mb-4"
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
          className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-100"
        >
          {/* Advertencia Principal */}
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-300 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="h-12 w-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-red-900 mb-3" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  ⚠️ ADVERTENCIA LEGAL IMPORTANTE
                </h2>
                <p className="text-red-900 font-semibold leading-relaxed mb-3">
                  La información proporcionada por Lawyer Platform, incluyendo las respuestas del asistente de inteligencia artificial, 
                  es de carácter <strong>GENERAL e INFORMATIVO únicamente</strong>.
                </p>
                <p className="text-red-900 font-semibold leading-relaxed">
                  <strong>NO CONSTITUYE ASESORÍA LEGAL PROFESIONAL</strong> y no debe ser utilizada como sustituto de la consulta 
                  con un abogado colegiado que pueda evaluar los detalles específicos de su situación.
                </p>
              </div>
            </div>
          </div>

          {/* Introducción */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              1. Naturaleza del Servicio
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Lawyer Platform es una <strong>plataforma tecnológica</strong> que facilita el acceso a información legal general y 
              conecta usuarios con abogados verificados. Nuestros servicios incluyen:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Asistente de IA Legal</strong>: Proporciona información general sobre derecho colombiano</li>
              <li><strong>Conexión con Abogados</strong>: Facilita el contacto con profesionales del derecho</li>
              <li><strong>Sistema de Licencias</strong>: Gestiona el acceso por horas a los servicios</li>
            </ul>
          </section>

          {/* Limitaciones del Servicio */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              2. Limitaciones del Servicio
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Asistente de IA</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              El asistente de inteligencia artificial <strong>NO es un abogado</strong> y:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
              <li>Proporciona información general sobre normativa legal colombiana</li>
              <li>No puede analizar casos específicos ni circunstancias particulares</li>
              <li>No puede dar opiniones legales vinculantes</li>
              <li>No sustituye la asesoría de un profesional del derecho</li>
              <li>Puede contener errores, omisiones o información desactualizada</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Chat con Abogados</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Los abogados disponibles en la plataforma:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Son profesionales independientes verificados</li>
              <li>Proporcionan orientación legal pero no representación formal</li>
              <li>No establecen una relación abogado-cliente formal a menos que se acuerde expresamente</li>
              <li>Su disponibilidad y respuestas están sujetas a su criterio profesional</li>
            </ul>
          </section>

          {/* No Relación Abogado-Cliente */}
          <section className="mb-8 p-6 bg-orange-50 border-2 border-orange-200 rounded-xl">
            <h2 className="text-2xl font-bold text-orange-900 mb-4 flex items-center">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              3. No Relación Abogado-Cliente
            </h2>
            <p className="text-orange-900 leading-relaxed font-medium">
              El uso de esta plataforma <strong>NO crea automáticamente</strong> una relación abogado-cliente. 
              Para establecer dicha relación profesional formal, se requiere:
            </p>
            <ul className="list-disc list-inside text-orange-900 space-y-2 ml-4 mt-3">
              <li>Acuerdo expreso entre el usuario y el abogado</li>
              <li>Contrato de prestación de servicios legales</li>
              <li>Definición clara del alcance de la representación</li>
              <li>Acuerdo de honorarios profesionales</li>
            </ul>
          </section>

          {/* Casos Específicos */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              4. Consulte un Abogado para Casos Específicos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>DEBE consultar con un abogado colegiado</strong> en las siguientes situaciones:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Situaciones Urgentes</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Procesos judiciales activos</li>
                  <li>• Órdenes de captura</li>
                  <li>• Audiencias próximas</li>
                  <li>• Términos legales por vencer</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Casos Complejos</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Disputas patrimoniales</li>
                  <li>• Casos penales</li>
                  <li>• Litigios comerciales</li>
                  <li>• Demandas o contrademandas</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Documentos Legales</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Contratos importantes</li>
                  <li>• Testamentos</li>
                  <li>• Poderes legales</li>
                  <li>• Documentos notariales</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Derechos Vulnerados</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Violaciones constitucionales</li>
                  <li>• Despidos injustificados</li>
                  <li>• Estafas o fraudes</li>
                  <li>• Violencia intrafamiliar</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Exclusión de Responsabilidad */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              5. Exclusión de Responsabilidad
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Lawyer Platform y sus operadores <strong>NO serán responsables</strong> por:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Decisiones legales tomadas basándose en información de la plataforma</li>
              <li>Errores, omisiones o inexactitudes en la información proporcionada</li>
              <li>Pérdidas o daños resultantes del uso o imposibilidad de uso del servicio</li>
              <li>Acciones u omisiones de abogados terceros contactados a través de la plataforma</li>
              <li>Resultados de procesos legales o judiciales</li>
              <li>Cambios en la legislación posterior a la consulta</li>
            </ul>
          </section>

          {/* Confidencialidad */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              6. Confidencialidad y Privilegio Abogado-Cliente
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>IMPORTANTE:</strong> Las comunicaciones a través de esta plataforma:
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
              <p className="text-yellow-900 font-medium">
                ⚠️ Pueden <strong>NO estar protegidas</strong> por el privilegio de confidencialidad abogado-cliente 
                a menos que se haya establecido formalmente dicha relación.
              </p>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Evite compartir información altamente sensible en chats iniciales</li>
              <li>No comparta detalles de casos penales sin protección formal</li>
              <li>Solicite acuerdo de confidencialidad antes de revelar información crítica</li>
            </ul>
          </section>

          {/* Actualización de Información */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              7. Actualización de Información Legal
            </h2>
            <p className="text-gray-700 leading-relaxed">
              La información legal proporcionada puede quedar desactualizada debido a:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
              <li>Cambios en la legislación colombiana</li>
              <li>Nuevas sentencias de jurisprudencia</li>
              <li>Reformas constitucionales</li>
              <li>Decretos y regulaciones administrativas</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Siempre verifique</strong> con un abogado que la información esté actualizada y sea aplicable a su caso específico.
            </p>
          </section>

          {/* Uso Apropiado */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              8. Uso Apropiado de la Plataforma
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Esta plataforma es apropiada para:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  ✅ SÍ Apropiado
                </h4>
                <ul className="text-sm text-green-900 space-y-1">
                  <li>• Información general sobre leyes</li>
                  <li>• Orientación sobre procedimientos</li>
                  <li>• Entender derechos básicos</li>
                  <li>• Primera aproximación a un tema legal</li>
                  <li>• Decidir si necesita abogado</li>
                </ul>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  ❌ NO Apropiado
                </h4>
                <ul className="text-sm text-red-900 space-y-1">
                  <li>• Casos penales graves</li>
                  <li>• Representación en juicios</li>
                  <li>• Redacción de demandas</li>
                  <li>• Análisis de contratos complejos</li>
                  <li>• Emergencias legales inmediatas</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Jurisdicción */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              9. Jurisdicción Aplicable
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Esta plataforma está diseñada para proporcionar información sobre el <strong>ordenamiento jurídico colombiano</strong>. 
              La información puede no ser aplicable o estar desactualizada para otras jurisdicciones.
            </p>
          </section>

          {/* Modificaciones */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              10. Modificaciones a este Aviso Legal
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar este aviso legal en cualquier momento. 
              Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma.
            </p>
          </section>

          {/* Contacto */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              11. Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para consultas sobre este aviso legal:
            </p>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-gray-700">
                <strong>Email Legal:</strong> <a href="mailto:legal@lawyer.com" className="text-red-600 hover:underline">legal@lawyer.com</a>
              </p>
              <p className="text-gray-700">
                <strong>Teléfono:</strong> +57 300 123 4567
              </p>
            </div>
          </section>

          {/* Resumen Final */}
          <div className="mt-12 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl">
            <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Resumen: Lo que DEBE recordar
            </h3>
            <ul className="space-y-3 text-red-900">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Esta plataforma proporciona <strong>información general</strong>, NO asesoría legal específica</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>La IA es una herramienta informativa, <strong>NO un abogado</strong></span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span><strong>Siempre consulte con un abogado colegiado</strong> para casos específicos</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                <span>No se establece relación abogado-cliente automáticamente</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">5.</span>
                <span>La información puede quedar <strong>desactualizada</strong> por cambios legales</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Al usar Lawyer Platform, usted reconoce haber leído, entendido y aceptado este Aviso Legal.
            </p>
          </div>
        </motion.div>

        {/* Links a otras políticas */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-center">
          <Link
            to="/terminos"
            className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            Ver Términos de Servicio
            <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          
          <Link
            to="/privacidad"
            className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            Ver Política de Privacidad
            <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>

          <Link
            to="/cookies"
            className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            Ver Política de Cookies
            <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
