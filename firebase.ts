
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWEie04CLsJU8MoJTlMNjBXVTyGjjtkw0",
  authDomain: "sync-d80ad.firebaseapp.com",
  projectId: "sync-d80ad",
  storageBucket: "sync-d80ad.firebasestorage.app",
  messagingSenderId: "890519361955",
  appId: "1:890519361955:web:68be000e7f8dd7cd606216",
  measurementId: "G-E7M4TL7DPC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };