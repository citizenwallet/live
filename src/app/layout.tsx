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
  title: "Monitor Citizen Wallet Transactions",
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
          <footer className="bg-gray-100 w-full">
            <div className="container text-white text-center p-4 flex justify-between items-center">
              <div>
                <a href="https://citizenwallet.xyz">
                  <div className="flex justify-center items-center">
                    <Image
                      src="/citizenwallet-logo-icon.svg"
                      alt="Citizen Wallet"
                      className="w-6 h-6 mr-2"
                      height={24}
                      width={24}
                    />
                    <Image
                      src="/citizenwallet-logo-text.svg"
                      alt="Citizen Wallet"
                      className="w-24 h-6 mr-2"
                      height={24}
                      width={96}
                    />
                  </div>
                </a>
              </div>
              <div className="text-xs text-gray-700">
                <a
                  href="https://github.com/citizenwallet/live"
                  className="text-gray-500"
                >
                  github.com/citizenwallet/live
                </a>
              </div>
            </div>
          </footer>
        </Theme>
      </body>
    </html>
  );
}
