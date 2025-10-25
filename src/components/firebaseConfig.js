// Import the functions you need from the SDKs you need 
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <- Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUgZ8S5cYJdwcr3-cFJaZM95YebYS-cn0",
  authDomain: "zivagroup-ec234.firebaseapp.com",
  projectId: "zivagroup-ec234",
  storageBucket: "zivagroup-ec234.appspot.com",
  messagingSenderId: "608313885447",
  appId: "1:608313885447:web:8a7f72ce3d0683e4defba2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore and export it
export const db = getFirestore(app);

export default app;
