import Image from "next/image";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <footer className="bg-gray-100 w-full">
        <div className="mx-8 text-white text-center p-4 flex justify-between items-center">
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
    </>
  );
}
