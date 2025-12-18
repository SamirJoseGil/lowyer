import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useMatches } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin, isAdmin } from "~/lib/permissions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user) && !isAdmin(user)) {
    throw new Response("Unauthorized", { status: 403 });
  }

  return json({ user });
};

export default function AdminFAQLayout() {
  const matches = useMatches();
  const isIndexRoute = matches[matches.length - 1].id === "routes/admin.faq._index";

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header - Solo mostrar en rutas que no sean el editor */}
      {!matches.some(m => m.id.includes('$id.editar')) && (
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Gestión de FAQs
          </h1>
          <p className="text-gray-600">
            Panel administrativo para gestionar preguntas frecuentes
          </p>
        </div>
      )}

      {/* Outlet para renderizar las subrutas */}
      <Outlet />
    </div>
  );
}
