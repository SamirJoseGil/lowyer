import { Link, Form, useLoaderData, useLocation } from "@remix-run/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bars3Icon, XMarkIcon, ChevronDownIcon, BellIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import TrialNotificationModal from "./TrialNotificationModal";
import { NotificationBell } from "./Notifications/NotificationBell";

const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Asistente", href: "/chat" },
    { name: "Licencias", href: "/licencias" },
    { name: "Sobre nosotros", href: "/acerca" },
];

type NavbarProps = {
    user?: {
        id: string;
        email: string;
        role?: {
            name: string;
        };
        profile?: {
            firstName?: string | null;
            lastName?: string | null;
            avatarUrl?: string | null;
        } | null;
    } | null;
    activeLicense?: {
        hoursRemaining: number;
        expiresAt?: Date | null;
        license: {
            name: string;
            type: string;
            hoursTotal: number;
        };
    } | null;
};

export default function Navbar({ user, activeLicense }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationModalOpen, setNotificationModalOpen] = useState(false);
    const location = useLocation();

    const displayName = user?.profile?.firstName && user?.profile?.lastName
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user?.email?.split('@')[0] || 'Usuario';

    const isChat = location.pathname === '/chat';
    const hasTrialNotification = activeLicense?.license.type === "trial" && (
        activeLicense.hoursRemaining <= 1 ||
        (activeLicense.expiresAt && new Date(activeLicense.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000)
    );

    const isAdmin = user?.role?.name === 'admin' || user?.role?.name === 'superadmin';
    const isLawyer = user?.role?.name === 'abogado';

    // Determinar la ruta del dashboard según el rol
    const getDashboardRoute = () => {
        if (!user) return '/';

        switch (user.role?.name) {
            case 'superadmin':
            case 'admin':
                return '/admin';
            case 'abogado':
                return '/abogado';
            default:
                return '/';
        }
    };

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-md">
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
                                <img
                                    src="/LogotipoEstudioJuridico.png"
                                    alt="Lawyer"
                                    className="h-10 w-auto object-contain"
                                />
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
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                    </div>

                    {/* Desktop navigation */}
                    <div className="hidden lg:flex lg:gap-x-12">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* User menu or Login button */}
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:space-x-4">
                        {user ? (
                            <>
                                {/* Notification Bell */}
                                <NotificationBell />

                                {/* Notification Bell for Trial Users */}
                                {isChat && hasTrialNotification && (
                                    <motion.button
                                        onClick={() => setNotificationModalOpen(true)}
                                        className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                        </svg>
                                        <motion.div
                                            className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [1, 0.8, 1]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <span className="text-xs text-white font-bold">!</span>
                                        </motion.div>
                                    </motion.button>
                                )}

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    >
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center shadow-md">
                                            <span className="text-sm font-medium text-white">
                                                {displayName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                            {displayName}
                                        </span>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </button>

                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 border border-blue-100">
                                            <div className="py-1">
                                                {/* Dashboard link for admins and lawyers */}
                                                {(isAdmin || isLawyer) && (
                                                    <>
                                                        <Link
                                                            to={getDashboardRoute()}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                            onClick={() => setUserMenuOpen(false)}
                                                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                                        >
                                                            <svg className="h-4 w-4 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                                            </svg>
                                                            <span className="font-medium">
                                                                {user.role?.name === 'superadmin' || user.role?.name === 'admin' ? 'Panel Admin' :
                                                                    user.role?.name === 'abogado' ? 'Panel Abogado' : 'Dashboard'}
                                                            </span>
                                                        </Link>
                                                        <div className="border-t border-gray-100 my-1"></div>
                                                    </>
                                                )}

                                                <Link
                                                    to="/perfil"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                                >
                                                    <svg className="h-4 w-4 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                    </svg>
                                                    Mi perfil
                                                </Link>

                                                <Link
                                                    to="/licencias"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                                >
                                                    <svg className="h-4 w-4 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                    </svg>
                                                    Mis licencias
                                                </Link>

                                                <div className="border-t border-gray-100 my-1"></div>

                                                <Form method="post" action="/logout">
                                                    <button
                                                        type="submit"
                                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                                                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                                    >
                                                        <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                                        </svg>
                                                        Cerrar sesión
                                                    </button>
                                                </Form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors border-2 border-black"
                                    style={{
                                        fontFamily: "Georgia, 'Times New Roman', serif",
                                        borderRadius: "2px"
                                    }}
                                >
                                    Crear cuenta
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Mobile menu */}
                <div className={clsx(
                    "lg:hidden",
                    mobileMenuOpen ? "fixed inset-0 z-50" : "hidden"
                )}>
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <Link to="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                                <img
                                    src="/LogotipoEstudioJuridico.png"
                                    alt="Lawyer"
                                    className="h-10 w-auto object-contain"
                                />
                            </Link>
                            <button
                                type="button"
                                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Cerrar menú</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-gray-100">
                                {user && (
                                    <div className="py-6">
                                        <div className="flex items-center gap-3 px-3 py-2">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
                                                <span className="text-sm font-medium text-white">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="font-medium text-gray-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                                                {displayName}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 py-6">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-blue-50"
                                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}

                                    {user && (isAdmin || isLawyer) && (
                                        <Link
                                            to={getDashboardRoute()}
                                            className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base font-semibold leading-7 text-blue-600 hover:bg-blue-50"
                                            onClick={() => setMobileMenuOpen(false)}
                                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                        >
                                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                            </svg>
                                            {user.role?.name === 'superadmin' || user.role?.name === 'admin' ? 'Panel Admin' :
                                                user.role?.name === 'abogado' ? 'Panel Abogado' : 'Dashboard'}
                                        </Link>
                                    )}

                                    {user && (
                                        <>
                                            <Link
                                                to="/perfil"
                                                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-blue-50"
                                                onClick={() => setMobileMenuOpen(false)}
                                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                            >
                                                Mi perfil
                                            </Link>
                                            <Link
                                                to="/licencias"
                                                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-blue-50"
                                                onClick={() => setMobileMenuOpen(false)}
                                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
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
                                                className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white bg-red-600 hover:bg-red-700"
                                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                            >
                                                Cerrar sesión
                                            </button>
                                        </Form>
                                    ) : (
                                        <div className="space-y-3">
                                            <Link
                                                to="/login"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-blue-50 text-center border-2 border-gray-300"
                                                onClick={() => setMobileMenuOpen(false)}
                                                style={{
                                                    fontFamily: "Georgia, 'Times New Roman', serif",
                                                    borderRadius: "2px"
                                                }}
                                            >
                                                Iniciar sesión
                                            </Link>
                                            <Link
                                                to="/signup"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white bg-black hover:bg-gray-800 text-center"
                                                onClick={() => setMobileMenuOpen(false)}
                                                style={{
                                                    fontFamily: "Georgia, 'Times New Roman', serif",
                                                    borderRadius: "2px"
                                                }}
                                            >
                                                Crear cuenta
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Trial Notification Modal */}
            <TrialNotificationModal
                activeLicense={activeLicense}
                isOpen={notificationModalOpen}
                onClose={() => setNotificationModalOpen(false)}
            />
        </>
    );
}
