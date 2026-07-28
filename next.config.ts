/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    // This allows images from ANY secure source (good for scraping)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // For local dev with messy external URLs, sometimes this is necessary:
    unoptimized: true,
  },
};

export default nextConfig;
