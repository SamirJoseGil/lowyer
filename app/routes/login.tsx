import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { verifyLogin } from "~/lib/auth.server";
import { createUserSession, getUserId } from "~/lib/session.server";
import { enforceRateLimit } from "~/lib/security/rate-limiting.server";
import { isAccountLocked, recordLoginAttempt } from "~/lib/security/brute-force.server";
import { logAuditEvent } from "~/lib/security/audit-log.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await getUserId(request);
    if (userId) return redirect("/");
    return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
    // Rate limiting
    await enforceRateLimit(request, "LOGIN");
    
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const redirectTo = formData.get("redirectTo");
    const remember = formData.get("remember");

    if (!email || typeof email !== "string") {
        return json(
            { errors: { email: "El email es requerido", password: null } },
            { status: 400 }
        );
    }

    if (!password || typeof password !== "string") {
        return json(
            { errors: { email: null, password: "La contraseña es requerida" } },
            { status: 400 }
        );
    }

    // Verificar si la cuenta está bloqueada
    const lockStatus = await isAccountLocked(email);
    if (lockStatus.locked) {
        return json(
            { 
                errors: { 
                    email: `Cuenta temporalmente bloqueada. Intenta de nuevo en ${lockStatus.remainingTime} minutos.`, 
                    password: null 
                } 
            },
            { status: 403 }
        );
    }
    
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
    
    const user = await verifyLogin(email, password);

    if (!user) {
        // Registrar intento fallido
        await recordLoginAttempt(email, ipAddress, false);
        
        return json(
            { errors: { email: "Email o contraseña incorrectos", password: null } },
            { status: 400 }
        );
    }
    
    // Registrar intento exitoso y limpiar intentos fallidos
    await recordLoginAttempt(email, ipAddress, true);
    await logAuditEvent(user.id, "user.login", { ipAddress });

    return createUserSession({
        request,
        userId: user.id,
        remember: remember === "on" ? true : false,
        redirectTo: "/chat",
    });
};

export const meta: MetaFunction = () => [{ title: "Iniciar Sesión - Lawyer" }];

export default function IniciarSesion() {
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/";
    const actionData = useActionData<typeof action>();
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (actionData?.errors?.email) {
            emailRef.current?.focus();
        } else if (actionData?.errors?.password) {
            passwordRef.current?.focus();
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

    return (
        <div className="flex min-h-screen flex-col">
            <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
                            scale: [1, 1.02, 0.98, 1.01, 1],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-50/40 to-cyan-100/20 rounded-full blur-3xl"
                        style={{
                            clipPath:
                                "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                        }}
                    />

                    <motion.div
                        animate={{
                            x: [0, 15, -10, 5, 0],
                            y: [0, -10, 15, -5, 0],
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute bottom-32 left-20 w-96 h-48 bg-gradient-to-r from-sky-50/30 to-blue-100/20 blur-2xl transform rotate-12"
                        style={{
                            borderRadius: "60% 40% 30% 70%",
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
                            style={{
                                fontFamily: "Georgia, 'Times New Roman', serif",
                            }}
                        >
                            Iniciar sesión
                        </h2>
                        <p
                            className="mt-2 text-gray-600"
                            style={{
                                fontFamily: "Georgia, 'Times New Roman', serif",
                            }}
                        >
                            ¿No tienes una cuenta?{" "}
                            <Link
                                className="font-medium text-blue-600 hover:text-cyan-600 transition-colors duration-300"
                                to={{
                                    pathname: "/signup",
                                    search: searchParams.toString(),
                                }}
                            >
                                Regístrate aquí
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
                        <Form method="post" className="space-y-6">
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-semibold text-gray-700 mb-2"
                                        style={{
                                            fontFamily: "Georgia, 'Times New Roman', serif",
                                        }}
                                    >
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
                                            aria-invalid={
                                                actionData?.errors?.email
                                                    ? true
                                                    : undefined
                                            }
                                            aria-describedby="email-error"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
                                            <svg
                                                className="h-4 w-4 mr-1"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
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
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-semibold text-gray-700 mb-2"
                                    >
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
                                            autoComplete="current-password"
                                            aria-invalid={
                                                actionData?.errors?.password
                                                    ? true
                                                    : undefined
                                            }
                                            aria-describedby="password-error"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
                                            <svg
                                                className="h-4 w-4 mr-1"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
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
                                    className="flex items-center justify-between"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <div className="flex items-center">
                                        <input
                                            id="remember"
                                            name="remember"
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label
                                            htmlFor="remember"
                                            className="ml-3 text-sm text-gray-700"
                                        >
                                            Recordarme
                                        </label>
                                    </div>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-blue-600 hover:text-purple-600 transition-colors duration-300"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
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
                                    Iniciar sesión
                                </motion.button>
                            </motion.div>
                        </Form>
                    </motion.div>

                    {/* Enlaces adicionales */}
                    <motion.div
                        className="text-center space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <p className="text-sm text-gray-600">
                            Al iniciar sesión, aceptas nuestros{" "}
                            <Link
                                to="/terminos"
                                className="text-blue-600 hover:text-purple-600 transition-colors"
                            >
                                Términos de Servicio
                            </Link>{" "}
                            y{" "}
                            <Link
                                to="/privacidad"
                                className="text-blue-600 hover:text-purple-600 transition-colors"
                            >
                                Política de Privacidad
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}