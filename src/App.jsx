//for firestore -lecture 9
import React, { useState } from "react";
import { useFirebase } from "./firebase";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
  where,
  query,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { app } from "./firebase";
import "./App.css";
import { getDatabase, ref, child, get, onValue } from "firebase/database";
import { useEffect } from "react";
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
const firestore = getFirestore(app);
const database = getDatabase(app);
function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          {/* other routes */}
        </Routes>
    </>
  );
}
export default App;
/*































































































*/
/* for simply read,write,update,query data
function App() {
  const firebase = useFirebase();
  const [name, setName] = useState("");
  //for adding data  -use collection,addDoc,
  const writeData = async () => {
    const result = await addDoc(collection(firestore, "cities"), {
      Name: "delhi",
      PinCode: "201204",
      Lat: "123",
      Long: "456",
    });
    console.log(result);
  };

  //for adding sub collection
  const subCollection = async () => {
    const result = await addDoc(
      collection(firestore, "cities/Of9Cztxyevr8N8tZU4ou/places"),
      {
        place: "this is my place",
        dest: "aanand vihar",
        log: "876",
      }
    );
    console.log(result);
  };

  //for adding query : use  query,getDocs
  const getDocumentByQuery = async () => {
    const collectionRef = collection(firestore, "users");
    const q = query(collectionRef, where("isFemale", "==", false));
    const snap = await getDocs(q);
    snap.forEach((data) => console.log(data.data()));
  };

  //for reading data - use getDoc,doc
  const getDocument = async () => {
    const ref = doc(firestore, "cities", "Of9Cztxyevr8N8tZU4ou");
    const snap = await getDoc(ref);
    console.log(snap.data());
  };

  //for updating data- use doc,updateDoc
  const getDocumentUpdate = async () => {
    const docref = doc(firestore, "cities", "Of9Cztxyevr8N8tZU4ou");
    await updateDoc(docref, { Name: "New Delhi" });
  };

  //put data in realtime database
  const putDataNew = () => {
    firebase.putData("grandfather/father/child", {
      id: 1,
      Name: "radhika verma",
      age: 21,
    });
  };

  //read data 
  //here we have to give instance of database and key- grandfather
  get(child(ref(database), "grandfather")).then((snapshot) => {
    console.log(snapshot.val());
  });

  //child(database,"grandfather") this will return call back
  //onvalue method used to find value updated or not
  useEffect(() => {
  const childRef = child(ref(database), "grandfather/father/child");

  const unsubscribe = onValue(childRef, (snapshot) => {
    const data = snapshot.val();
    //data me Name exist krta hai toh use set karenge
    if (data?.Name) {
      setName(data.Name);
    }
  });

  return () => unsubscribe(); // Cleanup listener on unmount
}, []);

  return (
    <div className="App">
      <h1>name is:{name}</h1>
      <h1>Firebase firestore</h1>
      <button onClick={writeData}>Put data</button>
      <button onClick={subCollection}>Put subdata</button>
      <button onClick={getDocument}>Get Document</button>
      <button onClick={getDocumentByQuery}>Get Query</button>
      <button onClick={getDocumentUpdate}>Update</button>
      <h1>add data in realtime database</h1>
      <button onClick={putDataNew}>put Data</button>
    </div>
  );
}
export default App;*/

//for sign in and sign up

//import React, { useState } from "react";
//import { useFirebase } from "./context/firebase";
/*
function App() {
  const firebase = useFirebase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const userCred = await firebase.signupUserWithEmailAndPassword(email, password);
      console.log("✅ User signed up:", userCred.user);
    } catch (err) {
      console.error("❌ Signup failed:", err.message);
    }
  };

  const handleSignin = async () => {
    try {
      const userCred = await firebase.signinUserWithEmailAndPassword(email, password);
      console.log("✅ User signed in:", userCred.user);
    } catch (err) {
      console.error("❌ Signin failed:", err.message);
    }
  };

  return (
    <div className="App">
      <h1>Authentication Page</h1>
      <label>Email</label>
      <input
        type="email"
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
      <br />
      <label>Password</label>
      <input
        type="password"
        placeholder="Enter your password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <br />
      <button onClick={() => firebase.signinWithGoogle()}>
        Sign in with Google
      </button>
      <br />
      <button onClick={handleSignin}>Sign In with Email</button>
      <br />
      <button
        onClick={async () => {
          await handleSignup();
          firebase.putData("users/radhika", { email, password });
        }}
      >
        Sign Up
      </button>
    </div>
  );
}

export default App;

*/
