"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { signInWithPopup } from "firebase/auth";
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
  handlegooglesignin: () => Promise<void>;
};

const UserContext = createContext<AuthContextValue | null>(null);

const normalizeUser = (value: Partial<User> & { _id?: string }): User => ({
  _id: value._id || "",
  channelname: value.channelname || "",
  name: value.name || "",
  description: value.description || "",
  email: value.email || "",
  image: value.image || "",
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(normalizeUser(JSON.parse(storedUser)));
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      setUser(null);
    }
  }, []);

  const logout = () => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      sessionStorage.clear();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const accessToken = await firebaseUser.getIdToken();

      const payload = {
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || firebaseUser.email || "User",
        image: firebaseUser.photoURL || "",
      };

      const response = await axiosInstance.post("/user/login", payload);
      const backendUser = response.data?.result || {};

      const normalizedUser = normalizeUser({
        _id: backendUser._id || backendUser.id || firebaseUser.uid,
        ...payload,
        ...backendUser,
      });

      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("authToken", accessToken);
      setUser(normalizedUser);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      alert("Unable to sign in right now. Please try again.");
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        logout,
        handlegooglesignin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
};