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
 *   4. bestiary/index.html        — every species; the homepage shows a few per biome
 *   5. assets/creatures/{id}.png  — sprites copied so the site is self-contained
 *
 * Usage:  npm run bestiary          (GAME_DIR=/path/to/game npm run bestiary)
 */
import { writeFile, mkdir, readFile, copyFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { CHROME_CSS, HEADER, CTA } from "./site-chrome.mjs";

const GAME = process.env.GAME_DIR ?? "../echoes-of-the-garden";
const CREATURE_DIR = join(GAME, "data/creatures");
const SPRITE_DIR = join(GAME, "assets/sprites/creatures");
const SITE = "https://echoesofthegarden.com";

// All 28 species: every top-level .tres (data/creatures/variants = synthesis forms, kept secret).
const LAUNCH_IDS = (await readdir(CREATURE_DIR)).filter((f) => f.endsWith(".tres")).map((f) => f.slice(0, -5)).sort();

const ECO_LABEL = { roots: "Roots of the World", ash: "Tide of Ash", garden: "Suspended Garden", cave: "Luminous Cave" };
const ECO_ORDER = { roots: 0, ash: 1, garden: 2, cave: 3 };
// ADR-011: garden/cave ship with the first two Early Access content updates.
const ECO_NOTE = { garden: " — first Early Access update", cave: " — second Early Access update" };
// ADR-009: band_affinities index = birth band (UTC 6h bands).
const BANDS = ["night", "morning", "midday", "evening"];
// The homepage shows this many per biome and links to /bestiary/ for the rest: 28 cards made it 4 800 px tall on a phone.
const HOME_PER_BIOME = 2;

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

/** Homepage grid: a few per biome with subheadings, the teaser, then the link to every species. */
function renderGrid(records) {
  const sections = [];
  const ecos = Object.keys(ECO_ORDER);
  for (const eco of ecos) {
    const group = records.filter((r) => r.ecosystem === eco).slice(0, HOME_PER_BIOME);
    const cards = group.map((r, i) => card(r, i)).join("\n");
    const tail = eco === ecos.at(-1) ? "\n" + TEASER : "";
    const title = ECO_LABEL[eco] + (ECO_NOTE[eco] ?? "");
    sections.push(`      <h3 class="beast-biome-title beast-biome-${eco}">${title}</h3>
      <div class="beast-grid">
${cards}${tail}
      </div>`);
  }
  sections.push(`      <p class="beast-all"><a class="btn-ghost" href="/bestiary/">See all ${records.length} creatures →</a></p>`);
  return "\n" + sections.join("\n") + "\n      ";
}

const PAGE_FONTS = `  <link rel="preload" href="/assets/fonts/crimson-pro-normal-300-600.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/cinzel-decorative-normal-700.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/fonts/fonts.css">`;

/** /bestiary/: every species, grouped by biome. */
function indexPage(records) {
  const url = `${SITE}/bestiary/`;
  const description = `All ${records.length} creatures of Echoes of the Garden, an idle creature collector where life and death are permanent.`;
  const groups = Object.keys(ECO_ORDER).map((eco) => {
    const items = records.filter((r) => r.ecosystem === eco).map((r) => `      <li><a href="/bestiary/${r.slug}/">
        <img src="/${r.sprite}" alt="" width="72" height="72" loading="lazy">
        <strong>${esc(r.name)}</strong>
        <span>${esc(r.flavor)}</span>
      </a></li>`).join("\n");
    return `    <h2 class="eco ${eco}">${ECO_LABEL[eco]}${ECO_NOTE[eco] ?? ""}</h2>
    <ul class="grid">
${items}
    </ul>`;
  }).join("\n");
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Bestiary | Echoes of the Garden</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="The Bestiary | Echoes of the Garden">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${SITE}/og-image.jpg">
  <meta property="og:url" content="${url}">
${PAGE_FONTS}
  <style>
    :root { --bg: #090b08; --gold: #e8cb7a; --green: #5a9e6a; --amber: #d68b4a; --text: #cdd2c4; --dim: #8a917f; --border: #222820 }
    * { box-sizing: border-box; margin: 0; padding: 0 }
    body { background: var(--bg); color: var(--text); font-family: 'Crimson Pro', serif; line-height: 1.6 }
    main { max-width: 900px; margin: 0 auto; padding: 24px 16px 0 }
    h1 { font-family: 'Cinzel Decorative', serif; color: var(--gold); font-size: 32px; margin: 16px 0 8px; text-align: center }
    .lead { color: var(--dim); text-align: center; margin-bottom: 24px }
    h2.eco { text-transform: uppercase; letter-spacing: .1em; font-size: 15px; margin: 36px 0 14px; color: var(--green) }
    h2.ash { color: var(--amber) }
    h2.garden { color: #b8aee0 }
    h2.cave { color: #e8c870 }
    .grid { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px }
    .grid a { display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; padding: 16px 12px; border: 1px solid var(--border); border-radius: 6px; text-align: center; text-decoration: none; color: var(--text) }
    .grid a:hover { border-color: var(--gold) }
    .grid img { image-rendering: pixelated }
    .grid strong { color: var(--gold); font-size: 18px }
    .grid span { color: var(--dim); font-size: 15px; font-style: italic }
    a { color: var(--gold) }${CHROME_CSS}
  </style>
</head>

<body>
${HEADER}
  <main>
    <h1>The Bestiary</h1>
    <p class="lead">${records.length} species across four ecosystems. Each one lives once.</p>
${groups}
  </main>
${CTA}
</body>

</html>
`;
}

/** One indexable lore page per creature. */
function page(r, records) {
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
  <meta name="twitter:card" content="summary">
  <script type="application/ld+json">
${ld}
</script>
${PAGE_FONTS}
  <style>
    :root { --bg: #090b08; --gold: #e8cb7a; --green: #5a9e6a; --amber: #d68b4a; --text: #cdd2c4; --dim: #8a917f; }
    * { box-sizing: border-box; margin: 0; padding: 0 }
    body { background: var(--bg); color: var(--text); font-family: 'Crimson Pro', serif; line-height: 1.65 }
    main { display: flex; flex-direction: column; align-items: center; padding: 24px 20px 0; text-align: center }
    .sprite { width: 144px; height: 144px; image-rendering: pixelated; margin-bottom: 20px }
    h1 { font-family: 'Cinzel Decorative', serif; color: var(--gold); font-size: 32px; margin-bottom: 6px }
    .eco { text-transform: uppercase; letter-spacing: .1em; font-size: 13px; margin-bottom: 4px }
    .eco.roots { color: var(--green) }
    .eco.ash { color: var(--amber) }
    .eco.garden { color: #b8aee0 }
    .eco.cave { color: #e8c870 }
    .traits { color: var(--dim); font-size: 14px; margin-bottom: 6px }
    .bands { color: var(--dim); font-size: 13px; margin-bottom: 8px }
    .bands-help { font-size: 13px; margin: 0 0 24px }
    .lore { max-width: 540px; font-size: 18px; font-style: italic; margin-bottom: 16px }
    .epitaph { max-width: 540px; font-size: 15px; color: var(--dim); margin-bottom: 32px }
    a { color: var(--gold); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color .2s }
    a:hover { border-color: var(--gold) }
    .related { max-width: 540px; font-size: 15px; color: var(--dim); margin-bottom: 16px; text-align: center }
    .back { font-size: 15px; letter-spacing: .05em }${CHROME_CSS}
  </style>
</head>

<body>
${HEADER}
  <main>
  <img class="sprite" src="../../${r.sprite}" alt="${esc(r.name)} pixel creature sprite" width="144" height="144">
  <h1>${esc(r.name)}</h1>
  <div class="eco ${r.ecosystem}">${ECO_LABEL[r.ecosystem]}</div>
  <div class="traits">${r.lifespan} life · ${r.yield} yield · ${r.affinity} resonance</div>
  <div class="bands">Born by ${bands}</div>
  <p class="bands-help"><a href="/#systems">How resonances work</a></p>
  <p class="lore">${esc(r.lore)}</p>
  <p class="epitaph">On its death: “${esc(r.death_flavor)}”</p>
  <p class="related"><span>More from ${ECO_LABEL[r.ecosystem]}</span>${records.filter((o) => o.ecosystem === r.ecosystem && o.slug !== r.slug).slice(0, 3).map((o) => ` · <a href="/bestiary/${o.slug}/">${esc(o.name)}</a>`).join("")}</p>
  <a class="back" href="/bestiary/">← The Bestiary of Echoes of the Garden</a>
  </main>
${CTA}
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
    await writeFile(`bestiary/${r.slug}/index.html`, page(r, records));
  }
  await writeFile("bestiary/index.html", indexPage(records));
  console.log(`${records.length} creature pages and bestiary/index.html written`);

  // Homepage JSON-LD character list + sitemap.xml follow the same records.
  const chars = records.map((r) => ({ "@type": "Thing", name: r.name, url: `${SITE}/bestiary/${r.slug}/` }));
  html = html.replace(/"character": \[[\s\S]*?\]\n/, () => `"character": ${JSON.stringify(chars)}\n`);
  await writeFile("index.html", html);
  const urls = [`  <url><loc>${SITE}/bestiary/</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`, ...records.map((r) =>
    `  <url><loc>${SITE}/bestiary/${r.slug}/</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`)];
  // Only the bestiary's own lines change: the sitemap also lists /privacy/ and the dev log.
  const sitemap = (await readFile("sitemap.xml", "utf8")).split("\n").filter((l) => !l.includes("/bestiary/")).join("\n");
  await writeFile("sitemap.xml", sitemap.replace("</urlset>", `${urls.join("\n")}\n</urlset>`));
  console.log("JSON-LD character list + sitemap.xml updated");
  console.log("Done. Review the diff, then commit.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
