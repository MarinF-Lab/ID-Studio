// ── Firebase · ID Studio ──
// La configuración web de Firebase es pública por diseño; la seguridad
// se controla con las reglas de Firestore/Storage y con Authentication.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjCxtWTbctqsXX3ohIcbcFeDe8-jFxcnk",
  authDomain: "id-studio-53f5a.firebaseapp.com",
  projectId: "id-studio-53f5a",
  storageBucket: "id-studio-53f5a.firebasestorage.app",
  messagingSenderId: "240572086932",
  appId: "1:240572086932:web:e683693942f0e32f4f9281",
};

export const app = initializeApp(firebaseConfig);
export const FIREBASE_SDK = "https://www.gstatic.com/firebasejs/12.19.0";
