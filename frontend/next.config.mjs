/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

// Only initialize the Cloudflare dev binding shim outside of production, so
// `next build` for the Workers deploy (and any other production build) never
// spins up a Miniflare instance.
if (process.env.NODE_ENV !== "production") {
  const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}

export default nextConfig;
