import { useState } from "react";
import { Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";

type TrialNotificationModalProps = {
    activeLicense?: {
        hoursRemaining: number;
        expiresAt?: Date | null;
        license: {
            name: string;
            type: string;
            hoursTotal: number;
        };
    } | null;
    isOpen: boolean;
    onClose: () => void;
};

export default function TrialNotificationModal({
    activeLicense,
    isOpen,
    onClose
}: TrialNotificationModalProps) {
    if (!activeLicense || activeLicense.license.type !== "trial") {
        return null;
    }

    const hoursRemaining = activeLicense.hoursRemaining;
    const isLowHours = hoursRemaining <= 1;
    const isExpiringSoon = activeLicense.expiresAt
        ? new Date(activeLicense.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000 // 24 horas
        : false;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -50 }}
                        className="fixed top-20 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            ¡Estás usando el trial gratuito!
                                        </h3>
                                        <p className="text-blue-100 text-sm">
                                            Periodo de prueba activo
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="space-y-4">
                                {/* Hours remaining */}
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Tiempo restante</p>
                                        <p className={`text-2xl font-bold ${isLowHours ? 'text-red-600' : 'text-blue-600'}`}>
                                            {hoursRemaining.toFixed(1)} horas
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">de {activeLicense.license.hoursTotal} horas</p>
                                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                            <div
                                                className={`h-2 rounded-full ${isLowHours ? 'bg-red-400' : 'bg-blue-400'}`}
                                                style={{
                                                    width: `${Math.max(5, (hoursRemaining / Number(activeLicense.license.hoursTotal)) * 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Expiration warning */}
                                {activeLicense.expiresAt && (
                                    <div className={`p-4 rounded-xl border ${isExpiringSoon
                                        ? 'bg-yellow-50 border-yellow-200'
                                        : 'bg-gray-50 border-gray-200'
                                        }`}>
                                        <div className="flex items-center space-x-2">
                                            <svg className={`h-5 w-5 ${isExpiringSoon ? 'text-yellow-600' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                                            </svg>
                                            <div>
                                                <p className={`text-sm font-medium ${isExpiringSoon ? 'text-yellow-800' : 'text-gray-700'}`}>
                                                    Expira el {new Date(activeLicense.expiresAt).toLocaleDateString('es-CO', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                {isExpiringSoon && (
                                                    <p className="text-xs text-yellow-600 mt-1">
                                                        ¡Tu trial expira pronto! No pierdas acceso a tus consultas.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Features highlight */}
                                <div className="space-y-3">
                                    <p className="font-medium text-gray-900">Aprovecha para explorar:</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            "Chat con IA Legal especializada",
                                            "Consultas con abogados profesionales",
                                            "Respuestas en tiempo real",
                                            "Acceso a base de conocimiento legal"
                                        ].map((feature, index) => (
                                            <div key={index} className="flex items-center space-x-3">
                                                <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center">
                                                    <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm text-gray-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Link
                                        to="/licencias"
                                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                        onClick={onClose}
                                    >
                                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H12M13.5 3L19 8.625M13.5 3V8.625C13.5 8.625 13.5 8.625 19 8.625M19 8.625V10.75" />
                                        </svg>
                                        Ver Planes de Pago
                                    </Link>
                                </motion.div>

                                <button
                                    onClick={onClose}
                                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Continuar con el trial
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
