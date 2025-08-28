import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import type { MetaFunction } from "@remix-run/node";
import Layout from "~/components/Layout";
import { CheckIcon } from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
    return [
        { title: "Licencias y Planes - Lawyer" },
        { name: "description", content: "Conoce nuestros planes de suscripción para acceder al asistente legal Lawyer. Planes para individuos y empresas." },
    ];
};

const plans = [
    {
        name: 'Básico',
        id: 'basic',
        price: '$19',
        description: 'Ideal para necesidades legales ocasionales',
        features: [
            '20 consultas mensuales',
            'Acceso a información legal básica',
            'Plantillas legales simples',
            'Soporte por email',
        ],
        cta: 'Comenzar gratis',
        mostPopular: false,
    },
    {
        name: 'Profesional',
        id: 'pro',
        price: '$49',
        description: 'Para profesionales y pequeñas empresas',
        features: [
            'Consultas ilimitadas',
            'Acceso completo a base de conocimiento legal',
            '50+ plantillas legales personalizables',
            'Consultas con abogados reales (2 mensuales)',
            'Soporte prioritario',
        ],
        cta: 'Suscribirse ahora',
        mostPopular: true,
    },
    {
        name: 'Empresarial',
        id: 'enterprise',
        price: '$199',
        description: 'Para equipos legales y empresas',
        features: [
            'Consultas ilimitadas para múltiples usuarios',
            'Base de conocimiento personalizada',
            'Plantillas legales específicas para su industria',
            'Consultas ilimitadas con abogados especializados',
            'API de integración',
            'Soporte 24/7',
        ],
        cta: 'Contactar ventas',
        mostPopular: false,
    },
];

const faqs = [
    {
        question: '¿Cómo funciona la prueba gratuita?',
        answer:
            'La prueba gratuita te da acceso completo al plan Básico durante 7 días. No necesitas ingresar información de pago para comenzar. Te enviaremos un recordatorio antes de que finalice tu período de prueba.',
    },
    {
        question: '¿Puedo cambiar de plan en cualquier momento?',
        answer:
            'Sí, puedes actualizar o cambiar tu plan en cualquier momento. Si actualizas, el cambio se aplicará inmediatamente. Si bajas de nivel, el cambio se aplicará en tu próximo ciclo de facturación.',
    },
    {
        question: '¿Las respuestas de la IA tienen validez legal?',
        answer:
            'Las respuestas proporcionadas por nuestro asistente de IA son informativas y no constituyen asesoría legal formal. Para casos complejos o que requieran representación legal, siempre recomendamos consultar con un abogado calificado.',
    },
    {
        question: '¿Cómo funciona la facturación?',
        answer:
            'La facturación se realiza mensualmente en la fecha en que te suscribiste. Aceptamos todas las tarjetas de crédito principales y transferencias bancarias para planes empresariales. Emitimos facturas electrónicas que cumplen con los requisitos fiscales.',
    },
    {
        question: '¿Qué pasa si excedo mi límite de consultas?',
        answer:
            'En el plan Básico, si excedes tu límite de 20 consultas, tendrás la opción de esperar hasta el próximo ciclo o actualizar a un plan superior. No cobramos automáticamente por consultas adicionales sin tu consentimiento.',
    },
];

export default function LicenciasPage() {
    return (
        <Layout>
            <div className="bg-white">
                <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="text-base font-semibold leading-7 text-law-accent">Precios</h1>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Planes que se adaptan a tus necesidades
                        </p>
                    </div>
                    <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
                        Elige el plan que mejor se adapte a tus necesidades legales y comienza a resolver tus consultas jurídicas hoy mismo.
                    </p>

                    {/* Pricing tiers */}
                    <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {plans.map((plan, planIdx) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: planIdx * 0.1 }}
                                className={`rounded-3xl p-8 ring-1 relative ${plan.mostPopular ? 'bg-gray-900 ring-gray-900' : 'bg-white ring-gray-200'
                                    }`}
                            >
                                {plan.mostPopular && (
                                    <div className="absolute inset-x-0 top-0 -translate-y-1/2 transform flex justify-center">
                                        <div className="inline-flex rounded-full bg-law-accent px-4 py-1 text-sm font-semibold text-white">
                                            Más Popular
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-between gap-x-4">
                                    <h2 id={plan.id} className={`text-lg font-semibold leading-8 ${plan.mostPopular ? 'text-white' : 'text-gray-900'}`}>
                                        {plan.name}
                                    </h2>
                                </div>
                                <p className={`mt-4 text-sm leading-6 ${plan.mostPopular ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {plan.description}
                                </p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className={`text-4xl font-bold tracking-tight ${plan.mostPopular ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                                    <span className={`text-sm font-semibold leading-6 ${plan.mostPopular ? 'text-gray-300' : 'text-gray-600'}`}>/mes</span>
                                </p>
                                <ul role="list" className={`mt-8 space-y-3 text-sm leading-6 ${plan.mostPopular ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex gap-x-3">
                                            <CheckIcon className={`h-6 w-5 flex-none ${plan.mostPopular ? 'text-white' : 'text-law-accent'}`} aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to={plan.id === 'enterprise' ? '/contacto' : '/registro'}
                                    aria-describedby={plan.id}
                                    className={`mt-8 block rounded-md px-3.5 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${plan.mostPopular
                                        ? 'bg-white text-gray-900 hover:bg-gray-100 focus-visible:outline-white'
                                        : 'bg-law-accent text-white hover:bg-law-accent/90 focus-visible:outline-law-accent'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* FAQs */}
                    <div className="mx-auto mt-32 max-w-7xl divide-y divide-gray-900/10 px-6 lg:px-8">
                        <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">Preguntas frecuentes</h2>
                        <dl className="mt-10 space-y-8 divide-y divide-gray-900/10">
                            {faqs.map((faq, faqIdx) => (
                                <motion.div
                                    key={faqIdx}
                                    className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: faqIdx * 0.1 }}
                                >
                                    <dt className="text-base font-semibold leading-7 text-gray-900 lg:col-span-5">{faq.question}</dt>
                                    <dd className="mt-4 lg:col-span-7 lg:mt-0">
                                        <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
                                    </dd>
                                </motion.div>
                            ))}
                        </dl>
                    </div>

                    {/* CTA */}
                    <div className="relative isolate mt-32 px-6 py-16 sm:rounded-3xl sm:px-24 sm:py-24 lg:mt-40 lg:py-32 xl:px-32">
                        <div className="absolute inset-0 overflow-hidden rounded-3xl">
                            <div className="absolute inset-0 bg-law-accent/20" />
                        </div>
                        <div className="relative mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Potencia tu conocimiento legal
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Únete a miles de personas y empresas que utilizan Lawyer para resolver sus dudas legales de forma eficiente y económica.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Link
                                    to="/registro"
                                    className="rounded-md bg-law-accent px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-law-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-law-accent"
                                >
                                    Comenzar ahora
                                </Link>
                                <Link to="/chat" className="text-sm font-semibold leading-6 text-gray-900">
                                    Probar chat <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
