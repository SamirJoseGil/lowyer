import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getUser } from "~/lib/auth.server";
import Layout from "~/components/Layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  return json({ user });
};

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <Layout user={user}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Bienvenido a Lawyer
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Tu asistente legal inteligente para resolver consultas jurídicas de
            forma rápida y sencilla.
          </p>

          {user ? (
            <div className="mt-10">
              <p className="text-xl text-gray-700">
                ¡Hola {user.profile?.firstName || user.email.split("@")[0]}!
                Bienvenido de vuelta.
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-6">
                <Link
                  to="/dashboard"
                  className="rounded-md bg-law-accent px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-law-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-law-accent transition-colors"
                >
                  Ir al Dashboard
                </Link>
                <Link
                  to="/chat"
                  className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-colors"
                >
                  Iniciar Chat
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/signup"
                className="rounded-md bg-law-accent px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-law-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-law-accent transition-colors"
              >
                Comenzar gratis
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-law-accent"
              >
                Iniciar sesión <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </div>

        {/* Features section */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-md bg-law-accent flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-16.5 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Asistente IA
              </h3>
              <p className="mt-2 text-gray-600">
                Consultas legales instantáneas con inteligencia artificial
                especializada
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-md bg-law-accent flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Abogados Expertos
              </h3>
              <p className="mt-2 text-gray-600">
                Conecta con abogados certificados para casos complejos
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-md bg-law-accent flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Seguro y Confiable
              </h3>
              <p className="mt-2 text-gray-600">
                Protección de datos y confidencialidad garantizada
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}