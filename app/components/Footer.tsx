import { Link } from "@remix-run/react";
import { motion } from "framer-motion";

const navigation = {
    main: [
        { name: 'Inicio', href: '/' },
        { name: 'Asistente', href: '/chat' },
        { name: 'Licencias', href: '/licencias' },
        { name: 'Acerca de', href: '/acerca' },
    ],
    legal: [
        { name: 'Términos', href: '/terminos' },
        { name: 'Privacidad', href: '/privacidad' },
    ],
    social: [
        {
            name: 'Facebook',
            href: '#',
            icon: (props: React.SVGProps<SVGSVGElement>) => (
                <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
            ),
        },
        {
            name: 'Twitter',
            href: '#',
            icon: (props: React.SVGProps<SVGSVGElement>) => (
                <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
            ),
        },
        {
            name: 'LinkedIn',
            href: '#',
            icon: (props: React.SVGProps<SVGSVGElement>) => (
                <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                    <path fillRule="evenodd" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" clipRule="evenodd" />
                </svg>
            ),
        },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-white border-t-2 border-blue-200 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
                {/* Logo section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 text-center"
                >
                    <img
                        src="/LogotipoEstudioJuridico.png"
                        alt="Lawyer"
                        className="h-16 w-auto mx-auto mb-4 object-contain"
                    />
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "20%" }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-0.5 bg-blue-300 mx-auto"
                    />
                </motion.div>

                {/* Navigation */}
                <motion.nav
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-4">
                        {navigation.main.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className="flex justify-center gap-x-6">
                        {navigation.legal.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </motion.nav>

                {/* Decorative line */}
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent mx-auto mb-8"
                />

                {/* Social links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex justify-center space-x-8 mb-8"
                >
                    {navigation.social.map((item) => (
                        <motion.a
                            key={item.name}
                            href={item.href}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <span className="sr-only">{item.name}</span>
                            <item.icon className="h-6 w-6" aria-hidden="true" />
                        </motion.a>
                    ))}
                </motion.div>

                {/* Copyright */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-center"
                >
                    <p className="text-sm text-gray-500 italic"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                        &copy; {new Date().getFullYear()} Lawyer. Democratizando el acceso a la justicia en Colombia.
                    </p>
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "15%" }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="h-0.5 bg-blue-400 mx-auto mt-4"
                    />
                </motion.div>
            </div>

            {/* Decorative quote marks */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-4 left-4 text-4xl text-blue-100 font-bold"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
                "
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute top-4 right-4 text-4xl text-cyan-100 font-bold"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
                "
            </motion.div>
        </footer>
    );
}
