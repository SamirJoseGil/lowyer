import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@remix-run/react";

interface AuthRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature?: "chat" | "licenses";
}

export default function AuthRequiredModal({ isOpen, onClose, feature = "chat" }: AuthRequiredModalProps) {
    const featureInfo = {
        chat: {
            title: "Accede al Asistente Legal",
            description: "Para utilizar nuestro asistente legal inteligente necesitas crear una cuenta.",
            icon: (
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" />
                </svg>
            )
        },
        licenses: {
            title: "Gestiona tus Licencias",
            description: "Para ver y gestionar tus planes de acceso necesitas crear una cuenta.",
            icon: (
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" />
                </svg>
            )
        }
    };

    const currentFeature = featureInfo[feature];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                        >
                            {/* Decorative Background */}
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400 to-blue-400 rounded-full blur-2xl" />
                            </div>

                            {/* Content */}
                            <div className="relative p-8">
                                {/* Close Button */}
                                <Link
                                    to="/"
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </Link>

                                {/* Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="flex justify-center mb-6"
                                >
                                    <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl text-blue-600">
                                        {currentFeature.icon}
                                    </div>
                                </motion.div>

                                {/* Title */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-2xl font-bold text-gray-900 text-center mb-3"
                                >
                                    {currentFeature.title}
                                </motion.h2>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-gray-600 text-center mb-6 leading-relaxed"
                                >
                                    {currentFeature.description}
                                </motion.p>

                                {/* Benefits List */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100"
                                >
                                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                                        Al registrarte obtienes:
                                    </h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                            </svg>
                                            <span><strong>2 horas gratis</strong> de trial para probar el servicio</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                            </svg>
                                            <span>Acceso al <strong>asistente legal IA</strong></span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                            </svg>
                                            <span>Consultas con <strong>abogados certificados</strong></span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                            </svg>
                                            <span><strong>Sin tarjeta de crédito</strong> para el trial</span>
                                        </li>
                                    </ul>
                                </motion.div>

                                {/* Decorative Line */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className="h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 mx-auto mb-6"
                                />

                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="space-y-3"
                                >
                                    <Link
                                        to="/signup"
                                        className="block w-full px-6 py-3 bg-black text-white text-center rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold shadow-lg"
                                    >
                                        Crear Cuenta Gratuita
                                    </Link>

                                    <Link
                                        to="/login"
                                        className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 text-center rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all duration-300 font-medium"
                                    >
                                        Ya tengo cuenta
                                    </Link>
                                </motion.div>

                                {/* Footer Note */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-xs text-gray-500 text-center mt-4 italic"
                                >
                                    El registro toma menos de 1 minuto
                                </motion.p>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
