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
import { HEAD_ASSETS, header, CTA, FOOTER } from "./site-chrome.mjs";

const GAME = process.env.GAME_DIR ?? "../echoes-of-the-garden";
const CREATURE_DIR = join(GAME, "data/creatures");
const SPRITE_DIR = join(GAME, "assets/sprites/creatures");
const SITE = "https://echoesofthegarden.com";

// All 28 species: every top-level .tres (data/creatures/variants = synthesis forms, kept secret).
const LAUNCH_IDS = (await readdir(CREATURE_DIR)).filter((f) => f.endsWith(".tres")).map((f) => f.slice(0, -5)).sort();

const ECO_LABEL = { roots: "Roots of the World", ash: "Tide of Ash", garden: "Suspended Garden", cave: "Luminous Cave" };
const ECO_ORDER = { roots: 0, ash: 1, garden: 2, cave: 3 };
// ADR-011: garden/cave ship with the first two Early Access content updates.
const ECO_NOTE = { garden: "First Early Access update", cave: "Second Early Access update" };
// ADR-009: band_affinities index = birth band (UTC 6h bands).
const BANDS = ["Born at night", "Born in the morning", "Born at midday", "Born in the evening"];

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

/** Homepage: the launch creatures laid out like a garden in the game, one per biome; the rest are a link away. */
function renderGrid(records) {
  const garden = (eco) => `      <h3 class="garden-title">${ECO_LABEL[eco]}</h3>
      <ul class="garden">
${records.filter((r) => r.ecosystem === eco).map((r) => `        <li><a href="/bestiary/${r.slug}/"><span class="halo"><img src="${r.sprite}" alt="" width="24" height="24" loading="lazy"></span><span>${esc(r.name)}</span></a></li>`).join("\n")}
      </ul>`;
  const later = records.filter((r) => ECO_NOTE[r.ecosystem]).length;
  return `
${garden("roots")}
${garden("ash")}
      <p class="bestiary-more">${later} more live in the Suspended Garden and the Luminous Cave. <a href="/bestiary/">See all ${records.length} creatures in the bestiary</a></p>
      <p class="bestiary-more unlearned">Two more forms can't be bought. You learn them by playing.</p>
      `;
}

const halo = (r, lazy = true) => `<span class="halo"><img src="/${r.sprite}" alt="" width="24" height="24"${lazy ? ' loading="lazy"' : ""}></span>`;
const garden = (list, cls = "") => `    <ul class="garden${cls}">
${list.map((r) => `      <li><a href="/bestiary/${r.slug}/">${halo(r)}<span>${esc(r.name)}</span></a></li>`).join("\n")}
    </ul>`;

const head = ({ title, description, url, image, type, extra = "" }) => `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${url}">
${extra}${HEAD_ASSETS}
</head>
`;

/** Every species, garden by garden, as in the game. */
function indexPage(records) {
  const url = `${SITE}/bestiary/`;
  const description = `All ${records.length} creatures of Echoes of the Garden, an idle creature collector where life and death are permanent.`;
  const groups = Object.keys(ECO_ORDER).map((eco) => `    <h2 class="garden-title">${ECO_LABEL[eco]}</h2>
${ECO_NOTE[eco] ? `    <p class="garden-note">${ECO_NOTE[eco]}</p>\n` : ""}${garden(records.filter((r) => r.ecosystem === eco), ECO_NOTE[eco] ? " garden-later" : "")}`).join("\n");
  return `${head({ title: "The Bestiary | Echoes of the Garden", description, url, image: `${SITE}/og-image.jpg`, type: "website" })}
<body>
${header("bestiary")}
  <main class="page page-wide">
    <h1>The Bestiary</h1>
    <p class="lead">${records.length} species across four ecosystems: Roots and Ash at Early Access launch, Garden and Cave in its first two updates. Each one lives once.</p>
${groups}
  </main>
${CTA}
${FOOTER}
</body>

</html>
`;
}

/** One indexable lore page per creature. */
function page(r, records) {
  const url = `${SITE}/bestiary/${r.slug}/`;
  const img = `${SITE}/${r.sprite}`;
  const ld = JSON.stringify({
    "@context": "https://schema.org", "@type": "Article",
    headline: `${r.name} | Echoes of the Garden Bestiary`, about: r.name, image: img,
    isPartOf: { "@type": "VideoGame", name: "Echoes of the Garden", url: `${SITE}/` },
  });
  const births = r.band_affinities.map((a, i) => `<div><dt>${BANDS[i]}</dt><dd>${a}</dd></div>`).join("");
  const kin = records.filter((o) => o.ecosystem === r.ecosystem && o.slug !== r.slug);
  return `${head({
    title: `${r.name} | Echoes of the Garden Bestiary`,
    description: `${r.flavor} ${r.name}, a creature of the ${ECO_LABEL[r.ecosystem]} in Echoes of the Garden.`,
    url, image: img, type: "article",
    extra: `  <meta name="twitter:card" content="summary">
  <script type="application/ld+json">
${ld}
</script>
`,
  })}
<body>
${header("bestiary")}
  <main class="page creature">
    <p class="crumbs"><a href="/bestiary/">The Bestiary</a></p>
    ${halo(r, false)}
    <h1>${esc(r.name)}</h1>
    <p class="where">${ECO_LABEL[r.ecosystem]}</p>
${ECO_NOTE[r.ecosystem] ? `    <p class="where">${ECO_NOTE[r.ecosystem]}</p>\n` : ""}    <p class="traits">${r.lifespan} life · ${r.yield} yield · ${r.affinity} affinity</p>
    <p class="lore">${esc(r.lore)}</p>
    <dl class="births">${births}</dl>
    <p class="births-help"><a href="/guide/affinities/">How affinities work</a></p>
    <section class="last-words" aria-labelledby="last-words">
      <h2 id="last-words">On its death</h2>
      <blockquote><p>${esc(r.death_flavor)}</p></blockquote>
    </section>
    <section class="related" aria-labelledby="kin">
      <h2 id="kin">More from ${ECO_LABEL[r.ecosystem]}</h2>
${garden(kin)}
    </section>
  </main>
${CTA}
${FOOTER}
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
