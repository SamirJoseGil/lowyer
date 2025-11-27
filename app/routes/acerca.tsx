import type { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => {
    return [
        { title: "Acerca de Nosotros - Lawyer" },
        { name: "description", content: "Conoce nuestro equipo de expertos legales y nuestra misión de democratizar el acceso a la justicia" },
    ];
};

export default function Acerca() {
    return (
        <div className="min-h-screen bg-white">
            <main className="pt-24 relative overflow-hidden">
                {/* Organic Background Textures - Azul Pastel */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 z-0"
                >
                    <motion.div
                        animate={{
                            rotate: [0, 3, -2, 1, 0],
                            scale: [1, 1.02, 0.98, 1.01, 1]
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-50/40 to-cyan-100/20 rounded-full blur-3xl"
                        style={{
                            clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)"
                        }}
                    />

                    <motion.div
                        animate={{
                            x: [0, 15, -10, 5, 0],
                            y: [0, -10, 15, -5, 0],
                            rotate: [0, -2, 3, -1, 0]
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute bottom-32 left-20 w-96 h-48 bg-gradient-to-r from-sky-50/30 to-blue-100/20 blur-2xl transform rotate-12"
                        style={{
                            borderRadius: "60% 40% 30% 70%"
                        }}
                    />
                </motion.div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    {/* Editorial Header con Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-center mb-16"
                    >
                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="flex justify-center mb-8"
                        >
                            <img
                                src="/LogotipoEstudioJuridico.png"
                                alt="Lawyer - Estudio Jurídico"
                                className="h-24 w-auto object-contain"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-0.5 bg-blue-300 mb-8 mx-auto max-w-2xl"
                        />

                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4 leading-tight"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            Nuestra Historia
                        </h1>

                        <motion.div
                            initial={{ opacity: 0, letterSpacing: "0.3em" }}
                            animate={{ opacity: 1, letterSpacing: "0.05em" }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="text-xl md:text-2xl text-gray-700 italic mb-6"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                        >
                            Democratizando el acceso a la justicia en Colombia
                        </motion.div>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "40%" }}
                            transition={{ duration: 0.8, delay: 1 }}
                            className="h-0.5 bg-blue-400 mx-auto"
                        />
                    </motion.div>

                    {/* Main Content - Editorial Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
                        {/* Left Column - Decorative Element */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="lg:col-span-5"
                        >
                            <div className="relative">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                    className="aspect-[4/5] bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center relative overflow-hidden"
                                    style={{
                                        borderRadius: "2px",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                                    }}
                                >
                                    {/* Ilustración de justicia */}
                                    <div className="text-center text-blue-400 p-8">
                                        <svg className="w-32 h-32 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2zm0-10h2v8h-2z" />
                                        </svg>
                                        <p className="text-xl font-bold text-gray-700"
                                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                            Tecnología + Experiencia Legal
                                        </p>
                                    </div>

                                    {/* Decorative corner */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.5 }}
                                        className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-400"
                                    />
                                </motion.div>

                                {/* Quote decoration */}
                                <motion.div
                                    initial={{ opacity: 0, rotate: -15 }}
                                    animate={{ opacity: 1, rotate: -10 }}
                                    transition={{ delay: 1.2 }}
                                    className="absolute -top-6 -left-6 text-6xl text-blue-200 font-bold"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                >
                                    "
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Right Column - Editorial Text */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="lg:col-span-7 space-y-8"
                        >
                            {/* First Article */}
                            <article className="border-l-4 border-blue-400 pl-6">
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-3xl font-bold mb-4 text-gray-900"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                >
                                    Una Nueva Era en Servicios Legales
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1 }}
                                    className="text-lg text-gray-700 leading-relaxed mb-6"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                >
                                    Lawyer nace de la visión de hacer accesible el conocimiento legal para todos los colombianos.
                                    Combinamos la experiencia de abogados certificados con la eficiencia de la inteligencia artificial,
                                    creando un puente entre la tecnología y la justicia.
                                </motion.p>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2 }}
                                    className="text-lg text-gray-700 leading-relaxed"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                >
                                    Nuestra plataforma permite resolver consultas básicas de manera instantánea, mientras que
                                    conecta a usuarios con abogados profesionales cuando se requiere asesoría especializada.
                                    Todo esto bajo un modelo transparente y accesible.
                                </motion.p>
                            </article>

                            {/* Second Article */}
                            <article className="border-l-4 border-cyan-400 pl-6">
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.4 }}
                                    className="text-3xl font-bold mb-4 text-gray-900"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                >
                                    Nuestro Compromiso
                                </motion.h2>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.6 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                                        <div>
                                            <h3 className="font-bold mb-2 text-blue-600"
                                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                Valores
                                            </h3>
                                            <ul className="space-y-1 text-sm"
                                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                <li>• Accesibilidad para todos</li>
                                                <li>• Transparencia total</li>
                                                <li>• Innovación tecnológica</li>
                                                <li>• Excelencia profesional</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="font-bold mb-2 text-cyan-600"
                                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                Áreas de Especialización
                                            </h3>
                                            <ul className="space-y-1 text-sm"
                                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                <li>• Derecho Civil y Comercial</li>
                                                <li>• Derecho Laboral</li>
                                                <li>• Derecho de Familia</li>
                                                <li>• Derecho Administrativo</li>
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            </article>

                            {/* Third Article - IA Legal */}
                            <article className="border-l-4 border-sky-400 pl-6">
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.8 }}
                                    className="text-3xl font-bold mb-4 text-gray-900"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                >
                                    Tecnología con Propósito
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 2 }}
                                    className="text-lg text-gray-700 leading-relaxed"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                >
                                    Nuestro asistente de IA legal está especializado en derecho colombiano y puede responder
                                    consultas generales en áreas como derecho civil, laboral, penal, familiar y administrativo.
                                    Cuando tu caso requiere atención personalizada, te conectamos inmediatamente con abogados
                                    certificados y verificados.
                                </motion.p>
                            </article>
                        </motion.div>
                    </div>

                    {/* Stats Section - Editorial Style */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
                    >
                        <div className="text-center p-8 border-t-4 border-blue-400">
                            <div className="text-4xl font-bold text-blue-600 mb-2"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                24/7
                            </div>
                            <p className="text-gray-700"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Disponibilidad para consultas con IA
                            </p>
                        </div>
                        <div className="text-center p-8 border-t-4 border-cyan-400">
                            <div className="text-4xl font-bold text-cyan-600 mb-2"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                100+
                            </div>
                            <p className="text-gray-700"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Abogados certificados en la red
                            </p>
                        </div>
                        <div className="text-center p-8 border-t-4 border-sky-400">
                            <div className="text-4xl font-bold text-sky-600 mb-2"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                20+
                            </div>
                            <p className="text-gray-700"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Áreas del derecho cubiertas
                            </p>
                        </div>
                    </motion.div>

                    {/* Editorial Footer */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.4 }}
                        className="text-center py-12 border-t border-gray-200"
                    >
                        <p className="text-lg text-gray-600 italic mb-4"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            "La justicia debe ser accesible para todos, no solo para quienes pueden costearla."
                        </p>
                        <p className="text-sm text-gray-500"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            - Equipo Lawyer
                        </p>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "15%" }}
                            transition={{ duration: 1, delay: 2.8 }}
                            className="h-0.5 bg-blue-400 mx-auto mt-4"
                        />
                    </motion.div>
                </div>

                {/* Decorative Quote Marks */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    className="absolute -top-10 -right-10 text-6xl text-blue-100 font-bold"
                    style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        transform: "rotate(15deg)"
                    }}
                >
                    "
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.7 }}
                    className="absolute -bottom-10 -left-10 text-6xl text-cyan-100 font-bold"
                    style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        transform: "rotate(-15deg)"
                    }}
                >
                    "
                </motion.div>
            </main>
        </div>
    );
}
