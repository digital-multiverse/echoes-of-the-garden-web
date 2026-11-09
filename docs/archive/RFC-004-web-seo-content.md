> **Archived 2026-11-08.** Historical proposal from the June 2026 design bundle, kept for context.
> Shipped since: sitemap/robots, 28 per-creature bestiary pages, epitaph/lore content, `character`
> JSON-LD, per-page OG images and ES/IT with hreflang. Still open: `sameAs` to the Steam page (4).
> The game repo reuses the number RFC-004 for an unrelated economy RFC.

# RFC-004: Web SEO & Content Strategy (web repo)

**Status**: DRAFT — proposal. Web caretaker (assistant) territory, staged
incrementally. Some parts already shipped (see below).
**Date**: 2026-06-13

## Context

Most traffic will come via Steam, but the site should capture the long tail
of organic search and serve as the lore-forward face of the game. Audit of
the current site surfaced both a fixed bug and untapped opportunities.

## Already done (this session's web bundle)
- ✅ Canonical domain unified to echoesofthegarden.com (was split with
  netlify.app — SEO authority leak). REQUIRES Netlify primary-domain config.
- ✅ Bestiary baked as static, indexable HTML from game data (bestiary.json
  + build-bestiary.mjs). Descriptive alt text per sprite.

## Proposed (incremental, web caretaker)

1. **sitemap.xml + robots.txt** — table stakes; search engines expect them.
   Cheap, do next.
2. **Per-creature pages** (`/bestiary/{slug}`): each creature its own
   indexable page with full lore, sprite, traits, and ecosystem context.
   This is real CONTENT that ranks (14 long-tail pages) and gives social
   shares a target. Generated from the same bestiary.json — extend
   build-bestiary.mjs to emit pages, not just the grid.
3. **Lore-forward landing content**: the site sells mechanics ("idle",
   "trading") but not the FEELING, which is the strongest asset. A section
   showing a real epitaph / the prose of a death would convert better than
   any feature list. Pull from death_flavor fields.
4. **Richer JSON-LD**: add a `character` list (the bestiary) to the
   VideoGame structured data; add `sameAs` linking the Steam page once it
   exists (rich results + entity association).
5. **Per-section OG images** for deep-link social shares (bestiary share ≠
   homepage share).
6. **Site i18n (ES/IT)** — SEPARATE from the game's i18n (RFC-005). Localized
   pages with hreflang capture Spanish/Italian organic search. Larger effort;
   sequence after the Steam page is live.

## Sequencing

Next web pass: sitemap/robots (1) + per-creature pages (2), both from
existing data. Lore section (3) + JSON-LD (4) when Steam page URL exists to
cross-link. Site i18n (6) last.

## Note

This RFC stays a living checklist for the web caretaker rather than a
build-gated proposal — web changes are low-risk and don't need playtest
validation the way game-design RFCs do.
