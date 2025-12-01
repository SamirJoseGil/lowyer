import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { isLawyer } from "~/lib/permissions.server";
import { db } from "~/lib/db.server";
import { motion } from "framer-motion";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  if (!isLawyer(user)) {
    throw redirect("/dashboard");
  }
  
  const lawyer = await db.lawyer.findUnique({
    where: { userId: user.id },
    include: {
      asignaciones: {
        where: {
          status: {
            in: ['pendiente', 'aceptado']
          }
        },
        include: {
          chatSession: {
            include: {
              user: {
                include: {
                  profile: true
                }
              }
            }
          }
        },
        orderBy: {
          assignedAt: 'desc'
        }
      },
      reviews: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      },
      _count: {
        select: {
          chatSessions: true,
          reviews: true
        }
      }
    }
  });
  
  if (!lawyer) {
    throw new Response("Abogado no encontrado", { status: 404 });
  }
  
  const avgRating = lawyer.reviews.length > 0
    ? lawyer.reviews.reduce((sum, r) => sum + r.rating, 0) / lawyer.reviews.length
    : 0;
  
  const pendingCases = lawyer.asignaciones.filter(c => c.status === 'pendiente');
  const activeCases = lawyer.asignaciones.filter(c => c.status === 'aceptado');
  
  return json({
    user,
    lawyer,
    stats: {
      totalCases: lawyer._count.chatSessions,
      avgRating,
      totalReviews: lawyer._count.reviews,
      pendingCount: pendingCases.length,
      activeCount: activeCases.length
    },
    pendingCases,
    activeCases
  });
}

export async function action({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  if (!isLawyer(user)) {
    return json({ error: "No autorizado" }, { status: 403 });
  }
  
  const formData = await request.formData();
  const action = formData.get("action");
  const chatSessionId = formData.get("chatSessionId")?.toString();
  
  if (!chatSessionId) {
    return json({ error: "ID de sesión requerido" }, { status: 400 });
  }
  
  const lawyer = await db.lawyer.findUnique({
    where: { userId: user.id }
  });
  
  if (!lawyer) {
    return json({ error: "Abogado no encontrado" }, { status: 404 });
  }
  
  try {
    switch (action) {
      case "accept-case": {
        await db.asignacionCaso.update({
          where: { chatSessionId },
          data: {
            status: 'aceptado',
            acceptedAt: new Date()
          }
        });
        
        return json({ success: true, message: "Caso aceptado" });
      }
      
      case "reject-case": {
        const reason = formData.get("reason")?.toString() || "Sin razón especificada";
        
        await db.asignacionCaso.update({
          where: { chatSessionId },
          data: {
            status: 'rechazado',
            rejectionReason: reason
          }
        });
        
        // TODO: Reasignar a otro abogado
        
        return json({ success: true, message: "Caso rechazado" });
      }
      
      case "complete-case": {
        await db.asignacionCaso.update({
          where: { chatSessionId },
          data: {
            status: 'completado',
            completedAt: new Date()
          }
        });
        
        await db.chatSession.update({
          where: { id: chatSessionId },
          data: {
            status: 'closed',
            endedAt: new Date()
          }
        });
        
        return json({ success: true, message: "Caso completado" });
      }
      
      default:
        return json({ error: "Acción no válida" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error en acción de abogado:", error);
    return json({ error: "Error al procesar acción" }, { status: 500 });
  }
}

export default function AbogadoDashboard() {
  const { lawyer, stats, pendingCases, activeCases } = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/20 to-emerald-50/10">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Dashboard de Abogado
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus casos y consultas legales
          </p>
        </motion.div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-2 border-yellow-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Casos Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pendingCount}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Casos Activos</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.activeCount}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💼</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Atendidos</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalCases}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rating Promedio</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.avgRating.toFixed(1)} ⭐
                </p>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.totalReviews} reseñas
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Casos Pendientes */}
        {pendingCases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 border-2 border-yellow-100 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              🔔 Casos Pendientes de Aceptación
            </h2>
            
            <div className="space-y-4">
              {pendingCases.map((assignment) => (
                <div key={assignment.id} className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                          {assignment.chatSession.user.profile?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {assignment.chatSession.user.profile?.firstName || 'Usuario'} necesita ayuda
                          </p>
                          <p className="text-sm text-gray-600">
                            Asignado {new Date(assignment.assignedAt).toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Form method="post">
                        <input type="hidden" name="action" value="accept-case" />
                        <input type="hidden" name="chatSessionId" value={assignment.chatSessionId} />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                        >
                          ✓ Aceptar
                        </button>
                      </Form>
                      
                      <button
                        onClick={() => {/* TODO: Modal de rechazo */}}
                        className="px-4 py-2 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-600 hover:text-white"
                      >
                        ✗ Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Casos Activos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            💼 Casos Activos
          </h2>
          
          {activeCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCases.map((assignment) => (
                <Link
                  key={assignment.id}
                  to={`/abogado/chat/${assignment.chatSessionId}`}
                  className="border-2 border-green-200 rounded-lg p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-12 w-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold">
                      {assignment.chatSession.user.profile?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {assignment.chatSession.user.profile?.firstName || 'Usuario'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {assignment.chatSession.user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Aceptado {new Date(assignment.acceptedAt!).toLocaleDateString('es-CO')}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Activo
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No tienes casos activos en este momento</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
