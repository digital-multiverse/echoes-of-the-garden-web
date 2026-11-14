#!/usr/bin/env node
/**
 * build-i18n.mjs — bake /es/ and /it/ from the English pages. Run after bestiary and devlog.
 *
 * Text comes from i18n/{es,it}.json (key = the English text) and, for creature lore, from the
 * game's i18n/content.csv (GAME_DIR). Creature, resonance and Echo Arc tier names stay as they are,
 * like in the game. The build fails on any text without a translation, so nothing ships half done.
 * It also writes the shared head block and the language links into the English pages.
 *
 * Usage:  npm run i18n          (--missing writes the keys to translate to i18n/missing.txt)
 */
import { writeFile, mkdir, readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const SITE = "https://echoesofthegarden.com";
const GAME = process.env.GAME_DIR ?? "../echoes-of-the-garden";
const LOCALES = { es: { label: "Español", og: "es_ES" }, it: { label: "Italiano", og: "it_IT" } };

const bestiary = JSON.parse(await readFile("bestiary.json", "utf8")).creatures;
const NAMES = new Set(bestiary.map((c) => c.name));
const RESONANCES = new Set(bestiary.map((c) => c.affinity));
const KEEP = new Set(["Echoes of the Garden", "Echo Arc", "Dev Log", "Vestigio", "Rastro", "Impronta", "Murmullo", "Eco", "Origen", "Vestigio → Origen",
  "English", "Español", "Italiano", "English · Español · Italiano", "itch.io", "Steam", "Newsletter", "your@email.com",
  "Cloudflare", "Resend", "Google Fonts", "AEPD", "Digital Multiverse", "info@digital-multiverse.com", "hello@echoesofthegarden.com", "cf_clearance", ...NAMES, ...RESONANCES]);

/** Minimal CSV reader: quoted fields may hold commas, line breaks and doubled quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; } else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; } else if (c !== "\r") cell += c;
  }
  return rows;
}

const norm = (s) => s.replace(/\s+/g, " ").trim();
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const firstSentence = (s) => s.match(/^.*?[.!?…](?=\s|$)/)?.[0] ?? s;

const csv = parseCsv(await readFile(join(GAME, "i18n/content.csv"), "utf8")).slice(1);
function creatureDict(column) {
  const dict = new Map();
  for (const [key, en, es, it] of csv) {
    if (!/^creature\.[^.]+\.(lore|death)$/.test(key ?? "")) continue;
    const to = { es, it }[column];
    dict.set(esc(norm(en)), esc(norm(to)));
    dict.set(norm(en), norm(to));
    dict.set(esc(firstSentence(norm(en))), esc(firstSentence(norm(to))));
    dict.set(firstSentence(norm(en)), firstSentence(norm(to)));
  }
  return dict;
}

async function pages() {
  const list = ["index.html", "404.html", "privacy/index.html", "devlog/index.html", "bestiary/index.html", "guide/index.html"];
  for (const dir of ["devlog", "bestiary", "guide"]) {
    for (const e of await readdir(dir, { withFileTypes: true })) if (e.isDirectory()) list.push(`${dir}/${e.name}/index.html`);
  }
  return list;
}

const urlPath = (file) => "/" + file.replace(/index\.html$/, "");

function seoBlock(file, lang) {
  const icons = `  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">`;
  if (file === "404.html") return `<!-- SEO:START -->\n${icons}\n  <!-- SEO:END -->`;
  const p = urlPath(file);
  const alt = [`  <link rel="alternate" hreflang="en" href="${SITE}${p}">`,
    ...Object.keys(LOCALES).map((l) => `  <link rel="alternate" hreflang="${l}" href="${SITE}/${l}${p}">`),
    `  <link rel="alternate" hreflang="x-default" href="${SITE}${p}">`];
  return `<!-- SEO:START -->\n${icons}\n${alt.join("\n")}\n  <!-- SEO:END -->`;
}

function langNav(file, lang) {
  const p = file === "404.html" ? "/" : urlPath(file);
  const link = (l, label, href) => `<a href="${href}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="true"' : ""} style="color:#e8cb7a;display:inline-block;padding:12px 4px">${label}</a>`;
  const links = [link("en", "English", p), ...Object.entries(LOCALES).map(([l, v]) => link(l, v.label, `/${l}${p}`))].join(" · ");
  return `<!-- LANG:START --><nav aria-label="${{ en: "Language", es: "Idioma", it: "Lingua" }[lang]}" style="text-align:center;padding:24px 16px;font-size:15px">${links}</nav><!-- LANG:END -->`;
}

/** Short EN · ES · IT links for the homepage nav (inside the mobile menu too). */
function navLang(file, lang) {
  const p = urlPath(file);
  const link = (l, href, label) => `<a href="${href}" hreflang="${l}" lang="${l}" title="${label}"${l === lang ? ' aria-current="true"' : ""}>${l.toUpperCase()}</a>`;
  return [link("en", p, "English"), ...Object.entries(LOCALES).map(([l, v]) => link(l, `/${l}${p}`, v.label))].join("");
}

// Generated blocks are emptied before translating, so their text never reaches the dictionary.
const stripBlocks = (html) => html
  .replace(/\s*<!-- LANG:START -->[\s\S]*?<!-- LANG:END -->/, "")
  .replace(/<!-- NAVLANG:START -->[\s\S]*?<!-- NAVLANG:END -->/, "<!-- NAVLANG:START --><!-- NAVLANG:END -->");

const withBlocks = (html, file, lang) => stripBlocks(html)
  .replace(/\s*<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, "")
  .replace("<!-- NAVLANG:START --><!-- NAVLANG:END -->", () => `<!-- NAVLANG:START -->${navLang(file, lang)}<!-- NAVLANG:END -->`)
  .replace("</head>", `  ${seoBlock(file, lang)}\n</head>`)
  .replace("</body>", `  ${langNav(file, lang)}\n</body>`);

function translator(dict, missing, file) {
  const t = (raw) => {
    const s = norm(raw);
    if (!/\p{L}{2}/u.test(s) || KEEP.has(s) || /^v\d/.test(s)) return s;
    if (dict.has(s)) return dict.get(s);
    let m;
    if ((m = s.match(/^(\w+ life) · (\w+ yield) · (\w+) affinity$/))) return `${t(m[1])} · ${t(m[2])} · ${(dict.get("%s affinity") ?? miss("%s affinity")).replace("%s", m[3])}`;
    if ((m = s.match(/^(.*) \| Echoes of the Garden Bestiary$/))) return `${m[1]} | ${t("Echoes of the Garden Bestiary")}`;
    if ((m = s.match(/^(.*) \| Echoes of the Garden$/)) && NAMES.has(m[1])) return s;
    if ((m = s.match(/^(\d+) (\w+) (\d{4})(, v[\d.]+)?$/))) return `${t(`%d ${m[2]} %d`).replace("%d", m[1]).replace("%d", m[3])}${m[4] ?? ""}`;
    if ((m = s.match(/^More from (.*)$/))) return `${t("More from")} ${t(m[1])}`;
    if ((m = s.match(/^(.*) \| Echoes of the Garden$/))) return `${t(m[1])} | Echoes of the Garden`;
    if (/^, v[\d.]+$/.test(s)) return s;
    return miss(s);
  };
  const miss = (s) => { missing.add(s); return s; };
  return t;
}

function translate(html, file, lang, dict, missing) {
  const t = translator(dict, missing, file);
  const prefix = (p) => (/^\/(assets|favicon|apple-touch|og-image)/.test(p) ? p : `/${lang}${p}`);
  const stash = [];
  // Scripts and styles leave the text pass; the JS messages and JSON-LD are handled on their own.
  let out = html.replace(/<(script|style)\b[\s\S]*?<\/\1>|<!--[\s\S]*?-->/g, (block) => {
    if (block.includes("application/ld+json")) block = block.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/, (_, a, body, z) => `${a}\n${JSON.stringify(ld(JSON.parse(body), t, prefix), null, 2).replace(/</g, "\\u003c")}\n${z}`);
    else if (block.startsWith("<script")) for (const [k, v] of dict) block = block.split(`'${k}'`).join(`'${v.replace(/'/g, "\\'")}'`);
    stash.push(block);
    return `\u0000${stash.length - 1}\u0000`;
  });
  out = out.replace(/(<title>)([^<]*)(<\/title>)/, (_, a, s, z) => a + t(s) + z);
  out = out.replace(/<(meta)\b[^>]*>/g, (tag) => {
    if (!/(name|property)="(description|og:title|og:description|og:image:alt|twitter:title|twitter:description)"/.test(tag)) return tag;
    return tag.replace(/content="([^"]*)"/, (_, s) => {
      return `content="${norm(s).includes(", a creature of ") ? metaCreature(norm(s), t) : t(s)}"`;
    });
  });
  out = out.replace(/\b(alt|aria-label|placeholder|title)="([^"]*)"/g, (_, k, s) => `${k}="${t(s)}"`);
  const bodyAt = out.indexOf("<body");
  out = out.slice(0, bodyAt) + out.slice(bodyAt).replace(/>([^<>\u0000]+)</g, (whole, s) => {
    if (!s.trim()) return whole;
    const lead = s.match(/^\s*/)[0], trail = s.match(/\s*$/)[0];
    return `>${lead}${t(s)}${trail}<`;
  });
  out = out.replace(/\b(href|src)="(?:\.\.\/)*assets\//g, '$1="/assets/').replace(/\b(href|src)="(\/[^"]*)"/g, (_, a, p) => `${a}="${prefix(p)}"`);
  out = out.replace(/(rel="canonical" href="|property="og:url" content=")https:\/\/echoesofthegarden\.com(\/[^"]*)"/g, (_, a, p) => `${a}${SITE}/${lang}${p}"`);
  out = out.replace(/<html lang="en"/, `<html lang="${lang}"`).replace('content="en_US"', `content="${LOCALES[lang].og}"`);
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[+i]);
}

function metaCreature(s, t) {
  const name = [...NAMES].find((n) => s.includes(` ${n}, a creature of `));
  const [flavor] = s.split(` ${name}, a creature of `);
  const eco = s.match(/a creature of (.*?) in Echoes/)[1];
  return `${t(flavor)} ${t("%s, a creature of %s in Echoes of the Garden.").replace("%1", name).replace("%2", t(eco))}`;
}

function ld(value, t, prefix) {
  if (Array.isArray(value)) return value.map((v) => ld(v, t, prefix));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => {
      if (typeof v === "string" && ["description", "headline", "name"].includes(k)) return [k, t(v)];
      return [k, ld(v, t, prefix)];
    }));
  }
  if (typeof value === "string" && value.startsWith(`${SITE}/`) && !/\/(assets|og-image)/.test(value)) return `${SITE}${prefix(value.slice(SITE.length))}`;
  return value;
}

const all = await pages();
const missing = new Set();
for (const lang of Object.keys(LOCALES)) {
  const dict = new Map([...creatureDict(lang), ...Object.entries(JSON.parse(await readFile(`i18n/${lang}.json`, "utf8")))]);
  for (const file of all) {
    const html = await readFile(file, "utf8");
    const out = withBlocks(translate(stripBlocks(html), file, lang, dict, missing), file, lang);
    await mkdir(dirname(`${lang}/${file}`), { recursive: true });
    await writeFile(`${lang}/${file}`, out);
  }
}
for (const file of all) await writeFile(file, withBlocks(await readFile(file, "utf8"), file, "en"));

const sitemap = (await readFile("sitemap.xml", "utf8")).split("\n").filter((l) => !/<loc>[^<]*\/(es|it)\//.test(l));
const body = sitemap.filter((l) => l.includes("<loc>"));
const extra = Object.keys(LOCALES).flatMap((l) => body.map((line) => line.replace(`<loc>${SITE}/`, `<loc>${SITE}/${l}/`)));
await writeFile("sitemap.xml", sitemap.join("\n").replace("</urlset>", `${extra.join("\n")}\n</urlset>`));

if (missing.size) {
  if (process.argv.includes("--missing")) await writeFile("i18n/missing.txt", [...missing].join("\n") + "\n");
  console.error(`${missing.size} texts without translation${process.argv.includes("--missing") ? ": see i18n/missing.txt" : ""}`);
  process.exit(1);
}
console.log(`${all.length} pages baked for ${Object.keys(LOCALES).join(", ")}`);
