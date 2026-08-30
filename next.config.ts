import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Verification uploads (recitation audio + ID photo) travel through a
    // server action; the default 1MB cap would reject most phone recordings.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
