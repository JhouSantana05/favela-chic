import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  type Firestore
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD02-FlFmQrFhjiheV4P9dV2-WDKwSAVGg",
  authDomain: "favela-chic-loja.firebaseapp.com",
  projectId: "favela-chic-loja",
  storageBucket: "favela-chic-loja.firebasestorage.app",
  messagingSenderId: "292196017395",
  appId: "1:292196017395:web:40c22167ab017c624b8386",
};

// Inicializa ou reaproveita o app do Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializa Firestore com suporte a cache inteligente offline
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const storage: FirebaseStorage = getStorage(app);
