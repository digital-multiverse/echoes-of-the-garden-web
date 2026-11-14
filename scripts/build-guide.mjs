/**
 * build-guide.mjs — the "How to play" pages, written as entries of a book.
 *
 *   node scripts/build-guide.mjs     (then build-i18n for /es/ and /it/)
 *
 * Writes guide/index.html, guide/<slug>/index.html and the /guide/ lines of sitemap.xml.
 * Every rule here was checked against the game (v0.14, code + in-game strings, 2026-11-13):
 * keep it to what the itch.io build does, and no numbers, as in the game.
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { HEAD_ASSETS, header, CTA, FOOTER } from "./site-chrome.mjs";

const SITE = "https://echoesofthegarden.com";
const shot = (name, alt) => `    <figure>
      <img src="/assets/screenshots/${name}.webp" srcset="/assets/screenshots/${name}-960.webp 960w, /assets/screenshots/${name}.webp 1920w" sizes="(max-width: 720px) 100vw, 672px" width="1280" height="720" alt="${alt}" loading="lazy">
      <figcaption>A capture from the game.</figcaption>
    </figure>`;

const CHAPTERS = [
  {
    slug: "a-life",
    title: "A life, from seed to elder",
    summary: "Planting, the four stages of a life, each species' nature, and what the garden does while you are away.",
    epigraph: "Tend what grows. Let it end. Then choose what remains.",
    body: `    <p>You start in the Roots of the World with one creature already planted. It is your First Echo, and it lives a whole life in minutes so that you see one from start to end on your first visit.</p>
    <h2>Four stages</h2>
    <p>Every creature goes from Seed to Hatchling, then Adult, then Elder, and then it dies. It can't be stopped or undone. While it lives it gives its garden a little of that garden's resource each minute: Root Sap in the Roots of the World, Living Ash in the Tide of Ash.</p>
    <p>The others keep the garden's own pace: they grow over hours, not minutes. Slow species live longer and give steadily; the creatures of the Tide of Ash burn through their lives quickly.</p>
${shot("01_roots_garden", "Roots of the World in the game, with creatures at different stages of their lives")}
    <h2>Natures</h2>
    <p>Every species has a nature. You learn it the first time one of them dies, and from then on the Codex shows it in that species' entry.</p>
    <p>Most species are Steady: they give at the same pace from the day they hatch to the day they die. A Bloomer gives little while it lives and pays it all back when it dies, at the moment you choose its fate. More natures will follow.</p>
    <h2>Planting</h2>
    <p>Each garden has twelve spaces in a grid of four by three. You plant seeds bought at the Seed Altar or inherited from a creature that died. Where you put them matters, and the chapter on affinities explains why.</p>
    <h2>While you are away</h2>
    <p>The garden keeps living while you are away. When you come back, what it gathered is waiting, the creatures have grown, and one may have died. A creature that dies while you are gone does not disappear: it waits for you to choose what it leaves behind.</p>
    <p>In the browser version your garden is saved in the browser itself. Come back in the same one, not in a private window.</p>`,
  },
  {
    slug: "death",
    title: "When a creature dies",
    summary: "The death ceremony, the choice between Rebirth and Preservation, and what every death leaves.",
    epigraph: "This is what the garden is for. Nothing that ends is wasted.",
    body: `    <p>When a creature reaches the end of its life the garden falls silent. You see how long it lived and what it gave, and then you choose what remains of it. Your first death also opens the second ecosystem, the Tide of Ash.</p>
${shot("03_death_ceremony", "The death ceremony in the game: the creature's portrait, its epitaph and the two fates to choose from")}
    <h2>Rebirth</h2>
    <p>Its echo takes seed. You get an Inherited Seed that waits in your Inventory; plant it and the line goes on, one generation further. A rebirth can add a mutation, and the line carries every mutation it has gathered. Mutations change a little how fast a creature grows or how much it gives.</p>
    <h2>Preservation</h2>
    <p>Its form endures and its line ends. You get a Relic. One relic per garden is active at a time and strengthens the whole garden; the rarer the relic, the more it helps. Long lines with many mutations are more likely to leave rare relics.</p>
    <p>A preserved relic stays buried in the space where its creature lived, so that space stays taken. You can also sell a relic for its garden's resource.</p>
    <h2>What every death leaves</h2>
    <p>Whichever fate you choose, every death also leaves a Vestigio, the first material of the Echo Arc. And every life, reborn or preserved, is written in the Book of Echoes, with its name, its generation and how it ended.</p>`,
  },
  {
    slug: "affinities",
    title: "Where to plant",
    summary: "The six affinities, how neighbours help or hinder each other, and why the hour of birth matters.",
    epigraph: "Neighbours on the wheel resonate. Opposites dissonate.",
    body: `    <p>Every creature carries one affinity. There are six, in a ring: Arraigo, Ascua, Fulgor, Brisa, Escarcha and Umbra, and after Umbra the ring closes on Arraigo again.</p>
    <h2>Neighbours</h2>
    <p>Only the spaces touching a creature count: above, below, left and right. Two creatures whose affinities sit next to each other on the ring both produce more. Two whose affinities are opposite both produce less. Anything further apart stays quiet.</p>
    <dl class="pairs">
      <div><dt>Opposites</dt><dd>Arraigo and Brisa</dd><dd>Ascua and Escarcha</dd><dd>Fulgor and Umbra</dd></div>
    </dl>
    <p>The garden shows you the result: a gold glow on a creature in synergy with its neighbours, a red spiked glow on one clashing with a neighbour. The Affinity Wheel, in the game's Settings, draws the ring.</p>
    <h2>The hour of birth</h2>
    <p>A species does not always have the same affinity. It depends on the part of the day it was born in: night, morning, midday or evening. It is set at birth and never changes. So the moment a creature is born also decides where it fits best.</p>
    <p><a href="/bestiary/">See each creature's four possible affinities in the bestiary</a></p>`,
  },
  {
    slug: "seed-altar",
    title: "New species",
    summary: "How a species you have not met shows itself, and when the Seed Altar will sell you its seed.",
    epigraph: "Trade what the garden gave you for new life.",
    body: `    <p>Nothing new is for sale at the start. The garden shows you a creature before it will trade you its seed.</p>
    <h2>Something stirs</h2>
    <p>As a garden earns its resource, a species you have not met yet shows itself, with a message such as “Something stirs in the Roots of the World”. Its entry opens with its name, what kind of life it lives and a few lines about it. There is no chance involved: keep the garden producing and every species of it appears in turn.</p>
    <h2>The Seed Altar</h2>
    <p>Once a species has shown itself, the Seed Altar sells its seed for that garden's resource. Each new species costs more than the one before, so the later ones take a while. Species you have not met yet appear there veiled, and cannot be bought.</p>
    <p>Seeds from the altar start a new line at the first generation. To keep a line going, choose Rebirth when the creature dies.</p>
    <h2>Forms no seed sells</h2>
    <p>Two more forms exist that the altar never offers. Their recipes are learned by playing, from the fates you choose, and the Codex keeps them once learned.</p>
${shot("04_codex_fragments", "The Codex in the game, with the species discovered so far and the fragments of the garden's story")}
    <h2>The Codex</h2>
    <p>Every species you meet goes into the Codex. As you play, the garden also sets aside fragments of its own story there.</p>`,
  },
  {
    slug: "echo-arc",
    title: "The Echo Arc",
    summary: "Refining, the ten tiers from Vestigio to Origen, the risk of losing what you put in, and Attunement.",
    epigraph: "Refine loss into the Echo Arc, from Vestigio to Origen.",
    body: `    <p>Every death leaves a Vestigio of its garden. The Echo Arc is where you turn those remains into something more.</p>
${shot("05_echo_arc", "The Echo Arc panel in the game, with the tiers from Vestigio upwards and the risk of losing the result at each one")}
    <h2>The tiers</h2>
    <p>Several Vestigios combine into one Rastro, several of those into an Impronta, and so on up the arc. There are ten tiers in all:</p>
    <ol class="tiers">
      <li>Vestigio</li><li>Rastro</li><li>Impronta</li><li>Murmullo</li><li>Eco</li>
      <li class="later">Resonancia</li><li class="later">Pulso</li><li class="later">Aliento</li><li class="later">Voz</li><li class="later">Origen</li>
    </ol>
    <p>The first five are in the game now. The other five arrive in later updates.</p>
    <h2>Refining</h2>
    <p>From Murmullo on, each attempt also needs a refined material. Refining turns a garden's resource into it: Root Sap into Ancient Root Echo, Living Ash into Ash Ember.</p>
    <h2>The risk</h2>
    <p>The first three tiers always work. From Murmullo on, an attempt can fail and destroy what you put in, and the higher you go the more likely that is. Reaching Eco, the fifth tier, is the milestone the game is named after.</p>
    <h2>Attunement</h2>
    <p>A garden can only hold so much of its resource, and late in the game most of what it makes would go to waste. For that, the Echo Arc gives the Roots of the World and the Tide of Ash an Attunement each.</p>
    <p>Offer pours all the resource you hold into that garden's Attunement. What you offer carries over from one rank to the next, and each rank leaves a Rastro.</p>`,
  },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const head = ({ title, description, url }) => `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${SITE}/og-image.jpg">
  <meta property="og:url" content="${url}">
${HEAD_ASSETS}
</head>
`;
const page = (h, main) => `${h}
<body>
${header("guide")}
${main}
${CTA}
${FOOTER}
</body>

</html>
`;

const indexHtml = page(
  head({ title: "How to play | Echoes of the Garden", description: "How Echoes of the Garden is played: a creature's life, its death and what it leaves, affinities, new species and the Echo Arc.", url: `${SITE}/guide/` }),
  `  <main class="page">
    <h1>How to play</h1>
    <p class="lead">Five short chapters, in the order the game shows them to you.</p>
    <ol class="chapters">
${CHAPTERS.map((c) => `      <li><h2><a href="/guide/${c.slug}/">${c.title}</a></h2><p>${c.summary}</p></li>`).join("\n")}
    </ol>
  </main>`,
);

await mkdir("guide", { recursive: true });
await writeFile("guide/index.html", indexHtml);

for (const [i, c] of CHAPTERS.entries()) {
  const next = CHAPTERS[i + 1];
  const html = page(
    head({ title: `${c.title} | How to play Echoes of the Garden`, description: c.summary, url: `${SITE}/guide/${c.slug}/` }),
    `  <main class="page entry">
    <p class="crumbs"><a href="/guide/">How to play</a></p>
    <p class="meta">Chapter ${i + 1} of ${CHAPTERS.length}</p>
    <h1>${c.title}</h1>
    <blockquote class="epigraph"><p>${c.epigraph}</p></blockquote>
${c.body}
    <nav class="turn" aria-label="Chapters">${next ? `<a href="/guide/${next.slug}/">Next chapter: ${next.title}</a>` : `<a href="/bestiary/">Meet the creatures in the bestiary</a>`}</nav>
  </main>`,
  );
  await mkdir(`guide/${c.slug}`, { recursive: true });
  await writeFile(`guide/${c.slug}/index.html`, html);
}

const lines = [`  <url><loc>${SITE}/guide/</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
  ...CHAPTERS.map((c) => `  <url><loc>${SITE}/guide/${c.slug}/</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`)];
const sitemap = (await readFile("sitemap.xml", "utf8")).split("\n").filter((l) => !l.includes("/guide/")).join("\n");
await writeFile("sitemap.xml", sitemap.replace("</urlset>", `${lines.join("\n")}\n</urlset>`));
console.log(`${CHAPTERS.length} guide chapters written, sitemap updated`);
