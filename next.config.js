/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "giveth.mypinata.cloud" },
      { hostname: "ipfs.io" },
      { hostname: "localhost" },
      { hostname: "pbs.twimg.com" },
      { hostname: "images.lumacdn.com" },
      {
        hostname: "api.multiavatar.com",
      },
      { hostname: "ipfs.internal.citizenwallet.xyz" },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: false,
            titleProp: true,
            ref: true,
          },
        },
      ],
    });
    return config;
  },
};

module.exports = nextConfig;
