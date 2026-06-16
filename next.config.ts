import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/adventure",
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
