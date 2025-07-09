import React, { createContext, useContext } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import { fetchSignInMethodsForEmail } from "firebase/auth";

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
const facebookProvider = new FacebookAuthProvider();
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
        throw error;
      });
  };

  const signinWithFacebook = async () => {
  try {
    const result = await signInWithPopup(firebaseAuth, facebookProvider);
    return result.user;
  } catch (error) {
    if (error.code === "auth/account-exists-with-different-credential") {
      const email = error?.customData?.email;
      const pendingCred = FacebookAuthProvider.credentialFromError(error);

      if (!email) {
        console.error("❌ No email found in error.customData");
        alert("Facebook Sign-in failed: No email associated with this account.");
        return;
      }

      const methods = await fetchSignInMethodsForEmail(firebaseAuth, email);

      if (methods && methods.length > 0) {
        alert(
          `⚠️ An account already exists with the provider: ${methods[0]}.\nPlease sign in with that provider first, then link Facebook from account settings.`
        );
      } else {
        alert(
          "⚠️ An account with this email already exists, but no providers were found.\nTry logging in with a different method."
        );
      }

      console.log("Pending Facebook credential:", pendingCred);
    } else {
      console.error("❌ Facebook Sign-in error:", error.message);
      alert("Facebook Sign-in failed");
    }
  }
};


  return (
    <FirebaseContext.Provider
      value={{
        signupUserWithEmailAndPassword,
        signinUserWithEmailAndPassword,
        signinWithGoogle,
        signinWithFacebook,
        fetchSignInMethodsForEmail,
        firebaseAuth,
        database,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
