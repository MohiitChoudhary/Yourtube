import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "../app/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/components/ui/ThemeContext";

export default function App({
  Component,
  pageProps,
}: AppProps) {
  return (
    <UserProvider>
      <ThemeProvider>

        <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">

          <Header />

          <Toaster />

          <div className="flex min-h-[calc(100vh-64px)]">

            <Sidebar />

            <main className="flex-1">
              <Component {...pageProps} />
            </main>

          </div>

        </div>

      </ThemeProvider>
    </UserProvider>
  );
}