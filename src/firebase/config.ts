// src/firebase/config.ts

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCjWtqQpMtHaG3IZhZm8Fzu-RCYnjs1ihU", // VOCÊ PRECISA PREENCHER ISSO!
  authDomain: "aribeagendamento.firebaseapp.com",
  projectId: "aribeagendamento",
  storageBucket: "aribeagendamento.firebasestorage.app",
  messagingSenderId: "19147656735",
  appId: "1:19147656735:web:f30c8058354b6ea4cd0f2a",
  measurementId: "G-EJKM2HC9M4"
};

// Inicializar Firebase apenas se ainda não foi inicializado
// Isso evita erros de "app already exists" no Next.js
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Inicializar Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };