import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import config from '../firebase-applet-config.json';

const firebaseConfig = config;

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
  auth = getAuth(app);
} else {
  // Fallback for development without Firebase
  app = {} as FirebaseApp;
  db = {} as Firestore;
  auth = {} as Auth;
}

export { app, db, auth, firebaseConfig };
