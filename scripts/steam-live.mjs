// Run once, when the Steam store page is live:
//   node scripts/steam-live.mjs https://store.steampowered.com/app/<id>/ && npm run build
// Until then the site shows no Steam link at all (never a dead one). This swaps, in the English sources and
// the pages built from them, "Tell me when it's on Steam" for a "Wishlist on Steam" button and the footer's
// "Steam (soon)" for a link, and adds the store page to the home's JSON-LD. The es/it pages follow from
// `npm run build`; their translations are already in i18n/*.json. Then update docs/design-intent.md (CTA table).
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const url = process.argv[2];
if (!/^https:\/\/store\.steampowered\.com\/app\/\d+\//.test(url ?? "")) {
  console.error("usage: node scripts/steam-live.mjs https://store.steampowered.com/app/<id>/");
  process.exit(1);
}
const link = `href="${url}" target="_blank" rel="noopener"`;
const files = execFileSync("git", ["ls-files", "*.html", "scripts/site-chrome.mjs"], { encoding: "utf8" })
  .split("\n").filter((f) => f && !/^(es|it)\//.test(f));

let changed = 0;
for (const f of files) {
  const src = await readFile(f, "utf8");
  const out = src
    .replace(/<a [^>]*>Tell me when it's on Steam<\/a>/g, `<a class="btn" ${link}>Wishlist on Steam</a>`)
    .replace(/<span>Steam \(soon\)<\/span>/g, `<a ${link}>Steam</a>`)
    .replace(/("@type": "VideoGame",\n\s*"name": "Echoes of the Garden",)/, `$1\n  "sameAs": ["${url}"],`);
  if (out !== src) { await writeFile(f, out); changed++; }
}
console.log(`${changed} files now link to ${url}. Next: npm run build`);
