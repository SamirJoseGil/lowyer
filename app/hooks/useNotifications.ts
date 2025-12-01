import { useEffect, useState, useCallback } from 'react';
import { useFetcher } from '@remix-run/react';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const fetcher = useFetcher();
  
  // Cargar notificaciones iniciales
  useEffect(() => {
    fetch('/api/notifications/list')
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      })
      .catch(err => console.error('Error loading notifications:', err));
  }, []);
  
  // Conectar SSE
  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/stream');
    
    eventSource.onopen = () => {
      console.log('✅ SSE connected');
      setIsConnected(true);
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          console.log('📡 Notifications stream connected');
          return;
        }
        
        // Nueva notificación recibida
        console.log('🔔 New notification received:', data.titulo);
        setNotifications(prev => [data, ...prev]);
        
        if (!data.leida) {
          setUnreadCount(prev => prev + 1);
          
          // Mostrar notificación del navegador si está permitido
          if (Notification.permission === 'granted') {
            new Notification(data.titulo, {
              body: data.mensaje,
              icon: '/LogotipoEstudioJuridico.png'
            });
          }
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
      setIsConnected(false);
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);
  
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, leida: true, readAt: new Date() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);
  
  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      });
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, leida: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);
  
  // Solicitar permiso para notificaciones del navegador
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);
  
  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    requestPermission
  };
}
