#!/usr/bin/env node
/**
 * build-devlog.mjs — bake the dev log from scripts/devlog-entries.mjs. Outputs, all committed:
 *   1. index.html dev log section   — the 3 newest entries, static HTML between markers
 *   2. devlog/index.html            — every entry
 *   3. devlog/{slug}/index.html     — one indexable page per entry
 *   4. sitemap.xml                  — its /devlog/ lines
 *
 * Usage:  npm run devlog
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { ENTRIES } from "./devlog-entries.mjs";
import { HEAD_ASSETS, header, CTA, FOOTER } from "./site-chrome.mjs";

const SITE = "https://echoesofthegarden.com";
const HOME_ENTRIES = 3;
const newest = [...ENTRIES].sort((a, b) => b.date.localeCompare(a.date));

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const longDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const jsonLd = (o) => JSON.stringify(o, null, 2).replace(/</g, "\\u003c");

const head = ({ title, description, url, image, type, ld }) => `<!DOCTYPE html>
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
  <script type="application/ld+json">
${jsonLd(ld)}
</script>
${HEAD_ASSETS}
</head>
`;

const srcset = (file) => `/assets/screenshots/${file.replace(".webp", "")}-960.webp 960w, /assets/screenshots/${file} 1920w`;

const publisher = { "@type": "Organization", name: "Digital Multiverse", url: "https://digital-multiverse.com" };

function entryPage(e) {
  const url = `${SITE}/devlog/${e.slug}/`;
  const image = `${SITE}/assets/screenshots/${e.image}`;
  return `${head({
    title: `${e.title} | Echoes of the Garden Dev Log`, description: e.summary, url, image, type: "article",
    ld: {
      "@context": "https://schema.org", "@type": "BlogPosting", headline: e.title, description: e.summary,
      datePublished: e.date, image, url, author: publisher, publisher,
      about: { "@type": "VideoGame", name: "Echoes of the Garden", url: `${SITE}/` },
    },
  })}
<body>
${header("devlog")}
  <main class="page post">
    <p class="crumbs"><a href="/devlog/">Dev log</a></p>
    <h1>${esc(e.title)}</h1>
    <p class="meta"><time datetime="${e.date}">${longDate(e.date)}</time> · Build ${e.build}</p>
    <figure>
      <img src="/assets/screenshots/${e.image}" srcset="${srcset(e.image)}" sizes="(max-width: 720px) 100vw, 672px" width="1280" height="720" alt="${esc(e.alt)}">
      <figcaption>A capture from the game. The pixel art is still placeholder.</figcaption>
    </figure>
${e.body.trim()}
  </main>
${CTA}
${FOOTER}
</body>

</html>
`;
}

function indexPage() {
  const url = `${SITE}/devlog/`;
  const description = "Development updates for Echoes of the Garden, an idle creature collector with permanent death.";
  const rows = newest.map((e) => `      <li>
        <time class="meta" datetime="${e.date}">${longDate(e.date)} · Build ${e.build}</time>
        <h2><a href="/devlog/${e.slug}/">${esc(e.title)}</a></h2>
        <p>${esc(e.summary)}</p>
      </li>`).join("\n");
  return `${head({
    title: "Dev Log | Echoes of the Garden", description, url, image: `${SITE}/og-image.jpg`, type: "website",
    ld: {
      "@context": "https://schema.org", "@type": "Blog", name: "Echoes of the Garden Dev Log", description, url, publisher,
      blogPost: newest.map((e) => ({ "@type": "BlogPosting", headline: e.title, datePublished: e.date, url: `${SITE}/devlog/${e.slug}/` })),
    },
  })}
<body>
${header("devlog")}
  <main class="page">
    <h1>Dev log</h1>
    <p class="lead">One entry per milestone.</p>
    <ul class="entries">
${rows}
    </ul>
  </main>
${CTA}
${FOOTER}
</body>

</html>
`;
}

const homeSection = () => `
        <div class="devlog-grid">
${newest.slice(0, HOME_ENTRIES).map((e) => `          <article>
            <time class="devlog-date" datetime="${e.date}">${longDate(e.date)} · Build ${e.build}</time>
            <h4 class="devlog-title"><a href="/devlog/${e.slug}/">${esc(e.title)}</a></h4>
            <p class="devlog-summary">${esc(e.summary)}</p>
          </article>`).join("\n")}
        </div>
        <p class="devlog-all"><a href="/devlog/">All dev log entries</a></p>
        `;

const START = "<!-- DEVLOG:START -->";
const END = "<!-- DEVLOG:END -->";
const html = await readFile("index.html", "utf8");
if (!html.includes(START) || !html.includes(END)) {
  console.error(`ERROR: markers ${START} / ${END} not found in index.html`);
  process.exit(1);
}
await writeFile("index.html", html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), () => `${START}${homeSection()}${END}`));

await mkdir("devlog", { recursive: true });
await writeFile("devlog/index.html", indexPage());
for (const e of ENTRIES) {
  await mkdir(`devlog/${e.slug}`, { recursive: true });
  await writeFile(`devlog/${e.slug}/index.html`, entryPage(e));
}

const lines = [`  <url><loc>${SITE}/devlog/</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
  ...ENTRIES.map((e) => `  <url><loc>${SITE}/devlog/${e.slug}/</loc><lastmod>${e.date}</lastmod><priority>0.6</priority></url>`)];
const sitemap = (await readFile("sitemap.xml", "utf8")).split("\n").filter((l) => !l.includes("/devlog/")).join("\n");
await writeFile("sitemap.xml", sitemap.replace("</urlset>", `${lines.join("\n")}\n</urlset>`));
console.log(`${ENTRIES.length} dev log entries written, home and sitemap updated`);
