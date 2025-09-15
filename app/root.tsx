// app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";

import "./tailwind.css";
import { getEnv } from "./env.server";

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
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-white">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// 📌 App principal
export default function App() {
  return <Outlet />;
}