# Web Backlog — echoesofthegarden.com

`✅` Done · `🔄` In progress · `⏳` Pending · `❌` Discarded
Tasks for the web repo only. See WEB-ROADMAP.md for phasing.

---

## Done ✅
- ✅ Static site, brand design system, newsletter (Resend + hardening)
- ✅ Bug-report endpoint `report.js` (cross-repo contract with the game)
- ✅ Canonical domain unified to echoesofthegarden.com (code side)
- ✅ Bestiary from game `.tres`, static/indexable, grouped by biome
- ✅ Cards link to per-creature pages (`/bestiary/{slug}/`)
- ✅ Per-creature lore pages with OG + Article JSON-LD
- ✅ sitemap.xml, robots.txt, _redirects (clean bestiary URLs)
- ✅ Homepage VideoGame JSON-LD enriched with character list
- ✅ Card alignment fix (equal-height flex, footer-anchored badges)
- ✅ build-bestiary.mjs generator + package.json (`npm run bestiary`)

## Pending — your manual actions ⚠️
- ⚠️ Netlify: set echoesofthegarden.com as PRIMARY domain (netlify.app →
  redirect) — otherwise duplicate content despite the code fix
- ⚠️ Netlify: set REPORT_EMAIL env var so the bug-report endpoint delivers
- ⚠️ Run `npm run bestiary` once the game's branch is merged to `main` (the
  bundled HTML was baked from a local workspace for now)

## Phase W2 — remaining ⏳
- ⏳ Lore-forward section on the landing page (epitaph / death prose)
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
