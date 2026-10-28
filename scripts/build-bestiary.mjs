#!/usr/bin/env node
/**
 * build-bestiary.mjs — regenerate the Bestiary from the GAME repo.
 *
 * The game repo is PRIVATE, so the data is read from a local checkout
 * (sibling folder by default, override with GAME_DIR). Outputs, all committed:
 *   1. bestiary.json              — the data snapshot (single source of truth here)
 *   2. index.html bestiary grid   — STATIC HTML baked between markers (SEO:
 *                                   search engines index real HTML, not JS)
 *   3. bestiary/{slug}/index.html — one indexable lore page per creature
 *   4. assets/creatures/{id}.png  — sprites copied so the site is self-contained
 *
 * Usage:  npm run bestiary          (GAME_DIR=/path/to/game npm run bestiary)
 */
import { writeFile, mkdir, readFile, copyFile } from "node:fs/promises";
import { join } from "node:path";

const GAME = process.env.GAME_DIR ?? "../echoes-of-the-garden";
const CREATURE_DIR = join(GAME, "data/creatures");
const SPRITE_DIR = join(GAME, "assets/sprites/creatures");
const SITE = "https://echoes-of-the-garden.netlify.app";

// Launch creatures = Roots + Ash. Cave/garden .tres are sprite-less stubs.
const LAUNCH_IDS = [
  "lagarto_musgo", "tortuga_roca", "escarabajo_raiz", "babosa_turba",
  "oruga_tierra", "ciempies_anciano", "micelio_raiz",
  "salamandra_ceniza", "halcon_brasa", "escorpion_ceniza", "serpiente_humo",
  "avispa_llama", "topo_carbon", "dragon_ceniza",
];

const ECO_LABEL = { roots: "Roots of the World", ash: "Tide of Ash" };
const ECO_ORDER = { roots: 0, ash: 1 };
// ADR-009: band_affinities index = birth band (UTC 6h bands).
const BANDS = ["night", "morning", "midday", "evening"];

const field = (src, name) => {
  const m = src.match(new RegExp(`^${name} = "([\\s\\S]*?)"$`, "m"));
  return m ? m[1] : "";
};
const num = (src, name, d) => {
  const m = src.match(new RegExp(`^${name} = ([\\d.]+)$`, "m"));
  return m ? parseFloat(m[1]) : d;
};
const strArray = (src, name) => {
  const m = src.match(new RegExp(`^${name} = PackedStringArray\\((.*)\\)$`, "m"));
  return m ? [...m[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]) : [];
};
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");
const clean = (s) => s.replace(/\s+/g, " ").trim();

/** Mirror the in-game Codex qualitative thresholds exactly. */
const lifespanOf = (dur) => (dur < 0.8 ? "Fleeting" : dur > 1.2 ? "Enduring" : "Steady");
const yieldOf = (rate) => (rate >= 2.5 ? "Bountiful" : rate >= 1.5 ? "Generous" : "Modest");

const slug = (name) => name.toLowerCase().replace(/ /g, "-").replace(/'/g, "");

async function buildRecords() {
  const records = [];
  for (const id of LAUNCH_IDS) {
    let tres;
    try {
      tres = await readFile(join(CREATURE_DIR, `${id}.tres`), "utf8");
    } catch (err) {
      console.warn(`  WARN skipping ${id}: ${err.message}`);
      continue;
    }
    const lore = clean(field(tres, "lore"));
    const name = field(tres, "display_name");
    records.push({
      id,
      name,
      slug: slug(name),
      ecosystem: field(tres, "ecosystem"),
      affinity: cap(field(tres, "affinity")),
      band_affinities: strArray(tres, "band_affinities").map(cap),
      lifespan: lifespanOf(num(tres, "stage_duration_multiplier", 1.0)),
      yield: yieldOf(num(tres, "base_resource_rate", 1.0)),
      flavor: lore ? `${lore.split(".")[0].trim()}.` : "",
      lore,
      death_flavor: clean(field(tres, "death_flavor")),
      sprite: `assets/creatures/${id}.png`,
    });
    try {
      await copyFile(join(SPRITE_DIR, `${id}.png`), `assets/creatures/${id}.png`);
    } catch (err) {
      console.warn(`  WARN sprite missing: ${id} (${err.message})`);
    }
  }
  // Group: roots first, ash second; alphabetical within biome.
  records.sort((a, b) =>
    (ECO_ORDER[a.ecosystem] ?? 9) - (ECO_ORDER[b.ecosystem] ?? 9) ||
    a.name.localeCompare(b.name));
  return records;
}

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A single creature card (static, indexable markup). */
function card(r, i) {
  const delay = i % 3 ? ` reveal-d${i % 3}` : "";
  return `        <a class="beast-card beast-${r.ecosystem} reveal${delay}" href="/bestiary/${r.slug}/">
          <img class="beast-sprite" src="${r.sprite}" alt="${esc(r.name)} — pixel creature sprite" width="72" height="72" loading="lazy">
          <h3 class="beast-name">${esc(r.name)}</h3>
          <div class="beast-eco">${ECO_LABEL[r.ecosystem] ?? r.ecosystem}</div>
          <div class="beast-traits">${r.lifespan} life · ${r.yield} yield · ${r.affinity} resonance</div>
          <p class="beast-flavor">${esc(r.flavor)}</p>
        </a>`;
}

const TEASER = `        <article class="beast-card beast-secret reveal">
          <div class="beast-sprite beast-unknown" aria-hidden="true">?</div>
          <h3 class="beast-name">???</h3>
          <div class="beast-eco">Synthesis</div>
          <div class="beast-traits">The garden teaches; it does not instruct.</div>
          <p class="beast-flavor">Two more forms exist. No seed sells them. They are learned.</p>
        </article>`;

/** Grouped-by-biome grid with subheadings — the teaser closes the Ash group. */
function renderGrid(records) {
  const sections = [];
  for (const [eco, title, cls] of [["roots", "Roots of the World", "roots"],
                                    ["ash", "Tide of Ash", "ash"]]) {
    const group = records.filter((r) => r.ecosystem === eco);
    const cards = group.map((r, i) => card(r, i)).join("\n");
    const tail = eco === "ash" ? "\n" + TEASER : "";
    sections.push(`      <h3 class="beast-biome-title beast-biome-${cls}">${title}</h3>
      <div class="beast-grid">
${cards}${tail}
      </div>`);
  }
  return "\n" + sections.join("\n") + "\n      ";
}

/** One indexable lore page per creature. */
function page(r) {
  const url = `${SITE}/bestiary/${r.slug}/`;
  const img = `${SITE}/${r.sprite}`;
  const bands = r.band_affinities.map((a, i) => `${BANDS[i]} → ${a}`).join(" · ");
  const ld = JSON.stringify({
    "@context": "https://schema.org", "@type": "Article",
    headline: `${r.name} — Echoes of the Garden Bestiary`, about: r.name, image: img,
    isPartOf: { "@type": "VideoGame", name: "Echoes of the Garden", url: `${SITE}/` },
  });
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(r.name)} — Echoes of the Garden Bestiary</title>
  <meta name="description"
    content="${esc(r.flavor)} ${esc(r.name)}, a creature of ${ECO_LABEL[r.ecosystem]} in Echoes of the Garden — an idle creature collector where life and death are permanent.">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(r.name)} — Echoes of the Garden">
  <meta property="og:description" content="${esc(r.flavor)}">
  <meta property="og:image" content="${img}">
  <meta property="og:url" content="${url}">
  <script type="application/ld+json">
${ld}
</script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Crimson+Pro:ital@0;1&display=swap');
    :root { --bg: #090b08; --gold: #e8cb7a; --green: #5a9e6a; --amber: #d68b4a; --text: #cdd2c4; --dim: #8a917f; }
    * { box-sizing: border-box; margin: 0; padding: 0 }
    body { background: var(--bg); color: var(--text); font-family: 'Crimson Pro', serif; line-height: 1.65; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center }
    .sprite { width: 144px; height: 144px; image-rendering: pixelated; margin-bottom: 20px }
    h1 { font-family: 'Cinzel Decorative', serif; color: var(--gold); font-size: 32px; margin-bottom: 6px }
    .eco { text-transform: uppercase; letter-spacing: .1em; font-size: 13px; margin-bottom: 4px }
    .eco.roots { color: var(--green) }
    .eco.ash { color: var(--amber) }
    .traits { color: var(--dim); font-size: 14px; margin-bottom: 6px }
    .bands { color: var(--dim); font-size: 13px; margin-bottom: 24px }
    .lore { max-width: 540px; font-size: 18px; font-style: italic; margin-bottom: 16px }
    .epitaph { max-width: 540px; font-size: 15px; color: var(--dim); margin-bottom: 32px }
    a { color: var(--gold); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color .2s }
    a:hover { border-color: var(--gold) }
    .back { font-size: 14px; letter-spacing: .05em }
  </style>
</head>

<body>
  <img class="sprite" src="../../${r.sprite}" alt="${esc(r.name)} pixel creature sprite" width="144" height="144">
  <h1>${esc(r.name)}</h1>
  <div class="eco ${r.ecosystem}">${ECO_LABEL[r.ecosystem]}</div>
  <div class="traits">${r.lifespan} life · ${r.yield} yield · ${r.affinity} resonance</div>
  <div class="bands">Born by ${bands}</div>
  <p class="lore">${esc(r.lore)}</p>
  <p class="epitaph">On its death: “${esc(r.death_flavor)}”</p>
  <a class="back" href="/#bestiary">← The Bestiary of Echoes of the Garden</a>
</body>

</html>
`;
}

async function main() {
  await mkdir("assets/creatures", { recursive: true });
  console.log(`Reading creatures from ${CREATURE_DIR} ...`);
  const records = await buildRecords();
  if (records.length === 0) {
    console.error("ERROR: no creatures read — is GAME_DIR pointing at the game checkout?");
    process.exit(1);
  }

  await writeFile(
    "bestiary.json",
    JSON.stringify({ source: CREATURE_DIR, count: records.length, creatures: records }, null, 2) + "\n",
  );
  console.log(`bestiary.json written (${records.length} creatures)`);

  // Bake static HTML between markers — the rest of index.html is untouched.
  const START = "<!-- BESTIARY:START -->";
  const END = "<!-- BESTIARY:END -->";
  let html = await readFile("index.html", "utf8");
  if (!html.includes(START) || !html.includes(END)) {
    console.error(`ERROR: markers ${START} / ${END} not found in index.html`);
    process.exit(1);
  }
  html = html.replace(
    new RegExp(`${START}[\\s\\S]*?${END}`),
    () => `${START}${renderGrid(records)}${END}`,
  );
  await writeFile("index.html", html);
  console.log("index.html bestiary grid baked (static, SEO-friendly)");

  for (const r of records) {
    await mkdir(`bestiary/${r.slug}`, { recursive: true });
    await writeFile(`bestiary/${r.slug}/index.html`, page(r));
  }
  console.log(`${records.length} creature pages written under bestiary/`);
  console.log("Done. Review the diff, then commit.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
