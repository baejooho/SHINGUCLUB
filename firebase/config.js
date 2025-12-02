// firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD9Xryev37hu-jazCTFHkEpDRDgrwC4jRk",
  authDomain: "club-site-f783b.firebaseapp.com",
  projectId: "club-site-f783b",
  storageBucket: "club-site-f783b.firebasestorage.app",
  messagingSenderId: "802499909390",
  appId: "1:802499909390:web:3ccbc9a90dff28acf4295f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
