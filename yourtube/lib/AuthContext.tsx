"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";

import {
  signInWithPopup,
  signOut,
} from "firebase/auth";

import axiosInstance from "./axiosinstance";
import { auth, provider } from "./firebase";

export type User = {
  _id: string;
  channelname?: string;
  name?: string;
  description?: string;
  email?: string;
  image?: string;
};


type AuthContextValue = {
  user: User | null;
  logout: () => void;
  handlegooglesignin: () => Promise<User | null>;
  googleSignInInProgress: boolean;
};


const UserContext =
  createContext<AuthContextValue | null>(null);



const normalizeUser = (
  value: Partial<User> & { _id?: string }
): User => ({
  _id: value._id || "",
  channelname: value.channelname || "",
  name: value.name || "",
  description: value.description || "",
  email: value.email || "",
  image: value.image || "",
});



export const UserProvider = ({
  children,
}: {
  children: ReactNode;
}) => {


  const [user, setUser] =
    useState<User | null>(null);


  const [googleSignInInProgress, setGoogleSignInInProgress] =
    useState(false);


  // prevents multiple popup calls
  const popupLock = useRef(false);



  useEffect(() => {

    try {

      const storedUser =
        localStorage.getItem("user");


      if (storedUser) {

        setUser(
          normalizeUser(
            JSON.parse(storedUser)
          )
        );

      }


    } catch(error){

      console.error(
        "Load user error",
        error
      );

      localStorage.removeItem("user");
      localStorage.removeItem("authToken");

    }

  }, []);





  const logout = async () => {

    try {

      await signOut(auth);


      localStorage.removeItem(
        "user"
      );


      localStorage.removeItem(
        "authToken"
      );


      sessionStorage.clear();


      setUser(null);


    } catch(error){

      console.error(
        "Logout error",
        error
      );

    }

  };







  const handlegooglesignin =
    async (): Promise<User | null> => {



    if(popupLock.current){

      console.log(
        "Google popup already open"
      );

      return null;

    }



    popupLock.current = true;

    setGoogleSignInInProgress(true);



    try {


      console.log(
        "Opening Google popup..."
      );



      const result =
        await signInWithPopup(
          auth,
          provider
        );



      const firebaseUser =
        result.user;



      const token =
        await firebaseUser.getIdToken();



      const payload = {

        email:
          firebaseUser.email || "",

        name:
          firebaseUser.displayName ||
          "User",

        image:
          firebaseUser.photoURL || "",

        uid:
          firebaseUser.uid,

        idToken:
          token,

      };




      const response =
        await axiosInstance.post(
          "/user/login",
          payload,
          {
            withCredentials:true,
          }
        );




      const backendUser =
        response.data?.result ||
        response.data?.user ||
        response.data ||
        {};




      const finalUser =
        normalizeUser({

          _id:
            backendUser._id ||
            backendUser.id ||
            firebaseUser.uid,


          ...payload,

          ...backendUser,

        });





      localStorage.setItem(
        "user",
        JSON.stringify(finalUser)
      );



      localStorage.setItem(
        "authToken",
        token
      );



      setUser(finalUser);



      console.log(
        "Google login success"
      );



      return finalUser;



    } catch(error:any){



      console.error(
        "Google sign-in failed:",
        error
      );



      if(
        error.code ===
        "auth/popup-closed-by-user"
      ){

        console.log(
          "Popup closed"
        );

        return null;

      }



      if(
        error.code ===
        "auth/popup-blocked"
      ){

        alert(
          "Allow popup windows in browser"
        );

        return null;

      }



      if(
        error.code ===
        "auth/cancelled-popup-request"
      ){

        console.log(
          "Duplicate popup request"
        );

        return null;

      }



      alert(
        "Google login failed"
      );

      return null;



    } finally {


      popupLock.current = false;


      setGoogleSignInInProgress(false);


    }

  };







  return (

    <UserContext.Provider

      value={{

        user,

        logout,

        handlegooglesignin,

        googleSignInInProgress,

      }}

    >

      {children}

    </UserContext.Provider>

  );

};






export const useUser = () => {


  const context =
    useContext(UserContext);



  if(!context){

    throw new Error(
      "useUser must be used inside UserProvider"
    );

  }



  return context;


};