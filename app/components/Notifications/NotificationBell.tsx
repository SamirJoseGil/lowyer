import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { useNotifications } from '~/hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } = useNotifications();
  
  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'nuevo_mensaje': return '💬';
      case 'caso_asignado': return '📋';
      case 'licencia_expira': return '⏰';
      case 'horas_bajas': return '⚠️';
      default: return '🔔';
    }
  };
  
  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'border-l-4 border-red-500';
      case 'alta': return 'border-l-4 border-orange-500';
      case 'normal': return 'border-l-4 border-blue-500';
      default: return 'border-l-4 border-gray-300';
    }
  };
  
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return notifDate.toLocaleDateString('es-CO');
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
        aria-label="Notificaciones"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        
        {/* Badge con contador */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
        
        {/* Indicador de conexión */}
        {isConnected && (
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel de notificaciones */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border-2 border-gray-100 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-purple-600 hover:text-purple-800 font-semibold"
                    >
                      Marcar todas como leídas
                    </button>
                  )}
                </div>
              </div>
              
              {/* Lista de notificaciones */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div>
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          !notif.leida ? 'bg-blue-50' : ''
                        } ${getPriorityColor(notif.prioridad)}`}
                        onClick={() => {
                          if (!notif.leida) {
                            markAsRead(notif.id);
                          }
                          if (notif.actionUrl) {
                            setIsOpen(false);
                            window.location.href = notif.actionUrl;
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl flex-shrink-0">
                            {getNotificationIcon(notif.tipo)}
                          </span>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="font-semibold text-gray-900 text-sm">
                                {notif.titulo}
                              </p>
                              {!notif.leida && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                              )}
                            </div>
                            
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {notif.mensaje}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-gray-400 text-xs">
                                {formatTimeAgo(notif.createdAt)}
                              </p>
                              
                              {notif.actionUrl && (
                                <span className="text-xs text-purple-600 font-semibold">
                                  Ver →
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="font-semibold">No tienes notificaciones</p>
                    <p className="text-sm mt-1">Te avisaremos cuando haya algo nuevo</p>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <Link
                    to="/notificaciones"
                    onClick={() => setIsOpen(false)}
                    className="block text-center text-sm text-purple-600 hover:text-purple-800 font-semibold"
                  >
                    Ver todas las notificaciones
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
