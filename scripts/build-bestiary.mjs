#!/usr/bin/env node
/**
 * build-bestiary.mjs — regenerate the Bestiary from the GAME repo.
 *
 * The web consumes the game as a data source over HTTP (no shared folders).
 * Two outputs, both committed:
 *   1. bestiary.json         — the editable data (single source of truth here)
 *   2. index.html bestiary   — STATIC HTML baked between markers (for SEO:
 *                              search engines index real HTML, not JS-rendered
 *                              content). Re-run after any game lore change.
 *
 * Also fetches each creature sprite into assets/creatures/ so the deployed
 * site is self-contained (never hotlink raw.githubusercontent in production).
 *
 * Usage:  node scripts/build-bestiary.mjs      (or: npm run bestiary)
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const RAW = "https://raw.githubusercontent.com/digital-multiverse/echoes-of-the-garden/main";
const CREATURE_DIR = "data/creatures";
const SPRITE_DIR = "assets/sprites/creatures";

// Launch creatures = Roots + Ash. Cave/garden .tres are sprite-less stubs.
const LAUNCH_IDS = [
  "lagarto_musgo", "tortuga_roca", "escarabajo_raiz", "babosa_turba",
  "oruga_tierra", "ciempies_anciano", "micelio_raiz",
  "salamandra_ceniza", "halcon_brasa", "escorpion_ceniza", "serpiente_humo",
  "avispa_llama", "topo_carbon", "dragon_ceniza",
];

const ECO_LABEL = { roots: "Roots of the World", ash: "Tide of Ash" };

const field = (src, name) => {
  const m = src.match(new RegExp(`^${name} = "([\\s\\S]*?)"$`, "m"));
  return m ? m[1] : "";
};
const num = (src, name, d) => {
  const m = src.match(new RegExp(`^${name} = ([\\d.]+)$`, "m"));
  return m ? parseFloat(m[1]) : d;
};

/** Mirror the in-game Codex qualitative thresholds exactly. */
const lifespanOf = (dur) => (dur < 0.8 ? "Fleeting" : dur > 1.2 ? "Enduring" : "Steady");
const yieldOf = (rate) => (rate >= 2.5 ? "Bountiful" : rate >= 1.5 ? "Generous" : "Modest");

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`);
  return res.text();
}

async function fetchSprite(id) {
  const url = `${RAW}/${SPRITE_DIR}/${id}.png`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  WARN sprite missing: ${id} (${res.status})`);
    return false;
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(`assets/creatures/${id}.png`));
  return true;
}

async function buildRecords() {
  const records = [];
  for (const id of LAUNCH_IDS) {
    let tres;
    try {
      tres = await fetchText(`${RAW}/${CREATURE_DIR}/${id}.tres`);
    } catch (err) {
      console.warn(`  WARN skipping ${id}: ${err.message}`);
      continue;
    }
    const lore = field(tres, "lore").replace(/\s+/g, " ").trim();
    records.push({
      id,
      name: field(tres, "display_name"),
      ecosystem: field(tres, "ecosystem"),
      lifespan: lifespanOf(num(tres, "stage_duration_multiplier", 1.0)),
      yield: yieldOf(num(tres, "base_resource_rate", 1.0)),
      flavor: lore ? `${lore.split(".")[0].trim()}.` : "",
      sprite: `assets/creatures/${id}.png`,
    });
    await fetchSprite(id);
  }
  return records;
}

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Static HTML for the card grid — real markup, fully indexable. */
function renderCards(records) {
  const cards = records.map((r, i) => {
    const delay = i % 3 ? ` reveal-d${i % 3}` : "";
    return `        <article class="beast-card beast-${r.ecosystem} reveal${delay}">
          <img class="beast-sprite" src="${r.sprite}" alt="${esc(r.name)} — pixel creature sprite" width="72" height="72" loading="lazy">
          <h3 class="beast-name">${esc(r.name)}</h3>
          <div class="beast-eco">${ECO_LABEL[r.ecosystem] ?? r.ecosystem}</div>
          <div class="beast-traits">${r.lifespan} life · ${r.yield} yield</div>
          <p class="beast-flavor">${esc(r.flavor)}</p>
        </article>`;
  });
  cards.push(`        <article class="beast-card beast-secret reveal">
          <div class="beast-sprite beast-unknown" aria-hidden="true">?</div>
          <h3 class="beast-name">???</h3>
          <div class="beast-eco">Synthesis</div>
          <div class="beast-traits">The garden teaches; it does not instruct.</div>
          <p class="beast-flavor">Two more forms exist. No seed sells them. They are learned.</p>
        </article>`);
  return cards.join("\n");
}

async function main() {
  await mkdir("assets/creatures", { recursive: true });
  console.log("Fetching creatures from the game repo...");
  const records = await buildRecords();

  await writeFile(
    "bestiary.json",
    JSON.stringify(
      { source: `${RAW}/${CREATURE_DIR}`, count: records.length, creatures: records },
      null,
      2,
    ) + "\n",
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
  const grid = `\n${renderCards(records)}\n      `;
  html = html.replace(
    new RegExp(`${START}[\\s\\S]*?${END}`),
    `${START}${grid}${END}`,
  );
  await writeFile("index.html", html);
  console.log("index.html bestiary grid baked (static, SEO-friendly)");

  // Structured data for the bestiary (helps rich results)
  console.log("Done. Review the diff, then commit.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
