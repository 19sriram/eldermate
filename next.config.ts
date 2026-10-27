import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a phone on the same Wi-Fi load dev assets and hydrate the scan page.
  allowedDevOrigins: ["192.168.0.214"],
};

export default nextConfig;
