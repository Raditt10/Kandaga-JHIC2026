import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Izinkan gambar dari picsum.photos (placeholder images)
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
};

export default nextConfig;
