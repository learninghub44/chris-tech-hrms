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

// NEXT_PUBLIC_API_URL is inlined into the client bundle at build time, so it
// must be set in *this* shell/CI environment before `next build` runs -
// setting it in the Cloudflare dashboard afterward has no effect. Fail the
// production build loudly instead of silently shipping a localhost fallback.
if (process.env.NODE_ENV === "production" && !process.env.CI_SKIP_API_URL_CHECK) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!apiUrl || /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(apiUrl)) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing or points at localhost for a production build. " +
        "Set it in the environment running `npm run cf:deploy` (e.g. frontend/.env.production " +
        "or the CI job env), not just in the Cloudflare dashboard - it must be present before " +
        "`next build` runs, since NEXT_PUBLIC_* vars are baked in at build time."
    );
  }
}

export default nextConfig;
