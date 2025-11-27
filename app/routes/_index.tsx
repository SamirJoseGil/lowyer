import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { getUser } from "~/lib/auth.server";

export const meta: MetaFunction = () => [{ title: "Inicio - Lawyer | Asistente Legal IA" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  return json({ user });
};

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  // Determinar la ruta del dashboard según el rol
  const getDashboardRoute = () => {
    if (!user) return '/dashboard';

    switch (user.role?.name) {
      case 'superadmin':
      case 'admin':
        return '/admin';
      case 'abogado':
        return '/dashboard/abogado';
      default:
        return '/dashboard';
    }
  };

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
          {/* Hero Section - Editorial Style */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-center mb-16"
          >
            {/* Logo Integration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex justify-center mb-8"
            >
              <img
                src="/LogotipoEstudioJuridico.png"
                alt="Lawyer - Estudio Jurídico"
                className="h-32 w-auto object-contain"
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
              Tu Asistente Legal Inteligente
            </h1>

            <motion.div
              initial={{ opacity: 0, letterSpacing: "0.3em" }}
              animate={{ opacity: 1, letterSpacing: "0.05em" }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-xl md:text-2xl text-gray-700 italic mb-6"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Consultas jurídicas accesibles para todos los colombianos
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "40%" }}
              transition={{ duration: 0.8, delay: 1 }}
              className="h-0.5 bg-blue-400 mx-auto"
            />
          </motion.div>

          {/* User Welcome or CTA */}
          {user ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mb-20"
            >
              <div className="glass-morphism rounded-2xl p-8 max-w-2xl mx-auto border border-blue-100/20 shadow-xl">
                <div className="text-center mb-6">
                  <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg mb-4">
                    <span className="text-2xl font-bold text-white">
                      {user.profile?.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    Bienvenido, {user.profile?.firstName || user.email.split("@")[0]}
                  </h2>
                  <p className="text-gray-600 italic">¿En qué podemos ayudarte hoy?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={getDashboardRoute()}
                      className="block p-6 border-l-4 border-blue-400 bg-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center mb-2">
                        <svg className="h-6 w-6 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                        <h3 className="font-bold text-gray-900"
                          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                          {user.role?.name === 'superadmin' || user.role?.name === 'admin' ? 'Panel Admin' :
                            user.role?.name === 'abogado' ? 'Panel Abogado' : 'Mi Dashboard'}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">Gestiona tu cuenta y servicios</p>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/chat"
                      className="block p-6 border-l-4 border-cyan-400 bg-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center mb-2">
                        <svg className="h-6 w-6 text-cyan-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <h3 className="font-bold text-gray-900"
                          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                          Iniciar Consulta
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">Habla con nuestra IA legal</p>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-center mb-20"
            >
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="px-8 py-4 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300"
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: "1.1rem",
                      letterSpacing: "0.05em"
                    }}
                  >
                    Comenzar Gratis
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all duration-300"
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: "1.1rem",
                      letterSpacing: "0.05em"
                    }}
                  >
                    Iniciar Sesión
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Features Grid - Editorial Layout */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mb-20"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 1.2 }}
              className="h-0.5 bg-blue-300 mb-12"
            />

            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Nuestros Servicios
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Service 1 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="text-center p-6 border-t-4 border-blue-400"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082a.75.75 0 00-.678.744v.812M9.75 3.104a48.424 48.424 0 011.5 0M5 14.5c0 2.208 1.792 4 4 4s4-1.792 4-4M5 14.5c0-1.01.377-1.932 1-2.626M19 14.5v-5.714a2.25 2.25 0 00-.659-1.591L14.25 3.104M19 14.5c0 2.208-1.792 4-4 4s-4-1.792-4-4m8 0c1.01-.377 1.932-1 2.626-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  Asistente IA Legal
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Respuestas instantáneas a consultas legales básicas, disponible 24/7
                </p>
              </motion.div>

              {/* Service 2 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="text-center p-6 border-t-4 border-cyan-400"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  Abogados Certificados
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Conexión directa con profesionales verificados para casos complejos
                </p>
              </motion.div>

              {/* Service 3 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="text-center p-6 border-t-4 border-sky-400"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  Privacidad Garantizada
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tus datos protegidos con encriptación bancaria y confidencialidad total
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* CTA Section */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="text-center mb-20"
            >
              <div className="bg-gray-50 p-12 relative"
                style={{
                  borderRadius: "2px",
                  boxShadow: "0 6px 30px rgba(0,0,0,0.1)"
                }}>

                {/* Decorative corners */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-blue-400"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-blue-400"
                />

                <h2 className="text-3xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  ¿Listo para comenzar?
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  Prueba gratis nuestro asistente legal y descubre cómo podemos ayudarte
                </p>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="inline-block px-8 py-4 bg-black text-white hover:bg-gray-800 transition-colors duration-300 font-bold tracking-wide"
                    style={{
                      borderRadius: "2px",
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      letterSpacing: "0.05em"
                    }}
                  >
                    Obtener Trial Gratuito
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}