"use client";

import React, { createContext, useContext, useMemo, type ReactNode } from "react";

export type User = {
  _id: string;
  channelname: string;
  description?: string;
  email?: string;
  image?: string;
};

type UserContextValue = {
  user: User;
  logout: () => void;
  handlegooglesignin: () => void;
};

const defaultUser: User = {
  _id: "64a5f2e8b9a1c3d4e5f67890",
  channelname: "Nature Channel",
  description: "A channel dedicated to nature documentaries and tutorials.",
  email: "nature@example.com",
  image: "https://github.com/shadcn.png?height=32&width=32",
};

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo<UserContextValue>(
    () => ({
      user: defaultUser,
      logout: () => {
        // Clear any stored auth tokens or session data
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          sessionStorage.clear();
        }
        console.log("User logged out");
      },
      handlegooglesignin: () => {
        console.log("google signin");
      },
    }),
    []
  );

  return React.createElement(UserContext.Provider, { value }, children);
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (context) {
    return context;
  }

  return {
    user: defaultUser,
    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        sessionStorage.clear();
      }
      console.log("User logged out");
    },
    handlegooglesignin: () => {
      console.log("google signin");
    },
  };
};
