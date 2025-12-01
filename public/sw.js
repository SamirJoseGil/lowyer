// Service Worker para notificaciones push (opcional)
self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
});

self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/LogotipoEstudioJuridico.png',
    badge: '/LogotipoEstudioJuridico.png'
  };

  event.waitUntil(
    self.registration.showNotification('Lawyer Platform', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
