/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The site is a single, fully static page, so we emit a plain static export
  // (an `out/` folder of HTML/CSS/JS). This mirrors the original static Netlify
  // deployment exactly — Netlify just serves files, with no Next.js server
  // runtime or adapter to misconfigure.
  output: 'export',
  images: {
    // Required for `output: 'export'` (the optimizing loader needs a server).
    // External media is referenced via plain <img>/<video> in the verbatim
    // markup, so no optimization is in play today; patterns are kept for a
    // future incremental next/image migration.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'files.catbox.moe' },
      { protocol: 'https', hostname: 'www.transparenttextures.com' },
    ],
  },
};

export default nextConfig;
