import { Link, Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Asistente", href: "/chat" },
    { name: "Licencias", href: "/licencias" },
    { name: "Acerca de", href: "/acerca" },
];

type NavbarProps = {
    user?: {
        id: string;
        email: string;
        profile?: {
            firstName?: string | null;
            lastName?: string | null;
            avatarUrl?: string | null;
        } | null;
    } | null;
};

export default function Navbar({ user }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const displayName = user?.profile?.firstName && user?.profile?.lastName
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user?.email?.split('@')[0] || 'Usuario';

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

                {/* User menu or Login button */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    {user ? (
                        <div className="relative">
                            <button
                                type="button"
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                {user.profile?.avatarUrl ? (
                                    <img
                                        className="h-6 w-6 rounded-full"
                                        src={user.profile.avatarUrl}
                                        alt={displayName}
                                    />
                                ) : (
                                    <div className="h-6 w-6 rounded-full bg-law-accent flex items-center justify-center">
                                        <span className="text-xs font-medium text-white">
                                            {displayName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <span>{displayName}</span>
                                <ChevronDownIcon className="h-4 w-4" />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                    <div className="py-1">
                                        <Link
                                            to="/perfil"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Mi perfil
                                        </Link>
                                        <Link
                                            to="/licencias"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Mis licencias
                                        </Link>
                                        <Form method="post" action="/logout">
                                            <button
                                                type="submit"
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Cerrar sesión
                                            </button>
                                        </Form>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-md bg-law-accent px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-law-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-law-accent transition-colors"
                        >
                            Iniciar sesión
                        </Link>
                    )}
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
                            {user && (
                                <div className="py-6">
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        {user.profile?.avatarUrl ? (
                                            <img
                                                className="h-8 w-8 rounded-full"
                                                src={user.profile.avatarUrl}
                                                alt={displayName}
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-law-accent flex items-center justify-center">
                                                <span className="text-sm font-medium text-white">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <span className="font-medium text-gray-900">{displayName}</span>
                                    </div>
                                </div>
                            )}

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

                                {user && (
                                    <>
                                        <Link
                                            to="/perfil"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Mi perfil
                                        </Link>
                                        <Link
                                            to="/licencias"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Mis licencias
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="py-6">
                                {user ? (
                                    <Form method="post" action="/logout">
                                        <button
                                            type="submit"
                                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white bg-red-600 hover:bg-red-700 text-center w-full"
                                        >
                                            Cerrar sesión
                                        </button>
                                    </Form>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white bg-law-accent hover:bg-law-accent/90 text-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Iniciar sesión
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </header>
    );
}
