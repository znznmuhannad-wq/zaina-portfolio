import type { Config } from 'tailwindcss';

/**
 * Ported VERBATIM from the legacy inline `tailwind.config` that previously ran
 * inside the browser via the Tailwind CDN. Moving it into a real build-time
 * config removes the ~hundreds-of-KB runtime compiler from the page (the single
 * biggest performance problem in the original) while producing byte-identical
 * utility output.
 *
 * darkMode is intentionally left at Tailwind's default ('media') to preserve the
 * exact behaviour of the original `dark:` utilities, which keyed off the OS
 * colour-scheme. (The bespoke `[data-theme="dark"]` palette in globals.css is
 * independent of this and continues to be driven by the dark-mode toggle.)
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        teal_primary: '#428A97',
        mint: '#65C6BE',
        sage: '#B7C7C9',
        yellow_gold: '#F2B11C',
        coral: '#E36A67',
        warm_beige: '#F5EFE6',
        charcoal: '#2C2C2C',
        subtitle_beige: '#8A7E72',
      },
      fontFamily: {
        space: ['Space Grotesk', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        fredoka: ['Fredoka', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(var(--tw-rotate))' },
          '50%': { transform: 'translateY(-15px) rotate(var(--tw-rotate))' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
