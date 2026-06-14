# Web build scripts

## build-bestiary.mjs
Regenerates the Bestiary from the game repo's `.tres` files (single source
of truth = the game). Run after any game lore/creature change:

    npm run bestiary        (or: node scripts/build-bestiary.mjs)

Outputs (all committed):
- `bestiary.json` — editable data snapshot, grouped roots→ash
- `index.html` — static bestiary grid baked between `<!-- BESTIARY:START/END -->`,
  grouped by biome with subheadings (SEO: real indexable HTML) + enriched
  VideoGame JSON-LD character list
- `bestiary/{slug}/index.html` — one indexable lore page per creature
- `sitemap.xml` — homepage + all creature pages

Fetches data + sprites via raw.githubusercontent (main branch). REQUIRES the
game's branch merged to `main` (the .tres live there). The version in this
bundle was baked from a local workspace for verification; once main has the
.tres, `npm run bestiary` reproduces it from the canonical source.
