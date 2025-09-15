import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { verifyLogin } from "~/lib/auth.server";
import { createUserSession, getUserId } from "~/lib/session.server";
import Layout from "~/components/Layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await getUserId(request);
    if (userId) return redirect("/");
    return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
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

    const user = await verifyLogin(email, password);

    if (!user) {
        return json(
            { errors: { email: "Email o contraseña incorrectos", password: null } },
            { status: 400 }
        );
    }

    return createUserSession({
        request,
        userId: user.id,
        remember: remember === "on" ? true : false,
        redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
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

    return (
        <Layout>
            <div className="flex min-h-full flex-col justify-center">
                <div className="mx-auto w-full max-w-md px-8">
                    <Form method="post" className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Iniciar sesión</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                ¿No tienes una cuenta?{" "}
                                <Link
                                    className="text-law-accent underline hover:text-law-accent/80"
                                    to={{
                                        pathname: "/signup",
                                        search: searchParams.toString(),
                                    }}
                                >
                                    Regístrate
                                </Link>
                            </p>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Correo electrónico
                            </label>
                            <div className="mt-1">
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
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-law-accent focus:outline-none focus:ring-law-accent"
                                />
                                {actionData?.errors?.email && (
                                    <div className="pt-1 text-red-700" id="email-error">
                                        {actionData.errors.email}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    ref={passwordRef}
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    aria-invalid={actionData?.errors?.password ? true : undefined}
                                    aria-describedby="password-error"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-law-accent focus:outline-none focus:ring-law-accent"
                                />
                                {actionData?.errors?.password && (
                                    <div className="pt-1 text-red-700" id="password-error">
                                        {actionData.errors.password}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember"
                                name="remember"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-law-accent focus:ring-law-accent"
                            />
                            <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                                Recordarme
                            </label>
                        </div>

                        <input type="hidden" name="redirectTo" value={redirectTo} />
                        <button
                            type="submit"
                            className="w-full rounded-md bg-law-accent px-4 py-2 text-white font-semibold hover:bg-law-accent/90 focus:outline-none focus:ring-2 focus:ring-law-accent focus:ring-offset-2 transition-colors"
                        >
                            Iniciar sesión
                        </button>
                    </Form>
                </div>
            </div>
        </Layout>
    );
}