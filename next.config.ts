import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Izinkan gambar dari picsum.photos dan unsplash
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/assets/uploads/:filename*",
          destination: "/api/media/:filename*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
