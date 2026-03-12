import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === "development" && {
    turbopack: {
      root: "/Users/navee/Documents/other projects/superstition catcher",
    },
  }),
};

export default nextConfig;
