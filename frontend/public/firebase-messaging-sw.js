importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCCyYixL_0qBKTB4PoBCZSU7Y2reubCJHQ",
  authDomain: "northend-admin-app.firebaseapp.com",
  projectId: "northend-admin-app",
  storageBucket: "northend-admin-app.firebasestorage.app",
  messagingSenderId: "1020345802825",
  appId: "1:1020345802825:web:9e157578b9a7917c1c1f98",
  measurementId: "G-D79GYH0YCK"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || payload.data.title || 'Unacademy Admin';
  const notificationOptions = {
    body: payload.notification?.body || payload.data.body || '',
    icon: '/icons/icon-192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetPath = event.notification.data?.target_path || '/admin';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.navigate(targetPath);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetPath);
      }
    })
  );
});
