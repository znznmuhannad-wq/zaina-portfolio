/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // External media (i.ibb.co images, files.catbox.moe videos) is referenced via
  // plain <img>/<video> inside verbatim markup, so next/image remote patterns are
  // not required. They are listed here so the assets can be migrated to next/image
  // incrementally without touching config.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'files.catbox.moe' },
      { protocol: 'https', hostname: 'www.transparenttextures.com' },
    ],
  },
};

export default nextConfig;
