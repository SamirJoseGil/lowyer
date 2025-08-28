import type { MetaFunction } from "@remix-run/node";
import Layout from "~/components/Layout";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => {
    return [
        { title: "Términos de Servicio - Lawyer" },
        { name: "description", content: "Términos y condiciones de uso del servicio de asistencia legal Lawyer." },
    ];
};

export default function TerminosPage() {
    return (
        <Layout>
            <div className="bg-white px-6 py-32 lg:px-8">
                <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-base font-semibold leading-7 text-law-accent">Información legal</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Términos de Servicio</h1>
                        <p className="mt-6 text-xl leading-8">
                            Última actualización: {new Date().toLocaleDateString()}
                        </p>
                    </motion.div>

                    <div className="mt-10 max-w-2xl">
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">1. Aceptación de términos</h2>
                            <p className="text-base">
                                Al acceder o utilizar los servicios de Lawyer ("Servicio"), usted acepta estar legalmente obligado por estos Términos de Servicio. Si no está de acuerdo con alguno de estos términos, no debe utilizar el Servicio.
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">2. Descripción del servicio</h2>
                            <p className="text-base">
                                Lawyer proporciona un asistente legal basado en inteligencia artificial diseñado para responder preguntas legales generales y proporcionar información básica sobre temas legales. El Servicio no está destinado a reemplazar el consejo legal profesional y no establece una relación abogado-cliente.
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">3. Limitación de responsabilidad</h2>
                            <p className="text-base">
                                La información proporcionada a través del Servicio es solo para fines informativos y educativos. No garantizamos la exactitud, integridad o actualidad de la información proporcionada. El uso del Servicio es bajo su propio riesgo.
                            </p>
                            <p className="text-base">
                                En ningún caso Lawyer, sus directores, empleados o agentes serán responsables por cualquier daño directo, indirecto, incidental, especial, punitivo o consecuente que surja del uso del Servicio.
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">4. Suscripciones y facturación</h2>
                            <p className="text-base">
                                Algunos aspectos del Servicio pueden ofrecerse en forma de suscripción con un pago recurrente. Al suscribirse, usted autoriza a Lawyer a facturarle automáticamente utilizando el método de pago proporcionado.
                            </p>
                            <p className="text-base">
                                Puede cancelar su suscripción en cualquier momento a través de su cuenta o contactando a nuestro servicio de atención al cliente. La cancelación será efectiva al final del período de facturación actual.
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">5. Propiedad intelectual</h2>
                            <p className="text-base">
                                Todo el contenido, características y funcionalidad del Servicio, incluidos pero no limitados a texto, gráficos, logotipos, iconos, imágenes, clips de audio, descargas digitales y compilaciones de datos, son propiedad de Lawyer o de sus licenciantes y están protegidos por leyes de propiedad intelectual.
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">6. Cambios en los términos</h2>
                            <p className="text-base">
                                Nos reservamos el derecho, a nuestro exclusivo criterio, de modificar o reemplazar estos términos en cualquier momento. Si realizamos cambios materiales, intentaremos notificarle a través de la dirección de correo electrónico asociada con su cuenta o mediante un aviso en nuestro sitio web.
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">7. Legislación aplicable</h2>
                            <p className="text-base">
                                Estos términos se regirán e interpretarán de acuerdo con las leyes de Colombia, sin tener en cuenta sus disposiciones sobre conflicto de leyes.
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">8. Contacto</h2>
                            <p className="text-base">
                                Si tiene alguna pregunta sobre estos Términos de Servicio, puede ponerse en contacto con nosotros en: <a href="mailto:info@lawyer.com" className="text-law-accent hover:underline">info@lawyer.com</a>
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
