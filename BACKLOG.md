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

## Pending — your manual actions ⚠️
- ⚠️ **[GAME REPO — hand to Claude Code]** The game's "Report a Bug" POSTs to
  `echoesofthegarden.com/.netlify/functions/report` — a domain that isn't
  bought, so the host doesn't resolve and every report from itch playtesters
  fails (falls back to Save Backup; the report is lost). Re-point the game to
  `echoes-of-the-garden.netlify.app/.netlify/functions/report` until EA.
  (Flagged from session-12 notes; couldn't read live `hud.gd` — repo is
  private. Confirm against the actual source.)
- ⚠️ Netlify: set REPORT_EMAIL env var — the second half of the same fix: even
  with the URL corrected, `report.js` delivers nothing until this is set
- ⚠️ Run `npm run bestiary` once the game's branch is merged to `main` (the
  bundled HTML was baked from a local workspace for now)

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
