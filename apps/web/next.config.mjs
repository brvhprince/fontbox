import { createRequire } from "module";

const require = createRequire(import.meta.url);

const withFonts = () => ({
  async headers() {
    return [];
  }
});

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  transpilePackages: ["@fontbox/ui", "@fontbox/config"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fonts.gstatic.com"
      },
      {
        protocol: "https",
        hostname: "images.fontbox.app"
      }
    ]
  }
};

export default () => Object.assign({}, withFonts(), config);
