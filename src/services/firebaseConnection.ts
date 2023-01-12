import {getFirestore} from 'firebase/firestore'
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDQ987jxTTF3_nPxJEOYd6OkkF8yf_6lm0",
  authDomain: "tarefasdaweb.firebaseapp.com",
  projectId: "tarefasdaweb",
  storageBucket: "tarefasdaweb.appspot.com",
  messagingSenderId: "182364980438",
  appId: "1:182364980438:web:54983f9be6aeff350bb577"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp)

export { db };