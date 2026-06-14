# Web Roadmap — echoesofthegarden.com

> Separate from the game roadmap. This repo (`echoes-of-the-garden-web`) is
> the marketing/lore face of the game: Netlify static site + Functions, owned
> by the chat assistant. The game is an upstream data source (read via raw),
> never a dependency the other way. Quarters are loose targets, not deadlines.

---

## Phase W1 — Foundation ✅ (done)
- Static site live on Netlify (`echoesofthegarden.com`), brand design system
  (Crimson Pro / Cinzel, forest-dark palette).
- Newsletter capture via Resend (`subscribe.js`), hardened (honeypot, rate
  limit, normalization).
- Bug-report endpoint (`report.js`) — the one cross-repo contract with the
  game (needs REPORT_EMAIL env var set in Netlify).
- Security headers / CSP, www redirect, og-image.

## Phase W2 — Content & SEO 🔄 (current)
- ✅ Canonical domain unified to echoesofthegarden.com (was split with
  netlify.app). [ACTION: set primary domain in Netlify dashboard]
- ✅ Bestiary section, generated from the game's `.tres` (single source of
  truth), baked as static indexable HTML, grouped by biome, cards link out.
- ✅ Per-creature lore pages (`/bestiary/{slug}/`), indexable, OG + JSON-LD.
- ✅ sitemap.xml + robots.txt; VideoGame JSON-LD enriched with character list.
- ⏳ Lore-forward landing content: surface a real epitaph / death prose
  (the feeling, not just the feature list). Pull from death_flavor.
- ⏳ Link the Steam page (sameAs in JSON-LD + visible CTA) once it exists.
- ⏳ Per-section OG images for deep-link social shares.

## Phase W3 — Steam launch alignment ⏳
*Runs alongside the game's Steam page going live.*
- ⏳ Prominent "Wishlist on Steam" CTA above the fold (the site's #1 job once
  the page exists — every visitor should be one click from wishlisting).
- ⏳ Devlog / news section (mirrors Steam news + newsletter per phase close).
- ⏳ Press-kit page (presskit() style: logo, screenshots, fact sheet, contact)
  for any coverage.

## Phase W4 — Internationalization (ES + IT) ⏳
*Gated on the GAME's i18n landing (improvements block 5). Do NOT start before
the game has validated ES/IT translations — building it earlier means
hand-translating content that will change.*
- ⏳ Static per-language pages (`/`, `/es/`, `/it/`) with `hreflang` — NOT
  JS-swapped content (that breaks the SEO this phase exists for).
- ⏳ Language selector switching between those URLs; optional first-visit
  browser-locale suggestion (URL is canonical, JS only suggests).
- ⏳ Extend `build-bestiary.mjs` to consume the game's translated `.tres`
  and emit all three language versions automatically (bestiary + creature
  pages). Web-original strings (hero, features) translated by hand — few.

## Phase W5 — Post-launch / nice-to-have ⏳
- ⏳ Lineage / Book of Echoes showcase (if the game ships RFC-001/003 and
  there's shareable player data worth surfacing).
- ⏳ Community links (Discord/forum) if a community forms.
- ⏳ Analytics (privacy-first, e.g. Plausible) to see what actually converts.

---

## Top risks / notes
- **Content drift**: the bestiary auto-syncs via `npm run bestiary`, but only
  after the game's branch is on `main`. Re-run after game lore changes.
- **i18n maintenance cost**: only worth it automated (W4) — manual trilingual
  upkeep would not be sustainable solo.
- **The web is secondary to Steam for traffic** — prioritize the wishlist CTA
  (W3) over polish. Most players arrive via Steam; the web captures the
  organic long tail and serves press/lore.
