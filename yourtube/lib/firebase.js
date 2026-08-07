import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAMPdIGO1iWSA0Hcuc-RO5CAWHOdM71uIE",
  authDomain: "yourtube-60996.firebaseapp.com",
  projectId: "yourtube-60996",
  storageBucket: "yourtube-60996.firebasestorage.app",
  messagingSenderId: "476509833732",
  appId: "1:476509833732:web:74e22e0688213edffe0351",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();