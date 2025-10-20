// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBBt7eE9KQYRCAV9WI9_lAgZm4iEpsblQg",
  authDomain: "stillwater-today.firebaseapp.com",
  databaseURL: "https://stillwater-today-default-rtdb.firebaseio.com",
  projectId: "stillwater-today",
  storageBucket: "stillwater-today.appspot.com",
  messagingSenderId: "648945951283",
  appId: "1:648945951283:web:518e78751f3d70793bf946",
  measurementId: "G-Z9X9CFFTBT"
};

// Prevent multiple initializations
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

