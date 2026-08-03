"use client";

import { ThemeProvider } from "@/components/ui/ThemeContext";
import { UserProvider } from "@/lib/AuthContext";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>

      <ThemeProvider>

        {children}

      </ThemeProvider>

    </UserProvider>
  );
}