// ════════════════════════════════════════════════════════════
// firebase-messaging-sw.js — Service Worker FCM
// Portail des Puissances — M.I.E.L. Zinvié
//
// 📁 DÉPLOIEMENT : placer ce fichier à la RACINE de votre site
//    (même dossier que index_communaute_v9.html)
//    Exemple : https://monsite.com/firebase-messaging-sw.js
//
// ⚠ Si ce fichier n'est pas à la racine, les notifications
//    en arrière-plan ne fonctionneront PAS.
// ════════════════════════════════════════════════════════════

// ── Importer Firebase SDK compat (même version que le HTML) ─
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ── Config Firebase ─────────────────────────────────────────
// ⚠ Ces valeurs DOIVENT correspondre à celles dans V15_CONFIG.FIREBASE
//   dans votre fichier HTML — ne pas les modifier séparément.
firebase.initializeApp({
  apiKey:            'AIzaSyCNwshPo6HdmWw3BdVrPOw7pWQCv-XwAds',
  authDomain:        'portail-des-puissances.firebaseapp.com',
  databaseURL:       'https://portail-des-puissances-default-rtdb.firebaseio.com',
  projectId:         'portail-des-puissances',
  storageBucket:     'portail-des-puissances.firebasestorage.app',
  messagingSenderId: '296161462600',
  appId:             '1:296161462600:web:bf699e66b7adcf14fc0b7d',
});

const messaging = firebase.messaging();

// ── Notifications reçues en ARRIÈRE-PLAN ───────────────────
// Ce handler s'exécute quand l'app est fermée ou en arrière-plan
messaging.onBackgroundMessage(payload => {
  console.log('[SW] Message reçu en arrière-plan :', payload);

  const notification = payload.notification || {};
  const data = payload.data || {};

  const title   = notification.title || '🕊 Portail de Prière';
  const body    = notification.body  || data.body || 'Quelqu\'un intercède pour toi 🙏';
  const icon    = notification.icon  || data.icon
    || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="52" font-size="56">🕊</text></svg>';
  const badge   = data.badge  || icon;
  const tag     = data.tag    || 'fcm-prayer';
  const urlToOpen = data.url  || '/';

  const options = {
    body,
    icon,
    badge,
    tag,
    // requireInteraction : la notification reste jusqu'à interaction utilisateur
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: { url: urlToOpen },
    actions: [
      { action: 'open',    title: '🙏 Ouvrir',  icon: '' },
      { action: 'dismiss', title: '✕ Ignorer',  icon: '' },
    ]
  };

  return self.registration.showNotification(title, options);
});

// ── Clic sur notification ───────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Si une fenêtre de l'app est déjà ouverte, la mettre au premier plan
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            return;
          }
        }
        // Sinon ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ── Activation du SW ────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activé — Portail des Puissances');
  // Prendre le contrôle immédiatement sans attendre rechargement
  event.waitUntil(clients.claim());
});
