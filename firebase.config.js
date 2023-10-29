// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAsmrX6XpsDcHFcatGgxCRxvkblfethoLM',
  authDomain: 'pdf-chat-e80b5.firebaseapp.com',
  projectId: 'pdf-chat-e80b5',
  storageBucket: 'pdf-chat-e80b5.appspot.com',
  messagingSenderId: '703712833226',
  appId: '1:703712833226:web:3b3505e20f375ab2b28e33',
  measurementId: 'G-TJ2JLLRKMQ'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const firestoreDB = getFirestore(app)
const auth = getAuth(app)
const storageDB = getStorage(app)

export { firestoreDB, auth, storageDB }
