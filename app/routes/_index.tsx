import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";
import Layout from "~/components/Layout";
import {
  ChatBubbleLeftRightIcon,
  ScaleIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Lawyer - Asistente Legal Inteligente" },
    {
      name: "description",
      content:
        "Tu asistente legal basado en IA. Resuelve consultas jurídicas de forma rápida y económica.",
    },
  ];
};

const features = [
  {
    name: "Respuestas Instantáneas",
    description:
      "Obtén asesoramiento legal al instante sin esperar días o semanas para una consulta.",
    icon: ClockIcon,
  },
  {
    name: "Especializado en Derecho",
    description:
      "Entrenado con miles de documentos legales y jurisprudencia actualizada.",
    icon: ScaleIcon,
  },
  {
    name: "Precios Accesibles",
    description:
      "Consulta legal a una fracción del costo de un abogado tradicional.",
    icon: DocumentTextIcon,
  },
  {
    name: "Comunidad Legal",
    description:
      "Accede a una red de abogados para casos que requieran atención especializada.",
    icon: UserGroupIcon,
  },
];

const testimonials = [
  {
    content:
      "Lawyer me ayudó a entender mis opciones legales cuando tuve un conflicto con mi arrendador. Muy recomendado.",
    author: "María T.",
    role: "Cliente",
  },
  {
    content:
      "Como pequeño empresario, necesito respuestas rápidas. Lawyer me ha ahorrado tiempo y dinero en consultas legales.",
    author: "Carlos G.",
    role: "Emprendedor",
  },
  {
    content:
      "Uso Lawyer como complemento a mi práctica legal. Me permite atender más clientes y ofrecer servicios más económicos.",
    author: "Dra. Lucia M.",
    role: "Abogada",
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-law-light">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:py-40 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <a href="/chat" className="inline-flex space-x-6">
                <span className="rounded-full bg-primary-600/10 px-3 py-1 text-sm font-semibold leading-6 text-primary-600 ring-1 ring-inset ring-primary-600/10">
                  Nuevo
                </span>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                  <span>Prueba gratis por 7 días</span>
                </span>
              </a>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Asistencia legal{" "}
              <span className="text-law-accent">inteligente</span> al alcance de
              todos
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Resuelve tus dudas legales al instante con nuestro asistente basado
              en IA. Ahorra tiempo y dinero con respuestas precisas y
              personalizadas.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                to="/chat"
                className="rounded-md bg-law-accent px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-law-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-law-accent"
              >
                Comenzar ahora
              </Link>
              <Link
                to="/como-funciona"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Cómo funciona{" "}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <img
                src="https://placehold.co/600x400/0369a1/FFF?text=Lawyer+Demo"
                alt="App screenshot"
                width={600}
                height={400}
                className="w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-law-accent">
              Acceso simplificado
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Todo lo que necesitas para resolver tus dudas legales
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Lawyer combina la inteligencia artificial con conocimiento legal
              especializado para ofrecerte respuestas confiables en minutos, no
              días.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon
                      className="h-5 w-5 flex-none text-law-accent"
                      aria-hidden="true"
                    />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Chat demo section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Consulta ahora con nuestro asistente legal
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Prueba una demostración de cómo Lawyer puede ayudarte a resolver tus
              dudas legales de manera instantánea.
            </p>
          </div>

          <motion.div
            className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-8 sm:p-10 lg:flex-auto">
              <div className="flex items-center gap-4">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-law-accent" />
                <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                  Demo de chat legal
                </h3>
              </div>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Pregunta cualquier duda legal y recibe asesoramiento en tiempo
                real. Esta es solo una demostración, para acceder a todas las
                funcionalidades, regístrate.
              </p>

              <div className="mt-8 overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Asistente Legal
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700">
                        ¿Qué debo hacer si recibo una multa de tránsito injusta?
                      </div>
                    </div>
                    <div className="flex">
                      <div className="rounded-lg bg-primary-100 px-4 py-2 text-sm text-gray-700">
                        Para impugnar una multa de tránsito que consideras injusta,
                        debes seguir estos pasos:
                        <br />
                        <br />
                        1. Recopila evidencia (fotos, videos, testimonios)
                        <br />
                        2. Presenta una solicitud de reconsideración dentro del plazo
                        legal (generalmente 15 días hábiles)
                        <br />
                        3. Si es rechazada, puedes apelar ante el órgano superior
                        correspondiente
                        <br />
                        <br />
                        ¿Necesitas información más específica sobre tu caso
                        particular?
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex">
                    <input
                      type="text"
                      placeholder="Escribe tu consulta legal..."
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-law-accent sm:text-sm sm:leading-6"
                    />
                    <button
                      type="button"
                      className="ml-4 rounded-md bg-law-accent px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-law-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-law-accent"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-gray-600">
                    Prueba completa del servicio
                  </p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-gray-900">
                      $29
                    </span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                      USD/mes
                    </span>
                  </p>
                  <Link
                    to="/licencias"
                    className="mt-10 block w-full rounded-md bg-law-accent px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-law-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-law-accent"
                  >
                    Ver planes
                  </Link>
                  <p className="mt-6 text-xs leading-5 text-gray-600">
                    Facturación mensual. Cancela en cualquier momento.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Testimonials section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-law-accent">
              Testimonios
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Confían en nosotros para resolver sus consultas legales
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="flex flex-col justify-between rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div>
                  <div className="flex items-center gap-x-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 15.585l6.146 3.74-1.635-7.412L20 7.162l-7.505-.64L10 0 7.505 6.522 0 7.162l5.489 4.751-1.635 7.412L10 15.585z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                  <div className="mt-6 text-lg leading-8 text-gray-600">
                    "{testimonial.content}"
                  </div>
                </div>
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <div className="text-base font-semibold text-gray-900">
                    {testimonial.author}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-law-accent">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            ¿Listo para empezar?
            <br />
            Prueba Lawyer hoy sin costo.
          </h2>
          <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
            <Link
              to="/chat"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-law-accent shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Comenzar ahora
            </Link>
            <Link
              to="/licencias"
              className="text-sm font-semibold leading-6 text-white"
            >
              Ver planes <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
