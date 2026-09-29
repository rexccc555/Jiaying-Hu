import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/zh", destination: "/", permanent: true },
      { source: "/en", destination: "/", permanent: true },
      { source: "/zh/:path*", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/", permanent: true },
      { source: "/wizard", destination: "/", permanent: true },
      { source: "/result", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
