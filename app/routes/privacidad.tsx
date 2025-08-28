import type { MetaFunction } from "@remix-run/node";
import Layout from "~/components/Layout";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => {
    return [
        { title: "Política de Privacidad - Lawyer" },
        { name: "description", content: "Política de privacidad y tratamiento de datos personales de Lawyer." },
    ];
};

export default function PrivacidadPage() {
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
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Política de Privacidad</h1>
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
                            <p className="text-base">
                                En Lawyer, valoramos su privacidad y nos comprometemos a proteger sus datos personales. Esta política de privacidad explica cómo recopilamos, utilizamos y protegemos su información cuando utiliza nuestro servicio de asistencia legal basado en IA.
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">1. Información que recopilamos</h2>
                            <p className="text-base">
                                Podemos recopilar los siguientes tipos de información:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Información de identificación personal (nombre, dirección de correo electrónico, número de teléfono)</li>
                                <li>Información de pago (cuando adquiere una suscripción)</li>
                                <li>Información sobre sus consultas legales y uso del servicio</li>
                                <li>Datos técnicos (dirección IP, tipo de navegador, dispositivo utilizado)</li>
                            </ul>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">2. Cómo utilizamos su información</h2>
                            <p className="text-base">
                                Utilizamos su información para:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Proporcionar y mejorar nuestros servicios</li>
                                <li>Procesar pagos y gestionar su cuenta</li>
                                <li>Personalizar su experiencia</li>
                                <li>Entrenar nuestros modelos de IA (de forma anonimizada)</li>
                                <li>Comunicarnos con usted sobre actualizaciones o cambios en el servicio</li>
                                <li>Cumplir con obligaciones legales</li>
                            </ul>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">3. Seguridad de datos</h2>
                            <p className="text-base">
                                Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra acceso no autorizado, alteración, divulgación o destrucción. Estas medidas incluyen encriptación de datos, acceso restringido a personal autorizado y evaluaciones regulares de seguridad.
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">4. Compartición de datos</h2>
                            <p className="text-base">
                                No vendemos sus datos personales a terceros. Podemos compartir su información con:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Proveedores de servicios (procesamiento de pagos, alojamiento web)</li>
                                <li>Asesores profesionales (abogados, contadores, auditores)</li>
                                <li>Autoridades cuando sea legalmente requerido</li>
                            </ul>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">5. Sus derechos</h2>
                            <p className="text-base">
                                Dependiendo de su jurisdicción, puede tener los siguientes derechos:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Acceso a sus datos personales</li>
                                <li>Rectificación de datos inexactos</li>
                                <li>Eliminación de sus datos</li>
                                <li>Restricción del procesamiento de sus datos</li>
                                <li>Portabilidad de datos</li>
                                <li>Oposición al procesamiento</li>
                            </ul>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">6. Cookies y tecnologías similares</h2>
                            <p className="text-base">
                                Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el tráfico y personalizar el contenido. Puede administrar sus preferencias de cookies a través de su navegador.
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">7. Cambios en esta política</h2>
                            <p className="text-base">
                                Podemos actualizar esta política periódicamente. Le notificaremos cualquier cambio significativo mediante un aviso prominente en nuestro sitio web o por correo electrónico.
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">8. Contacto</h2>
                            <p className="text-base">
                                Si tiene preguntas sobre esta política de privacidad o el tratamiento de sus datos, contáctenos en: <a href="mailto:privacidad@lawyer.com" className="text-law-accent hover:underline">privacidad@lawyer.com</a>
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
