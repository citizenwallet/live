/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "giveth.mypinata.cloud" },
      { hostname: "ipfs.io" },
      { hostname: "localhost" },
      {
        hostname: "api.multiavatar.com",
      },
      { hostname: "ipfs.internal.citizenwallet.xyz" },
    ],
  },
};

module.exports = nextConfig;
