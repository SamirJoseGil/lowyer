import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { buscarFAQs } from "~/lib/faq/faq-busqueda.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const categoria = url.searchParams.get("categoria") || undefined;
  const limite = parseInt(url.searchParams.get("limite") || "20");

  if (!query || query.length < 2) {
    return json({ resultados: [], mensaje: "Query muy corta" }, { status: 400 });
  }

  const ipAddress = request.headers.get("x-forwarded-for") || 
                   request.headers.get("x-real-ip") || 
                   "unknown";

  const resultados = await buscarFAQs({
    query,
    categoria,
    limite,
    ipAddress,
  });

  return json({ 
    resultados, 
    query,
    total: resultados.length 
  });
};
