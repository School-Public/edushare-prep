import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4nP0HVlsAr7Rg1NxwJJkiD2sKNSGHgJc",
  authDomain: "class-resource-hub-fed71.firebaseapp.com",
  projectId: "class-resource-hub-fed71",
  storageBucket: "class-resource-hub-fed71.firebasestorage.app",
  messagingSenderId: "88256561576",
  appId: "1:88256561576:web:1eff14bc04711907dedd9d",
  measurementId: "G-8XL7TCJLDR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export { signInWithPopup, signOut };