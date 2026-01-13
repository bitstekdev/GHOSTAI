import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1F5emSFkag4mwYAsJh7qka99d06CKp4U",
  authDomain: "ghostverse-ai-aad5c.firebaseapp.com",
  projectId: "ghostverse-ai-aad5c",
  storageBucket: "ghostverse-ai-aad5c.firebasestorage.app",
  messagingSenderId: "746735685874",
  appId: "1:746735685874:web:aa8e7db2e62dafda9fc06b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Google Provider
export const googleProvider = new GoogleAuthProvider();
