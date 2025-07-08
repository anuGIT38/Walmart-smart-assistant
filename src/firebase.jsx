import React from "react";
import { createContext, useContext } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyDpi2GxQNvvbX4lMV1S_ERQnF2FEiIW55I",
  authDomain: "group-project-b7ff0.firebaseapp.com",
  projectId: "group-project-b7ff0",
  storageBucket: "group-project-b7ff0.firebasestorage.app",
  messagingSenderId: "510303524804",
  appId: "1:510303524804:web:6278bb92b94dee4141f691",
  databaseURL: "https://group-project-b7ff0-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const googleProvider = new GoogleAuthProvider();
const database = getDatabase(app);
const FirebaseContext = createContext(null);
export const useFirebase = () => useContext(FirebaseContext);
export const firebaseAuth = getAuth(app);
export { app };
export const FirebaseProvider = (props) => {
  const signupUserWithEmailAndPassword = (email, password) => {
    return createUserWithEmailAndPassword(firebaseAuth, email, password);
  };
  const signinUserWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(firebaseAuth, email, password);
  };

  const signinWithGoogle = () => {
    return signInWithPopup(firebaseAuth, googleProvider)
      .then((result) => {
        console.log("✅ Google sign-in success:", result.user);
        return result.user;
      })
      .catch((error) => {
        console.error("❌ Google sign-in error:", error.message);
      });
  };

  //const putData = (key, data) => set(ref(database, key), data);
  return (
    <FirebaseContext.Provider
      value={{
        signupUserWithEmailAndPassword,
        signinUserWithEmailAndPassword,
        signinWithGoogle,
        firebaseAuth,
        database,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
