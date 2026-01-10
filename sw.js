
// Service Worker desativado para evitar conflitos de cache no ambiente de desenvolvimento
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
