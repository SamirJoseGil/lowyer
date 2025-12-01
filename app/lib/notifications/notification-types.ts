export const NOTIFICATION_TYPES = {
  // Mensajes
  NUEVO_MENSAJE: 'nuevo_mensaje',
  MENSAJE_LEIDO: 'mensaje_leido',
  
  // Casos/Sesiones
  CASO_ASIGNADO: 'caso_asignado',
  CASO_ACEPTADO: 'caso_aceptado',
  CASO_COMPLETADO: 'caso_completado',
  
  // Licencias
  LICENCIA_EXPIRA: 'licencia_expira',
  LICENCIA_EXPIRADA: 'licencia_expirada',
  HORAS_BAJAS: 'horas_bajas',
  
  // Rating
  RATING_REQUEST: 'rating_request',
  RATING_RECEIVED: 'rating_received',
  
  // Sistema
  SYSTEM_UPDATE: 'system_update',
  MAINTENANCE: 'maintenance',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export interface NotificationData {
  userId: string;
  tipo: NotificationType;
  titulo: string;
  mensaje: string;
  data?: any;
  actionUrl?: string;
  prioridad?: 'baja' | 'normal' | 'alta' | 'urgente';
}
