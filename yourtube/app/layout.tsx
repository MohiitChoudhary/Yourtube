import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "YourTube",
  description:
    "YourTube - Watch and share videos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">

        <Providers>

          <Header />

          <div className="flex flex-1">

            <Sidebar />

            <main className="flex-1">
              {children}
            </main>

          </div>

        </Providers>

      </body>
    </html>
  );
}