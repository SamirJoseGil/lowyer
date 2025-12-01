import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { getAllNotifications, getUnreadCount } from "~/lib/notifications/notification.server";
import { motion } from "framer-motion";
import { useNotifications } from "~/hooks/useNotifications";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  const [notifications, unreadCount] = await Promise.all([
    getAllNotifications(user.id, 100),
    getUnreadCount(user.id)
  ]);
  
  return json({ user, notifications, unreadCount });
}

export default function NotificacionesPage() {
  const { notifications: initialNotifications } = useLoaderData<typeof loader>();
  const { markAsRead, markAllAsRead } = useNotifications();
  
  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'nuevo_mensaje': return '💬';
      case 'caso_asignado': return '📋';
      case 'licencia_expira': return '⏰';
      case 'horas_bajas': return '⚠️';
      default: return '🔔';
    }
  };
  
  const getPriorityBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-blue-50/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Notificaciones
              </h1>
              <p className="text-gray-600 mt-1">
                Mantente al tanto de todas tus actualizaciones
              </p>
            </div>
            
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
            >
              Marcar todas como leídas
            </button>
          </div>
          
          <div className="h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full" />
        </motion.div>
        
        {/* Lista de notificaciones */}
        <div className="space-y-4">
          {initialNotifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl shadow-lg border-2 p-6 ${
                !notif.leida ? 'border-purple-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start space-x-4">
                <span className="text-3xl">{getNotificationIcon(notif.tipo)}</span>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {notif.titulo}
                      </h3>
                      <p className="text-gray-600 mt-1">{notif.mensaje}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(notif.prioridad)}`}>
                        {notif.prioridad}
                      </span>
                      {!notif.leida && (
                        <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-400">
                      {new Date(notif.createdAt).toLocaleString('es-CO')}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      {!notif.leida && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-sm text-purple-600 hover:text-purple-800 font-semibold"
                        >
                          Marcar como leída
                        </button>
                      )}
                      
                      {notif.actionUrl && (
                        <Link
                          to={notif.actionUrl}
                          className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700"
                        >
                          Ver →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {initialNotifications.length === 0 && (
            <div className="text-center py-16">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-xl font-semibold text-gray-600">No tienes notificaciones</p>
              <p className="text-gray-500 mt-2">Cuando recibas notificaciones, aparecerán aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
