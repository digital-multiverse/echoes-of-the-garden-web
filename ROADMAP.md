# Web Roadmap — echoesofthegarden.com

> Separate from the game roadmap. This repo (`echoes-of-the-garden-web`) is
> the marketing/lore face of the game: Netlify static site + Functions, owned
> by the chat assistant. The game is an upstream data source (read via raw),
> never a dependency the other way. Quarters are loose targets, not deadlines.

---

## Phase W1 — Foundation ✅ (done)
- Static site live on Netlify at `echoes-of-the-garden.netlify.app`, brand
  design system (Crimson Pro / Cinzel, forest-dark palette). Custom domain
  `echoesofthegarden.com` is NOT bought yet — deliberately deferred to EA
  (see W3 + Top risks). The netlify.app subdomain is the current home.
- Newsletter capture via Resend (`subscribe.js`), hardened (honeypot, rate
  limit, normalization).
- Bug-report endpoint (`report.js`) — the one cross-repo contract with the
  game (needs REPORT_EMAIL env var set in Netlify).
- Security headers / CSP, www redirect, og-image.

## Phase W2 — Content & SEO 🔄 (current)
- ✅ Site metadata is internally consistent on ONE home —
  `echoes-of-the-garden.netlify.app`: canonical, og:url, og:image,
  twitter:image, JSON-LD (`url`/`image`/14 `character` URLs), sitemap.xml and
  the robots Sitemap directive all agree. No split, no duplicate-content risk
  while on a single domain. (Earlier docs claimed this was "unified to
  echoesofthegarden.com" — false: that domain isn't bought. Corrected.)
- ⏳ **Migrate to `echoesofthegarden.com` at EA** — NOT before; the domain is
  unbought by design (dev runs free on netlify.app). When bought: add it as a
  Netlify custom domain + set PRIMARY (301 the netlify.app host), then rewrite
  every absolute URL to the new origin — `index.html` (7: canonical, og:url,
  og:image, twitter:image, JSON-LD url/image/character), `sitemap.xml` (15),
  and the `robots.txt` Sitemap line. Until then the netlify.app URLs are
  CORRECT and must not be "fixed" to `.com`.
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
- **Domain is netlify.app until EA**: the custom domain is a deliberate
  EA-time purchase, not a dev expense. Do NOT rewrite the netlify.app URLs to
  `echoesofthegarden.com` before it's bought and live — that would point
  canonical/OG/JSON-LD at a domain that doesn't resolve and break the live
  site's SEO. The migration is a single tracked task (W2 ⏳ above).
- **Content drift**: the bestiary auto-syncs via `npm run bestiary`, but only
  after the game's branch is on `main`. Re-run after game lore changes.
- **i18n maintenance cost**: only worth it automated (W4) — manual trilingual
  upkeep would not be sustainable solo.
- **The web is secondary to Steam for traffic** — prioritize the wishlist CTA
  (W3) over polish. Most players arrive via Steam; the web captures the
  organic long tail and serves press/lore.
