import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Monitor Citizen Wallet Transactions",
  description: "Listen to new transactions on the blockchain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.jpg" sizes="any" />
      </head>
      <body className={inter.className}>
        {children}
        <footer className="bg-gray-100 text-white text-center p-4 mt-8 flex justify-between items-center">
          <div>
            <a href="https://citizenwallet.xyz">
              <div className="flex justify-center items-center">
                <img
                  src="/citizenwallet-logo-icon.svg"
                  alt="Citizen Wallet"
                  className="w-6 h-6 mr-2"
                />
                <img
                  src="/citizenwallet-logo-text.svg"
                  alt="Citizen Wallet"
                  className="w-24 h-6 mr-2"
                />
              </div>
            </a>
          </div>
          <div className="text-xs text-gray-700">
            <a
              href="https://github.com/citizenwallet/monitor"
              className="text-gray-500"
            >
              github.com/citizenwallet/monitor
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
