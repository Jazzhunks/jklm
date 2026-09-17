import firebase from "firebase/compat/app";
import "firebase/compat/messaging";
import { api } from "./api"; // Assume we have our Axios API wrapper here

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
const app = firebase.app();
export const messaging = typeof window !== "undefined" && "serviceWorker" in navigator ? firebase.messaging() : null;

export const requestFirebaseNotificationPermission = async () => {
  if (!messaging) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await messaging.getToken({ vapidKey: "YOUR_PUBLIC_VAPID_KEY_HERE" });
      if (token) {
        console.log("FCM Token:", token);
        // Send this token to the backend so it knows where to send notifications
        await api.post("/admin/fcm-token", { token }).catch(() => {});
      }
    }
  } catch (error) {
    console.error("Firebase permission error:", error);
  }
};
