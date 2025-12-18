import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/lib/auth.server";
import { isSuperAdmin, isAdmin } from "~/lib/permissions.server";
import { 
  generateUserReport, 
  generateLawyerReport, 
  generateFinancialReport,
  generateFAQReport 
} from "~/lib/exports/report-generator.server";
import { generateCSV } from "~/lib/exports/csv-generator";
import { subDays } from "date-fns";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  
  if (!isSuperAdmin(user) && !isAdmin(user)) {
    return new Response("Unauthorized", { status: 403 });
  }

  const url = new URL(request.url);
  const reportType = url.searchParams.get("type");
  const format = url.searchParams.get("format") || "csv";
  const startDateParam = url.searchParams.get("startDate");
  const endDateParam = url.searchParams.get("endDate");

  // Defaults: últimos 30 días
  const endDate = endDateParam ? new Date(endDateParam) : new Date();
  const startDate = startDateParam ? new Date(startDateParam) : subDays(endDate, 30);

  let data: any[] = [];
  let filename = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}`;

  try {
    switch (reportType) {
      case 'users':
        data = await generateUserReport(startDate, endDate);
        filename = `usuarios_${filename}`;
        break;
      
      case 'lawyers':
        data = await generateLawyerReport(startDate, endDate);
        filename = `abogados_${filename}`;
        break;
      
      case 'financial':
        data = await generateFinancialReport(startDate, endDate);
        filename = `financiero_${filename}`;
        break;
      
      case 'faq':
        data = await generateFAQReport(startDate, endDate);
        filename = `faqs_${filename}`;
        break;
      
      default:
        return new Response("Tipo de reporte no válido", { status: 400 });
    }

    if (format === 'csv') {
      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      const csvContent = generateCSV(data, headers);
      
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv;charset=utf-8;',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      });
    } else if (format === 'json') {
      return new Response(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`
        }
      });
    }

    return new Response("Formato no soportado", { status: 400 });
    
  } catch (error) {
    console.error("Error generando reporte:", error);
    return new Response("Error al generar reporte", { status: 500 });
  }
};
