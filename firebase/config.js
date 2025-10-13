// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCHAwM9yxLM34CX7_XjJZSrnDo2itLjU7M",
  authDomain: "test-25bd6.firebaseapp.com",
  projectId: "test-25bd6",
  storageBucket: "test-25bd6.firebasestorage.app",
  messagingSenderId: "857367460717",
  appId: "1:857367460717:web:7523d546d003782bd0b864",
  measurementId: "G-06XTM851DJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
