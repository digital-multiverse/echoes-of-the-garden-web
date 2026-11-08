---
name: design-review
description: >
  Repeatable product review of the Echoes of the Garden WEBSITE (echoesofthegarden.com,
  en/es/it), not the game. Reviewer role only: opens the real pages in a browser at
  desktop and mobile widths, measures real performance, and judges clarity, calls to
  action, copy and language coherence, accessibility and trust. Never edits the site.
  Triggers on: "design review", "revisión de la web", "review the website", "UX review
  de la web", "pase de diseño", "¿se entiende la web?", "PageSpeed", "auditoría web".
---

# Design review: website (reviewer, not fixer)

## 0. Honesty contract

- **No changes to the site** in a review block, not even "obvious" one-liners. Each finding
  ends in a proposal, and the user decides. Cloudflare changes go through the
  `infra-servidores` skill, and only after an OK.
- **Every claim carries one tag**: **(O)** observed on the live site (screenshot,
  measurement, curl) · **(H)** heuristic or convention · **(D)** document (BACKLOG,
  game ROADMAP/ADR, code). Never write a visitor reaction you did not observe.
- Say which numbers are lab and which are field. Lighthouse in local = lab. CrUX only
  exists once there is traffic.
- Legal points are (H) and say "not legal advice".
- Review the **live domain**, not `index.html` on disk. Cloudflare injects scripts and
  headers that the repo does not show.

## 1. Intent to judge against (D)

Read first: `README.md`, `BACKLOG.md` (what is already planned, so you don't "find" it
again), the game's `ROADMAP.md` and `docs/adr/012-*` (EA ships **without** the Market:
any copy that implies trading today is a finding), `docs/adr/013-*` (the Gardener is
not named on the site). Previous review: the last `docs/REVIEW-WEB-*.md`, to check
what was fixed.

## 2. Lenses

1. **5-second test:** from the first screen alone (1280×800 and 390×844), can you say
   what the game is, what you do in it, and what it costs? Is there an image of the game
   above the fold?
2. **Calls to action:** "Play in browser" (itch) and "Subscribe". Are they reachable from
   every page type: home, creature, dev log entry, 404? How far down the page in mobile px
   is the newsletter? Does itch link back to the site?
3. **Copy and languages:** promises the plan doesn't support (Market, real money,
   Founder's Seed, dates), repeated messages, jargon a newcomer can't read ("Echo Arc
   tiers"). For es/it: English left in the page, a language switcher visible without
   scrolling, species names, literal translations.
4. **Accessibility beyond Lighthouse:** font size ≤ 11 px, tap targets < 44 px, broken
   `aria-labelledby`, content hidden until JS runs (`.reveal`), `prefers-reduced-motion`,
   focus styles, a `<main>` on every template.
5. **Real performance:** see §3.
6. **Trust:** privacy text vs. what actually loads (third-party scripts, cookies),
   unsubscribe as promised vs. how it works (`src/worker.js`), legal notice (LSSI-CE
   art. 10) reachable, dead `href="#"` links, visual consistency of privacy and 404 with
   the rest, security headers, redirects (`www`, `.es`, netlify.app).

## 3. Session recipe (all (O) evidence comes from here)

Put everything in the scratchpad (`shots/`, `psi/`), never in the repo.

**Screenshots of the first screen (headless Chromium, reliable widths):**
```bash
B=https://echoesofthegarden.com
for p in home: es:es/ it:it/ devlog:devlog/ devpost:devlog/<slug>/ creature:bestiary/<slug>/ privacy:privacy/ 404:no-existe/; do
  n=${p%%:*}; u=${p#*:}
  for s in 1280,800 390,844 900,600; do
    chromium --headless=new --hide-scrollbars --disable-gpu --virtual-time-budget=4000 \
      --window-size=$s --screenshot=$SHOTS/${n}_${s%%,*}.png $B/$u
  done
done
```
900 px catches the nav breaking between the desktop and mobile layouts.

**Sections below the fold:** use Chrome (claude-in-chrome). Scroll with
`document.getElementById(id).scrollIntoView()` plus a 900 ms wait (so `.reveal` fires),
then take the screenshot with `save_to_disk`. **Do not trust `resize_window`**: it set
322, 500 and 899 px wide when asked for 390. Read `innerWidth` back before judging a
width. For exact mobile widths, use the headless captures above. Also measure:
`document.body.scrollHeight`, the `offsetHeight` of each section, the offset of the first
game image, and the size of the menu button.

**Do not use Lighthouse's `fullPageScreenshot`.** It stretches the 100vh hero across the
whole height and leaves `.reveal` sections invisible.

**Performance:**
1. Try PageSpeed first (field data plus Google's lab run):
   `curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=$B/&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo"`.
   Without an API key the shared quota is often exhausted ("Quota exceeded"). If it is,
   say so in the report and fall back to:
2. Local Lighthouse against the live domain, mobile and desktop, for `/`, `/es/`, one
   creature, `/devlog/`, `/privacy/`:
   `CHROME_PATH=/usr/bin/chromium npx -y lighthouse@13.0.1 $B/ --quiet --chrome-flags=--headless=new --output=json --output-path=psi/home_mobile.json`
   (add `--preset=desktop` for desktop). Run the home page **twice**: Total Blocking Time
   (TBT) varied 2.8–8.6 s between runs.
3. **Isolate the cause** before blaming it: rerun with
   `--blocked-url-patterns='*<suspect>*'` and compare TBT and performance. In the 2026-11
   review this showed that `garden_loop.webp` alone made up most of the blocking time.
4. Useful audits in the JSON: `mainthread-work-breakdown`, `bootup-time`,
   `image-delivery-insight`, `forced-reflow-insight`, `deprecations` (look at
   `.source.url`: in 2026-11 the deprecation warnings came from Cloudflare's
   `/cdn-cgi/challenge-platform/`, not from site code), `landmark-one-main`.

**Quick checks (curl):** `curl -sI` on the root (headers), on a 404, on `www.`, on
`.es` and on netlify.app (301s). `curl -s` the itch page and grep for a link back to
the domain. `sitemap.xml` (count `<loc>`), `robots.txt`.

**Code cross-checks (read only):** the markup of the hero, nav, newsletter and footer in
`index.html`. The JS observers (scrollspy and reveal) near the end of `index.html`. The
unsubscribe flow in `src/worker.js`. The templates in `scripts/build-*.mjs`, because
every creature or dev log finding is fixed there, not in the generated HTML.

## 4. Output: `docs/REVIEW-WEB-<yyyy-mm>.md`

Write it in the scratchpad first. It goes into `docs/` only after the user's OK.

1. Header: date, `main` hash, how it was reviewed, whether PageSpeed or local Lighthouse
   was used (and why), where the screenshots are.
2. Lighthouse table: page × perf mobile/desktop, a11y, BP, SEO, TBT mobile, plus the
   isolation results.
3. **Prioritised list**, by impact on understanding and conversion. Each item:
   `### N. [S|M|L] (O|H|D) title`, then what was seen with numbers, then
   `**Proposal:**` concrete (copy text written out, CSS values, file:line), then
   `Captura:` filenames.
4. What is already good (concrete, tagged).
5. Top 5 to do first.

Then a short summary in chat: the table of items, and the absolute path of the report
and the screenshots. Offer to move it into `docs/` and to start on the Top 5. Nothing
gets applied without an OK.

## 5. Self-check

- [ ] `git status` clean (the review lives in the scratchpad until the OK).
- [ ] Every item has exactly one of (O)/(H)/(D) and a concrete proposal.
- [ ] Every screenshot named in the report exists.
- [ ] Nothing already in `BACKLOG.md` is reported as new without saying so.
- [ ] Browser tabs you opened are closed.
