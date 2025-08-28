import { Link } from "@remix-run/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Asistente", href: "/chat" },
    { name: "Licencias", href: "/licencias" },
    { name: "Acerca de", href: "/acerca" },
];

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="fixed inset-x-0 top-0 z-50 bg-white shadow">
            <nav className="flex items-center justify-between p-4 lg:px-8" aria-label="Global">
                <div className="flex lg:flex-1">
                    <Link to="/" className="-m-1.5 p-1.5">
                        <span className="sr-only">Lawyer</span>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-2"
                        >
                            <div className="h-8 w-8 rounded-full bg-law-accent flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">L</span>
                            </div>
                            <span className="text-xl font-bold text-law-dark">Lawyer</span>
                        </motion.div>
                    </Link>
                </div>

                {/* Mobile menu button */}
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Abrir menú principal</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                {/* Desktop navigation */}
                <div className="hidden lg:flex lg:gap-x-12">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className="text-sm font-semibold leading-6 text-gray-900 hover:text-law-accent transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Login button */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    <Link
                        to="/iniciar-sesion"
                        className="rounded-md bg-law-accent px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-law-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-law-accent transition-colors"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </nav>

            {/* Mobile menu */}
            <div className={clsx(
                "lg:hidden",
                mobileMenuOpen ? "fixed inset-0 z-50" : "hidden"
            )}>
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" aria-hidden="true" />

                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm"
                >
                    <div className="flex items-center justify-between">
                        <Link to="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                            <span className="sr-only">Lawyer</span>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-law-accent flex items-center justify-center">
                                    <span className="text-white font-semibold text-lg">L</span>
                                </div>
                                <span className="text-xl font-bold text-law-dark">Lawyer</span>
                            </div>
                        </Link>
                        <button
                            type="button"
                            className="-m-2.5 rounded-md p-2.5 text-gray-700"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="sr-only">Cerrar menú</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10">
                            <div className="space-y-2 py-6">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="py-6">
                                <Link
                                    to="/iniciar-sesion"
                                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white bg-law-accent hover:bg-law-accent/90 text-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Iniciar sesión
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </header>
    );
}
