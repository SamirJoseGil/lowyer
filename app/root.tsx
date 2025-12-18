// app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import "./tailwind.css";
import { getEnv } from "./env.server";
import { getUser } from "~/lib/auth.server";
import { getUserActiveLicense } from "~/lib/licenses.server";
import Layout from "~/components/Layout";
import chatStyles from "~/styles/chat.css?url";
import markdownStyles from "~/styles/markdown.css?url";
import { getSecurityHeaders } from "~/middleware/security-headers";
import CookieBanner from "~/components/Consent/CookieBanner";

export const meta: MetaFunction = () => {
  return [
    { title: "Lawyer - Tu Asistente Legal Inteligente" },
    {
      name: "description",
      content:
        "Asistente legal basado en IA para resolver tus consultas jurídicas de forma rápida y sencilla.",
    },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { name: "theme-color", content: "#0369a1" },
  ];
};

// 🔗 Cargar fuentes y estilos
export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "icon", href: "/favicon.ico" },
  { rel: "stylesheet", href: chatStyles },
  { rel: "stylesheet", href: markdownStyles },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  let activeLicense = null;

  if (user) {
    const license = await getUserActiveLicense(user.id);
    if (license) {
      activeLicense = {
        ...license,
        hoursRemaining: Number(license.hoursRemaining),
        license: {
          ...license.license,
          hoursTotal: Number(license.license.hoursTotal),
          priceCents: Number(license.license.priceCents)
        }
      };
    }
  }

  // Asegurar que el rol se incluye en la respuesta
  return json({
    user: user ? {
      ...user,
      role: user.role // Asegurar que el rol está incluido
    } : null,
    activeLicense
  });
};

export const headers = () => {
  return getSecurityHeaders();
};

// 📌 App principal
export default function App() {
  const { user, activeLicense } = useLoaderData<typeof loader>();

  // Convert expiresAt back to Date if present
  const hydratedActiveLicense = activeLicense
    ? {
      ...activeLicense,
      expiresAt: activeLicense.expiresAt ? new Date(activeLicense.expiresAt) : null,
    }
    : null;

  return (
    <html lang="es" className="h-full scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* 🔔 NUEVO: Permitir notificaciones del navegador */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className="h-full bg-white">
        <Layout user={user} activeLicense={hydratedActiveLicense}>
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
        <CookieBanner />
      </body>
    </html>
  );
}