/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "api.multiavatar.com",
      },
      { hostname: "ipfs.internal.citizenwallet.xyz" },
    ],
  },
};

module.exports = nextConfig;
