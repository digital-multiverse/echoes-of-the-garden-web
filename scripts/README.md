# Web build scripts

## build-bestiary.mjs
Regenerates the Bestiary from the game repo's `.tres` files (single source
of truth = the game). Run after any game lore/creature change:
`npm run bestiary`

Outputs (all committed):
- `bestiary.json` — editable data snapshot
- `index.html` — static bestiary grid baked between `<!-- BESTIARY:START/END -->`
  (SEO: real indexable HTML, not JS-rendered) + enriched VideoGame JSON-LD
  with the character list
- `bestiary/{slug}/index.html` — one indexable lore page per creature
- `sitemap.xml` — homepage + all creature pages

Fetches data + sprites via raw.githubusercontent (main branch). REQUIRES the
game's branch merged to `main` (the .tres live there).

NOTE: the version shipped in this bundle was baked from a local game
workspace for verification. Once main has the .tres, `npm run bestiary`
reproduces it from the canonical source.
