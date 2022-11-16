// Import the functions you need from the SDKs you need
// v9 compat packages are API compatible with v8 code
import { initializeApp } from "firebase/app";
import 'firebase/compat/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMgp2wZtIoY1AWy6rAyDNn5YFGobIQCmc",
  authDomain: "tasteonus.firebaseapp.com",
  projectId: "tasteonus",
  storageBucket: "tasteonus.appspot.com",
  messagingSenderId: "887598346267",
  appId: "1:887598346267:web:d65cb41ca42b5e0d0b48be"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app }