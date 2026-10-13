import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Content hash of the un-bundled runtime script. It is appended to the script URL so a
// browser that cached an older copy (it used to be served as immutable for a year)
// is forced to fetch the new one after every change.
const runtimeVersion = createHash('md5')
  .update(readFileSync(new URL('./public/portfolio.runtime.js', import.meta.url)))
  .digest('hex')
  .slice(0, 10);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_RUNTIME_VERSION: runtimeVersion },
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
