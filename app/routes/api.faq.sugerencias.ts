import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getSugerenciasBusqueda } from "~/lib/faq/faq-busqueda.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";

  if (query.length < 2) {
    return json({ sugerencias: [] });
  }

  const sugerencias = await getSugerenciasBusqueda(query, 5);

  return json({ sugerencias });
};
