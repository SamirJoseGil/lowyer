import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { createUser, getUserByEmail } from "~/lib/auth.server";
import { createUserSession, getUserId } from "~/lib/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await getUserId(request);
    if (userId) return redirect("/");
    return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const redirectTo = formData.get("redirectTo");

    if (!email || typeof email !== "string") {
        return json(
            { errors: { email: "El email es requerido", password: null, confirmPassword: null } },
            { status: 400 }
        );
    }

    if (!password || typeof password !== "string") {
        return json(
            { errors: { email: null, password: "La contraseña es requerida", confirmPassword: null } },
            { status: 400 }
        );
    }

    if (password.length < 8) {
        return json(
            { errors: { email: null, password: "La contraseña debe tener al menos 8 caracteres", confirmPassword: null } },
            { status: 400 }
        );
    }

    if (password !== confirmPassword) {
        return json(
            { errors: { email: null, password: null, confirmPassword: "Las contraseñas no coinciden" } },
            { status: 400 }
        );
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return json(
            { errors: { email: "Ya existe un usuario con este email", password: null, confirmPassword: null } },
            { status: 400 }
        );
    }

    try {
        const user = await createUser({ email, password });

        return createUserSession({
            request,
            userId: user.id,
            remember: false,
            redirectTo: "/chat", // Cambiar redirect por defecto a /chat
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return json(
            { errors: { email: "Error al crear la cuenta. Inténtalo de nuevo.", password: null, confirmPassword: null } },
            { status: 500 }
        );
    }
};

export const meta: MetaFunction = () => [{ title: "Registro - Lawyer" }];

export default function signup() {
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/";
    const actionData = useActionData<typeof action>();
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);

    const loadingSteps = [
        { message: "Creando tu cuenta...", icon: "👤" },
        { message: "Asignando rol de usuario...", icon: "🎭" },
        { message: "Reclamando trial gratuito...", icon: "🎫" },
        { message: "Configurando perfil...", icon: "⚙️" },
        { message: "¡Todo listo! Redirigiendo...", icon: "✅" }
    ];

    // Simular progreso de creación
    const handleFormSubmit = (e: React.FormEvent) => {
        setIsCreating(true);
        setLoadingStep(0);

        // Simular pasos de creación
        const interval = setInterval(() => {
            setLoadingStep(prev => {
                if (prev >= loadingSteps.length - 1) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 1000);
    };

    useEffect(() => {
        if (actionData?.errors?.email) {
            emailRef.current?.focus();
        } else if (actionData?.errors?.password) {
            passwordRef.current?.focus();
        } else if (actionData?.errors?.confirmPassword) {
            confirmPasswordRef.current?.focus();
        }
    }, [actionData]);

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    const formVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                delay: 0.2,
            },
        },
    };

    // Loading Screen Component
    if (isCreating) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full mx-4"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-8">
                        {/* Logo animado */}
                        <motion.div
                            className="flex justify-center mb-6"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                            </div>
                        </motion.div>

                        {/* Título */}
                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            Preparando tu cuenta
                        </h2>
                        <p className="text-center text-gray-600 mb-8">
                            Solo tomará unos segundos...
                        </p>

                        {/* Steps */}
                        <div className="space-y-4">
                            {loadingSteps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{
                                        opacity: index <= loadingStep ? 1 : 0.3,
                                        x: 0
                                    }}
                                    transition={{ delay: index * 0.2 }}
                                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                                        index === loadingStep
                                            ? 'bg-blue-50 border-2 border-blue-200'
                                            : index < loadingStep
                                            ? 'bg-green-50 border-2 border-green-200'
                                            : 'bg-gray-50 border-2 border-gray-100'
                                    }`}
                                >
                                    <span className="text-2xl">{step.icon}</span>
                                    <span className={`flex-1 font-medium ${
                                        index === loadingStep
                                            ? 'text-blue-900'
                                            : index < loadingStep
                                            ? 'text-green-900'
                                            : 'text-gray-500'
                                    }`}>
                                        {step.message}
                                    </span>
                                    {index < loadingStep && (
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                        </svg>
                                    )}
                                    {index === loadingStep && (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <motion.div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <p className="text-center text-sm text-gray-500 mt-2">
                                {Math.round(((loadingStep + 1) / loadingSteps.length) * 100)}% completado
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                {/* Organic Background - Azul Pastel */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 z-0"
                >
                    <motion.div
                        animate={{
                            rotate: [0, -3, 2, -1, 0],
                            scale: [1, 1.05, 0.95, 1.02, 1],
                        }}
                        transition={{
                            duration: 28,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute top-32 left-16 w-64 h-64 bg-gradient-to-br from-blue-50/40 to-cyan-100/30 rounded-full blur-3xl"
                        style={{
                            clipPath:
                                "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        }}
                    />

                    <motion.div
                        animate={{
                            x: [0, 20, -15, 10, 0],
                            y: [0, -10, 20, -5, 0],
                        }}
                        transition={{
                            duration: 32,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute bottom-40 right-20 w-80 h-48 bg-gradient-to-r from-sky-50/30 to-blue-100/20 blur-2xl transform rotate-12"
                        style={{
                            borderRadius: "50% 30% 70% 20%",
                        }}
                    />
                </motion.div>

                <motion.div
                    className="max-w-md w-full space-y-8 relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex justify-center mb-6"
                        >
                            <img
                                src="/LogotipoEstudioJuridico.png"
                                alt="Lawyer"
                                className="h-20 w-auto object-contain"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-0.5 bg-blue-300 mb-6"
                        />

                        <h2
                            className="text-3xl font-bold text-gray-900"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                        >
                            Crear cuenta
                        </h2>
                        <p
                            className="mt-2 text-gray-600"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                        >
                            ¿Ya tienes una cuenta?{" "}
                            <Link
                                className="font-medium text-blue-600 hover:text-cyan-600 transition-colors duration-300"
                                to={{
                                    pathname: "/login",
                                    search: searchParams.toString(),
                                }}
                            >
                                Inicia sesión aquí
                            </Link>
                        </p>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "40%" }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="h-0.5 bg-blue-400 mx-auto mt-4"
                        />
                    </div>

                    <motion.div
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-blue-100 shadow-2xl"
                        style={{ borderRadius: "2px" }}
                    >
                        <Form method="post" onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Correo electrónico
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg
                                                className="h-5 w-5 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            ref={emailRef}
                                            id="email"
                                            required
                                            autoFocus={true}
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            aria-invalid={actionData?.errors?.email ? true : undefined}
                                            aria-describedby="email-error"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                    {actionData?.errors?.email && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-2 text-red-600 text-sm flex items-center"
                                            id="email-error"
                                        >
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {actionData.errors.email}
                                        </motion.div>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg
                                                className="h-5 w-5 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            ref={passwordRef}
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                            aria-invalid={actionData?.errors?.password ? true : undefined}
                                            aria-describedby="password-error"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {actionData?.errors?.password && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-2 text-red-600 text-sm flex items-center"
                                            id="password-error"
                                        >
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {actionData.errors.password}
                                        </motion.div>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirmar contraseña
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg
                                                className="h-5 w-5 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            ref={confirmPasswordRef}
                                            name="confirmPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            aria-invalid={actionData?.errors?.confirmPassword ? true : undefined}
                                            aria-describedby="confirm-password-error"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {actionData?.errors?.confirmPassword && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-2 text-red-600 text-sm flex items-center"
                                            id="confirm-password-error"
                                        >
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {actionData.errors.confirmPassword}
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>

                            <input type="hidden" name="redirectTo" value={redirectTo} />

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                <motion.button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    style={{
                                        borderRadius: "2px",
                                        fontFamily: "Georgia, 'Times New Roman', serif",
                                        letterSpacing: "0.05em",
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Crear cuenta
                                </motion.button>
                            </motion.div>
                        </Form>

                        {/* Beneficios del registro */}
                        <motion.div
                            className="mt-6 pt-6 border-t border-blue-200"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <p
                                className="text-sm font-medium text-gray-700 mb-3"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                            >
                                Al crear tu cuenta obtienes:
                            </p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center">
                                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Trial gratuito de 2 horas
                                </li>
                                <li className="flex items-center">
                                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Acceso a IA legal especializada
                                </li>
                                <li className="flex items-center">
                                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Conexión con abogados certificados
                                </li>
                            </ul>
                        </motion.div>
                    </motion.div>

                    {/* Enlaces adicionales */}
                    <motion.div
                        className="text-center space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                    >
                        <p className="text-sm text-gray-600">
                            Al crear una cuenta, aceptas nuestros{" "}
                            <Link to="/terminos" className="text-purple-600 hover:text-blue-600 transition-colors">
                                Términos de Servicio
                            </Link>{" "}
                            y{" "}
                            <Link to="/privacidad" className="text-purple-600 hover:text-blue-600 transition-colors">
                                Política de Privacidad
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}