// Firebase App & Analytics Initialization
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBVIrQ05UTNmAImu0KyT0It1z9pwGyDLSM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "yummiee-app-e1ea9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "yummiee-app-e1ea9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "yummiee-app-e1ea9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "331789119226",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:331789119226:web:1074bc1097a02263c96343",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KVC01M4BFQ"
};

// Initialize Firebase only once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics if supported in environment (client-side)
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Ignore analytics unsupported in local / test environments
  });
}

export default app;
