import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import { Navbar } from "@/components/layout/navbar";
import { TRPCProvider } from "@/components/providers/trpc-provider";

import "./globals.css";

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Devroast",
  description: "Blank Next.js app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontMono.variable}>
      <body className="min-h-screen bg-bg-page font-sans text-text-primary">
        <TRPCProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            {children}
          </div>
        </TRPCProvider>
      </body>
    </html>
  );
}
