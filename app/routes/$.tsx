import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => {
    return [
        { title: "Página no encontrada - Lawyer" },
        { name: "description", content: "Lo sentimos, la página que buscas no existe." },
    ];
};

export default function NotFound() {
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
                            rotate: [0, 2, -2, 1, 0],
                            scale: [1, 1.05, 0.95, 1.02, 1]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-50/40 to-cyan-100/20 rounded-full blur-3xl"
                        style={{
                            clipPath: "polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)"
                        }}
                    />

                    <motion.div
                        animate={{
                            x: [0, 10, -10, 5, 0],
                            y: [0, -5, 10, -5, 0],
                            rotate: [0, -1, 2, -1, 0]
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute bottom-32 left-20 w-80 h-40 bg-gradient-to-r from-sky-50/30 to-blue-100/20 blur-2xl transform rotate-12"
                        style={{
                            borderRadius: "50% 30% 60% 40%"
                        }}
                    />
                </motion.div>

                <div className="max-w-4xl mx-auto px-6 relative z-10 min-h-[70vh] flex flex-col items-center justify-center">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mb-8"
                    >
                        <Link to="/" className="inline-block">
                            <img
                                src="/LogotipoEstudioJuridico.png"
                                alt="Lawyer"
                                className="h-24 w-auto object-contain opacity-50"
                            />
                        </Link>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="h-0.5 bg-blue-300 mb-8 mx-auto max-w-md"
                        />

                        {/* 404 Number - Editorial Style */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="mb-6"
                        >
                            <span className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                404
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                        >
                            Página No Encontrada
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                            className="text-xl text-gray-600 italic mb-8 max-w-2xl"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                        >
                            Lo sentimos, la página que buscas parece haber sido archivada en nuestros registros.
                        </motion.p>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "60%" }}
                            transition={{ duration: 0.8, delay: 1.4 }}
                            className="h-0.5 bg-blue-400 mb-8 mx-auto"
                        />

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    to="/"
                                    className="px-8 py-4 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300"
                                    style={{
                                        fontFamily: "Georgia, 'Times New Roman', serif",
                                        fontSize: "1.1rem",
                                        letterSpacing: "0.05em"
                                    }}
                                >
                                    Volver al Inicio
                                </Link>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    to="/chat"
                                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all duration-300"
                                    style={{
                                        fontFamily: "Georgia, 'Times New Roman', serif",
                                        fontSize: "1.1rem",
                                        letterSpacing: "0.05em"
                                    }}
                                >
                                    Hablar con Asistente
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Decorative Quote Marks */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="absolute top-20 left-10 text-6xl text-blue-100 font-bold"
                        style={{
                            fontFamily: "Georgia, 'Times New Roman', serif",
                            transform: "rotate(-15deg)"
                        }}
                    >
                        "
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.2 }}
                        className="absolute bottom-20 right-10 text-6xl text-cyan-100 font-bold"
                        style={{
                            fontFamily: "Georgia, 'Times New Roman', serif",
                            transform: "rotate(15deg)"
                        }}
                    >
                        "
                    </motion.div>

                    {/* Helpful Links Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8 }}
                        className="mt-16 w-full"
                    >
                        <div className="border-t border-blue-200 pt-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                Páginas más visitadas
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <Link to="/licencias" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
                                    Licencias
                                </Link>
                                <Link to="/chat" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
                                    Chat
                                </Link>
                                <Link to="/acerca" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
                                    Acerca de
                                </Link>
                                <Link to="/perfil" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
                                    Mi Perfil
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
