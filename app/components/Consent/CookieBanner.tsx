import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar si ya aceptó cookies
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      // Mostrar banner después de 1 segundo
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    const consent = {
      essential: true,
      functional: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem("cookieConsent", JSON.stringify(consent));
    setIsVisible(false);
    
    // Enviar a API
    fetch("/api/consent/cookies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consent),
    }).catch(console.error);
  };

  const handleReject = () => {
    const consent = {
      essential: true, // Esenciales siempre activas
      functional: false,
      analytics: false,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem("cookieConsent", JSON.stringify(consent));
    setIsVisible(false);
    
    fetch("/api/consent/cookies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consent),
    }).catch(console.error);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-6 right-6 z-[70] mx-auto max-w-4xl"
        >
          <div 
            className="bg-white border-2 border-gray-200 shadow-2xl overflow-hidden"
            style={{ borderRadius: "2px" }}
          >
            {/* Barra superior decorativa */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"
            />

            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Icono minimalista */}
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full flex items-center justify-center border-2 border-amber-200">
                    <svg className="h-6 w-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                    </svg>
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex-1">
                  <h3 
                    className="text-lg font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    Usamos Cookies
                  </h3>
                  
                  <p 
                    className="text-sm text-gray-700 leading-relaxed mb-4"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    Utilizamos cookies esenciales para el funcionamiento y cookies opcionales para mejorar tu experiencia. 
                    Al continuar, aceptas nuestra{" "}
                    <Link 
                      to="/cookies" 
                      className="text-amber-600 hover:text-amber-700 underline font-semibold"
                    >
                      Política de Cookies
                    </Link>
                    .
                  </p>

                  {/* Botones minimalistas */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      onClick={handleAccept}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-2.5 px-6 bg-black text-white font-semibold hover:bg-gray-800 transition-colors shadow-md"
                      style={{ 
                        borderRadius: "2px",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        letterSpacing: "0.03em"
                      }}
                    >
                      Aceptar todas
                    </motion.button>
                    
                    <motion.button
                      onClick={handleReject}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-2.5 px-6 border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                      style={{ 
                        borderRadius: "2px",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        letterSpacing: "0.03em"
                      }}
                    >
                      Rechazar
                    </motion.button>
                  </div>
                </div>

                {/* Botón cerrar (X) */}
                <button
                  onClick={handleReject}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Cerrar"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
