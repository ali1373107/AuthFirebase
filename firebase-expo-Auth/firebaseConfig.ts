// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import * as firebaseAuth from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBX5Ph6b1PlUXmwM6i0-M7EAQigBUHYEiE",
  authDomain: "safe-travel-fab26.firebaseapp.com",
  projectId: "safe-travel-fab26",
  storageBucket: "safe-travel-fab26.firebasestorage.app",
  messagingSenderId: "845088855024",
  appId: "1:845088855024:web:8aa3abd6ce93b37a5c8335",
  measurementId: "G-WYGVF83F2D"
};

let app: FirebaseApp;
let auth: firebaseAuth.Auth;
let db: Firestore;

const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;

// This check prevents us from initializing the app more than once
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    auth = firebaseAuth.initializeAuth(app, {
      persistence: reactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    console.error("Firebase initialization error", error);
  }
} else {
  app = getApp();
  auth = firebaseAuth.getAuth(app);
}

db = getFirestore(app!);

export { app, auth, db };