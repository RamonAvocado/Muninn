import type { NextConfig } from "next";

// Browsers keep cookies per host, not per port, so every app on localhost (Mimird-Web,
// Skuld, Muninn…) shares one jar. With @mimird/auth's default prefix they'd all read and
// overwrite the same `mimird_session`, and since they also share the dev fallback secret,
// Muninn would accept another app's sign-in. Our own prefix keeps Muninn's session apart.
// Set here so dev, `next start`, Docker and proxy.ts all see it.
process.env.AUTH_COOKIE_PREFIX ||= "muninn";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
