import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBtm6fc7na2DJv-_Y4G602IThjM7HYsWyg",
    authDomain: "realsays.firebaseapp.com",
    projectId: "realsays",
    storageBucket: "realsays.firebasestorage.app",
    messagingSenderId: "198747443322",
    appId: "1:198747443322:web:4b20ca51acca6e904a6bc3",
    measurementId: "G-S8GHN29JFP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
