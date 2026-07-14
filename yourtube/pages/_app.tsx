import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "../app/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "@/lib/AuthContext";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <div className="min-h-screen bg-white text-black">
        <title>Your-Tube Clone</title>
        <Header />
        <Toaster />
        <div className="flex">
          <Sidebar />
          <Component {...pageProps} />
        </div>
      </div>
    </UserProvider>
  );
}