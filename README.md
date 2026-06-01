# Z Creative Studio — Portfolio (Next.js)

Portfolio of **Zaina Alissa**. This repository was migrated from a single
5,246-line `index.html` into a structure-preserving **Next.js 16 (App Router) +
TypeScript** architecture. **The visual design, layout, content, animations and
behaviour are preserved 100%** — the refactor only changes _how the code is
organised and shipped_, not what the user sees.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (static-prerendered)
npm run start    # serve the production build
```

## Architecture

```
app/
  layout.tsx          Root layout: <html>/<body>, fonts, SEO metadata,
                      anti-flash theme script, runtime scripts.
  page.tsx            Composes the 18 sections in their original order.
  globals.css         VERBATIM CSS from the legacy <style> block + Tailwind layers.
components/
  layout/             Navbar, MobileMenu, Footer
  sections/           Hero, About, Skills, SocialDesignHero, WebCta,
                      HighlightedProjects, Portfolio, PlasticArt, VideoProjects,
                      WebProjects, PackagingProjects, SocialMediaProjects,
                      Education, Contact
  overlays/           Modal (showcase lightbox)
  runtime/            RuntimeScripts (loads Lucide + the portfolio runtime)
  markup/             Verbatim inner HTML for each section (extracted, not retyped)
config/site.ts        Single source of truth for SEO/meta values
types/global.d.ts     Ambient types for the runtime globals
public/
  portfolio.runtime.js  The legacy behaviour script, byte-for-byte, global scope
legacy/index.html     The original monolith, kept for reference/diffing
```

### Why this shape

The original behaviour is ~1,300 lines of hand-tuned **imperative DOM code**
(infinite-loop video carousel with clone buffers, drag physics, a monkey-patched
mute registry, a page-flip "plastic art" book). Rewriting that into React state
was the **highest-risk** option for the "preserve 100%" requirement, so by design:

- **Markup** is split into one component per section and rendered as the _exact_
  original HTML — zero hand-conversion, so zero visual drift.
- **Behaviour** is lifted verbatim into `public/portfolio.runtime.js` and loaded
  as a classic script (global scope) so inline `onclick` handlers and cross-module
  globals resolve exactly as before.
- **Styling** is the original CSS verbatim, now compiled by a real Tailwind build
  instead of the runtime CDN compiler.

This is the low-risk migration. A follow-up phase can incrementally promote each
section's markup to typed JSX and each runtime module to a React hook.

## Deployment (Netlify)

`netlify.toml` sets `npm run build`; the official `@netlify/plugin-nextjs`
runtime (auto-installed by Netlify for Next.js sites) handles routing and SSR/SSG.
No `publish` directory is set manually. See the migration report for details.
