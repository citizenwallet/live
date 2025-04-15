import { Inter } from "next/font/google";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Inter as FontSans } from "next/font/google";

import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

import Image from "next/image";
import { Theme } from "@radix-ui/themes";

export const metadata = {
  title: "Citizen Wallet Fundraiser",
  description: "Listen to new transactions on the blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.jpg" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={cn(
          "min-h-screen min-w-screen bg-background font-sans antialiased flex flex-col",
          fontSans.variable
        )}
      >
        <Theme className="h-screen w-screen flex flex-col items-center">
          {children}
        </Theme>
      </body>
    </html>
  );
}
