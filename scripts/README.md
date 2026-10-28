# Web build scripts

## build-bestiary.mjs
Regenerates the Bestiary from the game repo's `.tres` files (single source
of truth = the game). Run after any game lore/creature change:

    npm run bestiary                        # game checkout at ../echoes-of-the-garden
    GAME_DIR=/path/to/game npm run bestiary # elsewhere

The game repo is private, so the script reads a **local checkout** (the
`main` branch, ideally) — there is no HTTP fetch. Outputs (all committed):
- `bestiary.json` — data snapshot, grouped roots→ash, incl. `affinity` and
  `band_affinities` (ADR-008/009 resonance wheel)
- `index.html` — static bestiary grid baked between `<!-- BESTIARY:START/END -->`
  (SEO: real indexable HTML)
- `bestiary/{slug}/index.html` — one indexable lore page per creature
  (full lore, death epitaph, resonance + birth-band table)
- `assets/creatures/{id}.png` — sprites copied from the game

Not touched by the script: `sitemap.xml` and the homepage JSON-LD character
list — update by hand if a creature is added or renamed.
