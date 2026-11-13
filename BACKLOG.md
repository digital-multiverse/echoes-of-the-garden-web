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
- ✅ `UNSUBSCRIBE_SECRET` set: the welcome mail carries the signed one-click unsubscribe link
- ✅ itch.io page links back to echoesofthegarden.com (description and profile links)
- ⚠️ Subscribe a real address, check the new welcome email and use its unsubscribe link once
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

## Review 2026-11-09 ✅ (`docs/REVIEW-WEB-2026-11-09.md`, accessibility pass in `docs/REVIEW-WEB-2026-11-08.md`)
- ✅ Mobile menu works by keyboard (focus, inert background, Escape); visible focus on every page; skip link and `<main>`
- ✅ Contrast fixes (newsletter privacy link, "Steam (soon)", roadmap phase); reduced motion stops every animation
- ✅ Newsletter form: error tied to the field; footer and language links ~44 px tall
- ✅ Mobile: trading section hidden, shorter badge, "Juega gratis", shared header logo on one line
- ✅ Creature pages link "How resonances work" → `/#systems`
- ✅ Home main-thread work 680–838 → ~450 ms (local trace): the garden canvas starts after load (it forced a full
  layout while parsing) and fonts are self-hosted in `assets/fonts/` (no late Google stylesheet = two fewer full
  layouts, no Google request; privacy and CSP updated)
- ✅ Mobile roadmap folds the finished phases behind a button (only with JS): newsletter ~15,100 px
- ✅ Production after #14 (2026-11-11, lab, host load 4–8): home mobile 86–97 (TBT 89–519 ms), desktop 94–99;
  es, dev log, entry, creature, `/bestiary/` 98–100. A11y 100 everywhere
- ✅ AI crawlers (decided 2026-11-11): assistants may read and recommend the site, training is blocked. Already true via
  AI Crawl Control (search/agents allow, training block) + Cloudflare managed robots.txt; checked by User-Agent. SEO 92
  in Lighthouse is that robots.txt's `Content-Signal` line, kept on purpose (see design-intent)
- ✅ Copy follows the Steam plan (ADR-001/011): 14 creatures and 2 ecosystems at Early Access launch, Garden and Cave in
  the first two EA updates; creature pages for garden/cave say so

## Reviews 2026-11-12 to 2026-11-14 ✅ (`docs/REVIEW-WEB-2026-11-12.md`, `-13.md`, `-14.md`)
- ✅ "How to play" guide as five Book of Echoes chapters (`scripts/build-guide.mjs`), in the nav and footer
- ✅ Game terms: "affinity" (not "resonance"), es/it trait and Altar names copied from `strings.csv`
- ✅ Garden zones: moss bands, ceremony, one gold band for the newsletter, root strands and motes cut from the game's
  sprites (`assets/motifs/`); inner pages show their nav on mobile
- ✅ Founder's Seed removed from the site and the welcome email until the game decides it; welcome email rewritten
- ✅ Share image: the game's 1200×630 header capsule (`og-image.jpg`)
- ✅ Roadmap in three stages (built, Early Access, Market) with an "Updated" date; newsletter above it
- ✅ v0.14 in the guide and roadmap (natures, Attunement); in-engine Attunement capture for the v0.14 entry
- ✅ Dev log ordered by date, then build, so same-day entries read newest first
- ✅ Roadmap and bestiary: every creature gets the same halo, coming ecosystems included; 4 + 3 per row on mobile
- ⏳ Lighthouse on an idle machine (three runs this week were on a loaded host, load 7–22 on 4 cores)

## Move to Cloudflare Workers ✅ (decided 2026-11-04, like comparavoto)
- ✅ Worker port ready: `wrangler.jsonc`, `src/worker.js` (`/api/subscribe`, `/api/report`), `_headers`,
  `.assetsignore`, tests with `node --test src/`
- ✅ Deployed to workers.dev in the Info account, secrets set, Resend domain verified, real subscribe and report delivered (2026-11-04). A max-size save used 10 ms of CPU
- ✅ Absolute URLs rewritten, root custom domain in `wrangler.jsonc`, Netlify redirects to the domain
- ✅ Newsletter: unsubscribe link, `List-Unsubscribe` header and `/privacy/` (one-click since review 2026-11)
- ✅ Privacy page: owner data, same as digital-multiverse.com
- ✅ Root domain deployed; `www` and `.es` redirect to it
- ✅ Workers Builds connected: a push to `main` deploys. Run `npm run build` before pushing text changes
- ✅ Game: `REPORT_URL` is `https://echoesofthegarden.com/api/report` since build v0.12.1 (v0.13.0 too)
- ✅ `netlify.toml` and `netlify/functions/` deleted (2026-11-10): no published build posts to netlify.app,
  and the Netlify site is switched off (old netlify.app links now return 404)

## Phase W2 — remaining ⏳
- ✅ Devlog: 5 milestone entries, `npm run devlog` (scripts/devlog-entries.mjs), full page per entry
- ✅ Spanish and Italian: `/es/` and `/it/` baked by `npm run i18n` from `i18n/{es,it}.json` and the game's `content.csv`; hreflang on every page. Translations are drafts pending a native review
- ✅ SEO pass: title and meta, keywords, real favicon files, 404 pages, WebP media, `llms.txt`, internal links
- ⏳ Welcome email is English only, whatever the page language
- ✅ Lore-forward landing: the home tells Hollowroot's life and death with the game's own death screen text
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
