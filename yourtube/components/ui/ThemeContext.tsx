"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] =
    useState<Theme>("dark");

  useEffect(() => {
    // Check if user has manually selected a theme
    const savedTheme =
      localStorage.getItem(
        "yourtube-theme"
      ) as Theme | null;

    if (
      savedTheme === "light" ||
      savedTheme === "dark"
    ) {
      setThemeState(savedTheme);

      document.documentElement.classList.toggle(
        "dark",
        savedTheme === "dark"
      );

      return;
    }

    // Get current time in India
    const currentHour = Number(
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          hour12: false,
        }
      ).format(new Date())
    );

    // 10 AM - 12 PM IST = Light Mode
    // Other times = Dark Mode
    const automaticTheme: Theme =
      currentHour >= 10 &&
      currentHour < 12
        ? "light"
        : "dark";

    setThemeState(
      automaticTheme
    );

    document.documentElement.classList.toggle(
      "dark",
      automaticTheme === "dark"
    );
  }, []);

  const setTheme = (
    newTheme: Theme
  ) => {
    setThemeState(newTheme);

    localStorage.setItem(
      "yourtube-theme",
      newTheme
    );

    document.documentElement.classList.toggle(
      "dark",
      newTheme === "dark"
    );
  };

  const toggleTheme = () => {
    setTheme(
      theme === "dark"
        ? "light"
        : "dark"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}