
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCXKrOwOo4H4YAK1zo3nx1hdTif5zngEnE",
    authDomain: "website-a4db9.firebaseapp.com",
    projectId: "website-a4db9",
    storageBucket: "website-a4db9.appspot.com",
    messagingSenderId: "204603403194",
    appId: "1:204603403194:web:e31a5ded6480ca55764b83",
    measurementId: "G-TK7QQRRKH7"
  };
 

const app = initializeApp(firebaseConfig);

export const authf = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

