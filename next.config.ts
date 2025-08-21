import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  webpack(config) {
    config.cache = {
      type: "filesystem",
      maxMemoryGenerations: 1, 
    };
    return config;
  },
};

export default nextConfig;
