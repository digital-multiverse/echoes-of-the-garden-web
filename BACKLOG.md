# Web Backlog — echoesofthegarden.com

`✅` Done · `🔄` In progress · `⏳` Pending · `❌` Discarded
Tasks for the web repo only. See WEB-ROADMAP.md for phasing.

---

## Done ✅
- ✅ Static site, brand design system, newsletter (Resend + hardening)
- ✅ Bug-report endpoint `report.js` (cross-repo contract with the game)
- ✅ Site metadata consistent on one home (`echoes-of-the-garden.netlify.app`):
  canonical, OG, Twitter, JSON-LD, sitemap, robots all agree — no split
  (was wrongly logged as "unified to .com (code side)"; .com isn't bought)
- ✅ Bestiary from game `.tres`, static/indexable, grouped by biome
- ✅ Cards link to per-creature pages (`/bestiary/{slug}/`)
- ✅ Per-creature lore pages with OG + Article JSON-LD
- ✅ sitemap.xml, robots.txt, _redirects (clean bestiary URLs)
- ✅ Homepage VideoGame JSON-LD enriched with character list
- ✅ Card alignment fix (equal-height flex, footer-anchored badges)
- ✅ build-bestiary.mjs generator + package.json (`npm run bestiary`)
- ✅ `npm run bestiary` reads the local game checkout (private repo), emits
  affinity / band_affinities + creature pages with lore and epitaph (2026-10-28)
- ✅ Landing matches the game (2026-10-28): roadmap from game `ROADMAP.md`,
  uniqueness promise per ADR-007, systems section (encounters, Seed Altar,
  resonance wheel, Echo Arc), fabricated items/features removed
- ✅ Post-ADR-012 pass (2026-10-29, game s74): roadmap Phase 4 before Phase 3,
  Market = first major update after EA; bestiary = all 28 species (Garden/Cave
  sprites); in-engine screenshots + GIF section; "What the Garden Holds Now"
  (Book of Echoes, ceremony, fragments, stats, en/es/it); itch "Play in
  browser" CTA; generator now also writes sitemap.xml + JSON-LD characters;
  the Gardener no longer named on the site (ADR-013)

## Pending — your manual actions ⚠️
- ✅ Game's "Report a Bug" re-pointed to
  `echoes-of-the-garden.netlify.app/.netlify/functions/report` (game block
  A.1, 2026-10-28)
- ⚠️ Netlify: set REPORT_EMAIL env var — the second half of the same fix: even
  with the URL corrected, `report.js` delivers nothing until this is set
- ⚠️ `npm run bestiary` needs the game checkout at `../echoes-of-the-garden`
  on `main` (or `GAME_DIR=`); the raw-GitHub fetch never worked (private repo)

## Deferred to Early Access 🗓 (do NOT start in dev)
- 🗓 Buy `echoesofthegarden.com` (Namecheap) — planned EA-time purchase, not a
  dev expense; netlify.app is the home until then
- 🗓 Add the domain to Netlify as custom + set PRIMARY (301 netlify.app → .com)
- 🗓 Rewrite all absolute URLs to the new origin: `index.html` (7),
  `sitemap.xml` (15), `robots.txt` Sitemap line. Until bought, netlify.app is
  correct — leave it
- 🗓 Re-point the game's report endpoint from netlify.app to `.com` once it
  resolves

## Phase W2 — remaining ⏳
- ⏳ Devlog: first entry (the section still shows the empty state)
- ⏳ Lore-forward section on the landing page (epitaph / death prose) —
  creature pages already show the epitaph; the homepage doesn't yet
- ⏳ Steam page link (CTA + JSON-LD sameAs) — blocked on Steam page existing
- ⏳ Per-section OG images (bestiary share ≠ homepage share)

## Phase W3 — Steam alignment ⏳
- ⏳ "Wishlist on Steam" CTA above the fold (top priority once page is live)
- ⏳ Devlog / news section
- ⏳ Press-kit page

## Phase W4 — i18n ES/IT ⏳ (gated on game i18n)
- ⏳ /es/ and /it/ static pages + hreflang
- ⏳ Language selector (URL-based, optional locale suggestion)
- ⏳ build-bestiary.mjs reads translated .tres → emits 3 language versions
- ⏳ Translate web-original strings (hero, features) — small, manual

## Icebox 🧊
- 🧊 Book of Echoes / lineage showcase (if game ships it + shareable data)
- 🧊 Community links (Discord) if a community forms
- 🧊 Privacy-first analytics (Plausible)
- 🧊 Blog/changelog with RSS for devlog syndication
