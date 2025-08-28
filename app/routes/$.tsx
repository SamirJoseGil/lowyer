import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";
import Layout from "~/components/Layout";

export const meta: MetaFunction = () => {
    return [
        { title: "Página no encontrada - Lawyer" },
        { name: "description", content: "Lo sentimos, la página que estás buscando no existe." },
    ];
};

export default function NotFound() {
    return (
        <Layout>
            <div className="flex min-h-screen flex-col bg-white pt-16 pb-12">
                <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col justify-center px-6 lg:px-8">
                    <motion.div
                        className="flex flex-shrink-0 justify-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link to="/" className="inline-flex">
                            <span className="sr-only">Lawyer</span>
                            <div className="h-12 w-12 rounded-full bg-law-accent flex items-center justify-center">
                                <span className="text-white font-semibold text-2xl">L</span>
                            </div>
                        </Link>
                    </motion.div>
                    <motion.div
                        className="py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="text-center">
                            <p className="text-base font-semibold text-law-accent">404</p>
                            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Página no encontrada</h1>
                            <p className="mt-2 text-base text-gray-500">Lo sentimos, no pudimos encontrar la página que estás buscando.</p>
                            <div className="mt-6">
                                <Link
                                    to="/"
                                    className="text-base font-medium text-law-accent hover:text-law-accent/90"
                                >
                                    Volver al inicio
                                    <span aria-hidden="true"> &rarr;</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </main>
                <footer className="mx-auto w-full max-w-7xl flex-shrink-0 px-6 lg:px-8">
                    <nav className="flex justify-center space-x-4">
                        <a href="/chat" className="text-sm font-medium text-gray-500 hover:text-gray-600">
                            Contactar soporte
                        </a>
                        <span className="inline-block border-l border-gray-300" aria-hidden="true" />
                        <a href="/chat" className="text-sm font-medium text-gray-500 hover:text-gray-600">
                            Chat con asistente
                        </a>
                    </nav>
                </footer>
            </div>
        </Layout>
    );
}
