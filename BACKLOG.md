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
- ⚠️ `npx wrangler secret put UNSUBSCRIBE_SECRET` (a long random string). Until it is set the welcome mail
  keeps the `mailto:` unsubscribe. Then subscribe a test address and click its unsubscribe link once
- ⚠️ itch.io page: add "Website, dev log and Early Access news: echoesofthegarden.com" to the description
  and the site to the profile links — the itch page has no link back today
- ⚠️ `npm run bestiary` needs the game checkout at `../echoes-of-the-garden`
  on `main` (or `GAME_DIR=`); the raw-GitHub fetch never worked (private repo)

## Review 2026-11 ✅ (`docs/REVIEW-WEB-2026-11.md`)
- ✅ Hero: game video above the fold, one plain line on what the game is, stats a newcomer can read
- ✅ Animated WebP (1.4 MB) → MP4 loop (120 KB) + poster: home mobile Lighthouse 66–70 → 86–91 (local)
- ✅ Creature pages, dev log and the new `/bestiary/` index share a header ("Play free in browser") and a closing
  CTA; homepage shows 2 creatures per biome + "See all 28"
- ✅ Copy: no "nothing is sold for real money", no market value in the lifecycle, Trading out of the nav
- ✅ Nav: EN · ES · IT links (also in the mobile menu), hamburger below 1200 px, scrollspy fixed
- ✅ `_redirects` deleted: its only rules sent `/bestiary/` to `/#bestiary`, and `/bestiary/` is a page now
- ✅ One-click signed unsubscribe (`/api/unsubscribe`, RFC 8058 headers); privacy page updated
- ✅ Privacy names Cloudflare's `cf_clearance` security cookie (JS Detections kept on); legal notice link in the
  footer; privacy and 404 use the site fonts
- ✅ Accessibility: no text under 12 px, 44 px menu button, content visible without JS, reduced motion respected

## Move to Cloudflare Workers 🔄 (decided 2026-11-04, like comparavoto)
- ✅ Worker port ready: `wrangler.jsonc`, `src/worker.js` (`/api/subscribe`, `/api/report`), `_headers`,
  `.assetsignore`, tests with `node --test src/`
- ✅ Deployed to workers.dev in the Info account, secrets set, Resend domain verified, real subscribe and report delivered (2026-11-04). A max-size save used 10 ms of CPU
- ✅ Absolute URLs rewritten, root custom domain in `wrangler.jsonc`, Netlify redirects to the domain
- ✅ Newsletter: unsubscribe link, `List-Unsubscribe` header and `/privacy/` (one-click since review 2026-11)
- ✅ Privacy page: owner data, same as digital-multiverse.com
- ✅ Root domain deployed; `www` and `.es` redirect to it
- ✅ Workers Builds connected: a push to `main` deploys. Run `npm run build` before pushing text changes
- ⏳ Game: `REPORT_URL` to `https://echoesofthegarden.com/api/report` in the next build
- ⏳ Delete `netlify.toml` and `netlify/functions/` only when no published build posts to netlify.app. Do NOT
  add `"type": "module"` to `package.json` before that: it breaks those CommonJS functions

## Phase W2 — remaining ⏳
- ✅ Devlog: 5 milestone entries, `npm run devlog` (scripts/devlog-entries.mjs), full page per entry
- ✅ Spanish and Italian: `/es/` and `/it/` baked by `npm run i18n` from `i18n/{es,it}.json` and the game's `content.csv`; hreflang on every page. Translations are drafts pending a native review
- ✅ SEO pass: title and meta, keywords, real favicon files, 404 pages, WebP media, `llms.txt`, internal links
- ⏳ Welcome email is English only, whatever the page language
- ⏳ Lore-forward section on the landing page (epitaph / death prose) —
  creature pages already show the epitaph; the homepage doesn't yet
- ⏳ Steam page link (CTA + JSON-LD sameAs) — blocked on Steam page existing
- ⏳ Per-section OG images (bestiary share ≠ homepage share)

## Phase W3 — Steam alignment ⏳
- ⏳ "Wishlist on Steam" CTA above the fold (top priority once page is live)
- ✅ Devlog / news section
- ⏳ Press-kit page

## Phase W4 — i18n ES/IT 🔄
- ✅ /es/ and /it/ static pages + hreflang
- ✅ Language selector (URL-based links in the nav and at the foot of every page)
- ✅ Translate web-original strings (hero, features)
- ⏳ Native review of the Spanish and Italian drafts
- ⏳ Optional: suggest the visitor's language on first visit

## Icebox 🧊
- 🧊 Book of Echoes / lineage showcase (if game ships it + shareable data)
- 🧊 Community links (Discord) if a community forms — the "Discord (soon)" placeholder was removed
- 🧊 Privacy-first analytics (Plausible)
- 🧊 Blog/changelog with RSS for devlog syndication
