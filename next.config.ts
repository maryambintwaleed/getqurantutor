import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The ID photo travels through a server action, so the default 1MB cap is
    // too small. This cannot be raised past the hosting platform's own ~4.5MB
    // request limit, which is why the recitation is uploaded straight from the
    // browser to blob storage instead of being posted here.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
