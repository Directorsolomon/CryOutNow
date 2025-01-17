
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyB4DXu6QgsauznrREWne5rDzRE-JqZiOLU",
  authDomain: "cryoutnow-6ce3d.firebaseapp.com",
  projectId: "cryoutnow-6ce3d",
  storageBucket: "cryoutnow-6ce3d.appspot.com",
  messagingSenderId: "251194871352",
  appId: "1:251194871352:web:c0e5056438f2e5e1d3e0cd",
  measurementId: "G-7CDRV96D08"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const googleProvider = new GoogleAuthProvider();
