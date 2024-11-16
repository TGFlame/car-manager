// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBWT7-1Z03905LbpSjVYrfdh-T07fVAhR4",
  authDomain: "car-manager-3ce1c.firebaseapp.com",
  projectId: "car-manager-3ce1c",
  storageBucket: "car-manager-3ce1c.firebasestorage.app",
  messagingSenderId: "153245096646",
  appId: "1:153245096646:web:5fe702a354effb7efcd5c7",
  measurementId: "G-1Y4TE2QZL6"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
