import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "mcictonfubsfogxeheqb.supabase.co",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/supabase/:path*',
        destination: 'https://mcictonfubsfogxeheqb.supabase.co/:path*',
      },
    ];
  },
};

export default nextConfig;
