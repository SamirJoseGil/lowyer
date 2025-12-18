import { Link } from "@remix-run/react";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 border-t-2 border-blue-100 mt-auto">
      {/* Contenedor principal más compacto */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grid horizontal: 4 columnas en desktop, stack en móvil */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* Columna 1: Logo y descripción */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center">
              <img
                src="/LogotipoEstudioJuridico.png"
                alt="Lawyer"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p
              className="text-sm text-gray-600 leading-relaxed"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Tu asistente legal inteligente con abogados certificados.
            </p>
            {/* Social Links */}
            <div className="flex space-x-3">
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </motion.a>
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </motion.a>
            </div>
          </div>

          {/* Columna 2: Plataforma */}
          <div>
            <h3
              className="text-sm font-bold text-gray-900 mb-3"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Plataforma
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/chat"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Asistente IA
                </Link>
              </li>
              <li>
                <Link
                  to="/licencias"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Planes y Precios
                </Link>
              </li>
              <li>
                <Link
                  to="/abogados"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Nuestros Abogados
                </Link>
              </li>
              <li>
                <Link
                  to="/como-funciona"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Cómo Funciona
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h3
              className="text-sm font-bold text-gray-900 mb-3"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terminos"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link
                  to="/privacidad"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link
                  to="/disclaimer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Aviso Legal
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto y Soporte */}
          <div>
            <h3
              className="text-sm font-bold text-gray-900 mb-3"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Soporte
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/acerca"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <a
                  href="mailto:soporte@lawyer.com"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  soporte@lawyer.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+573001234567"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  +57 300 123 4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria decorativa */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: 0.3 }}
          className="h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent mb-4"
        />

        {/* Bottom bar: Copyright y badges en una línea */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          {/* Copyright */}
          <p style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            © {currentYear} RES NON VERBA. Todos los derechos reservados.
          </p>

          {/* Badges y info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded">
                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Conexión Segura
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded">
                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Abogados Certificados
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Hecho en Colombia 🇨🇴
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
