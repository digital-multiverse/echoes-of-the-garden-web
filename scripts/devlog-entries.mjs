// Dev log entries, oldest first. Add one per milestone, then run `npm run devlog`.
// `body` is trusted HTML written by hand.
export const ENTRIES = [
  {
    slug: "creatures-that-die-for-good",
    title: "Creatures that die for good",
    date: "2026-07-05",
    build: "v0.3.0",
    summary: "The first playable loop: a creature is born, grows old and dies, and you choose what stays of it.",
    image: "01_roots_garden.webp",
    alt: "A garden in the Roots of the World biome with creatures on a grid",
    body: `
<p>I started Echoes of the Garden on 4 June 2026 with one rule: creatures die for good. A month later, that rule is playable.</p>
<p>Each creature goes through seed, hatchling, adult and elder. Then it dies and you choose. Rebirth leaves an Inherited Seed that carries its line forward. Preservation keeps it as a Relic. You get one or the other.</p>
<h2>What v0.3.0 can do</h2>
<ul>
  <li>Two biomes are playable: Roots of the World and Tide of Ash.</li>
  <li>Each biome has 12 slots in a 4 by 3 grid, and you move creatures by dragging them.</li>
  <li>Neighbours matter. An affinity wheel decides which creatures work well side by side.</li>
  <li>The time of day a creature is born sets its affinity.</li>
</ul>
<p>All 28 species exist as data, though only the first two biomes are in the game for now. The sprites are placeholder pixel art.</p>
<p><a href="/#bestiary">Meet the 28 species in the bestiary.</a></p>
<p>The next job is the economy: what creatures produce, what it buys, and how long a collection should take.</p>`,
  },
  {
    slug: "the-bug-that-paid-60-times-too-much",
    title: "The bug that paid 60 times too much",
    date: "2026-10-28",
    build: "v0.6.0",
    summary: "A balance simulator caught a 60x production bug. The economy phase is closed, and the Steam Market moves after Early Access.",
    image: "05_echo_arc.webp",
    alt: "The Echo Arc crafting panel",
    body: `
<p>Before building any crafting screen I wrote a headless simulator that plays the economy for weeks of game time. It found a critical bug: production rates were designed per minute and the code paid them per second. Everything earned 60 times too much, and every resource sat at its cap.</p>
<p>With that fixed, a simulated player checking in twice a day owns every Roots and Ash species around day 4.4, and reaches the fifth crafting tier in Tide of Ash around day 24.</p>
<h2>What this phase added</h2>
<ul>
  <li><strong>Encounters and the Seed Altar.</strong> New species reveal themselves as you play, and you buy their seeds at the Altar.</li>
  <li><strong>The Echo Arc.</strong> Five crafting tiers, from Vestigio to Eco, each with a risk of destroying what you put in.</li>
  <li><strong>Mutations.</strong> They now change how fast a creature produces and how long it lives, and they tint its sprite.</li>
  <li><strong>Offline progress.</strong> A creature that lived and died while you were away used to come back with nothing to its name. Its output now counts.</li>
</ul>
<h2>A change of plan</h2>
<p>Early Access will launch without the real Steam Market, which becomes the first major update after launch. Until then, selling a relic pays out inside the game. The Suspended Garden and the Luminous Cave arrive as the first two Early Access content updates.</p>`,
  },
  {
    slug: "a-garden-that-remembers",
    title: "A garden that remembers",
    date: "2026-10-29",
    build: "v0.9.0",
    summary: "The Book of Echoes records every creature that lived, the lore arrives, and the game speaks Spanish and Italian.",
    image: "06_book_of_echoes.webp",
    alt: "The Book of Echoes listing creatures that have lived",
    body: `
<p>If death is the point of the game, the dead should stay on the record. Three builds went into that idea.</p>
<ul>
  <li><strong>The Book of Echoes</strong> keeps every creature that lived: its name, its generation, how long it lasted and what you chose for it.</li>
  <li><strong>Lifetime statistics</strong> count everything the garden has been through.</li>
  <li><strong>Eight lore fragments</strong> unlock as you play and start to explain what this place is. The intro hints at it too, and I'm keeping the rest for players to find.</li>
</ul>
<h2>The rest of these builds</h2>
<p>New players now learn that death is the goal from a short guided first life. Settings gained separate volumes for master, ambient and effects. The interface is available in English, Spanish and Italian. Builds go to itch.io for Web, Linux and Windows.</p>
<p>The art pass drew all 14 species of the two later biomes across their three life stages. While capturing real frames for it I found that the roots, smoke and veils of the backdrops had been invisible for months, drawn underneath the background they were meant to decorate. A contact sheet of the sprites had never shown it. I check art in the running game now.</p>`,
  },
  {
    slug: "27-achievements-and-four-rare-lines",
    title: "27 achievements and four rare last words",
    date: "2026-10-30",
    build: "v0.10.0",
    summary: "Achievements, words at each death, all the lore in three languages, and a bug that made creatures younger than they were.",
    image: "03_death_ceremony.webp",
    alt: "The death ceremony with the choice between Rebirth and Preservation",
    body: `
<p>This build gives the moment of death more weight.</p>
<p>The Death Ceremony now shows each species' own death text. Four rare lines can also appear there, each one at most once per save. I won't list them.</p>
<p><a href="/bestiary/ash-drake/">Read what the Ash Drake leaves behind.</a></p>
<h2>Also in v0.10.0</h2>
<ul>
  <li><strong>27 achievements</strong>, kept in the game for now and ready for Steam. Three of them count time spent with the garden in focus.</li>
  <li><strong>All creature lore, recipes and fragments</strong> are now in Spanish and Italian too.</li>
  <li><strong>The grid centres itself</strong> in any window size.</li>
  <li><strong>Elders look old.</strong> Their sprites fade and their names change colour by stage.</li>
  <li><strong>Messages queue.</strong> A single death could unlock several things at once, and only the last message survived on screen.</li>
</ul>
<p>I also fixed a quiet bug: a creature's age ignored the time you were away, so the Book of Echoes reported ages that were far too young.</p>`,
  },
  {
    slug: "ready-for-strangers",
    title: "Ready for strangers",
    date: "2026-11-05",
    build: "v0.12.1",
    summary: "A design review found eleven quiet minutes in the first session. What changed before the first external playtest.",
    image: "02_tide_of_ash.webp",
    alt: "Tide of Ash with ember motes, smoke layers and synergy glows between neighbours",
    body: `
<p>Before anyone new plays the game, I reviewed v0.10.0 on a fresh save in real time. The first creature, which lives fast on purpose, reached adulthood at 3:03, became an elder at 14:15 and died at 19:51. Between minutes 3 and 14 the player had nothing to do except watch, and nothing said the garden keeps living while the game is closed. That promise is the whole contract of an idle game.</p>
<h2>What changed in v0.11 and v0.12</h2>
<ul>
  <li><strong>First session.</strong> The game now states that promise when the first creature grows up, and tells you when you can afford a second seed.</li>
  <li><strong>What's next.</strong> A line under your resources names the next event, such as a creature's next stage or the seed you can now buy.</li>
  <li><strong>Coming back.</strong> The return summary is centred and uses whole numbers, the return bonus shows a countdown, and creatures that grew while you were away carry a small green sprout.</li>
  <li><strong>Reading the garden.</strong> Hover a creature or a buried relic to see its stage, its time left and its affinity.</li>
  <li><strong>Less noise.</strong> A first death used to fire six messages. Achievements, fragments and recipes now share one line.</li>
  <li><strong>Sound.</strong> A low bell plays when you return to deaths waiting for you, and a soft shimmer when a new species stirs.</li>
  <li><strong>Accessibility.</strong> There is a reduced motion option and three text sizes. Stage names carry a glyph as well as a colour, and clashing neighbours show a spiked glow, so colour is no longer the only cue.</li>
</ul>
<p>This site also moved to echoesofthegarden.com, and the in-game bug reports now arrive through it.</p>
<p>Next comes the external playtest: new players, no guidance, and notes on where they get lost or bored.</p>`,
  },
  {
    slug: "what-the-first-stranger-taught-me",
    title: "What the first stranger taught me",
    date: "2026-11-08",
    build: "v0.13.0",
    summary: "The first external tester thought the garden had stopped working. It hadn't, but nothing on screen said so. What changed in v0.13.0.",
    image: "01_roots_garden.webp",
    alt: "A garden in the Roots of the World biome with creatures on a grid",
    body: `
<p>The first external tester played the web build with no guidance. The first creature lived and died as planned. Then the garden went quiet: the other creatures only gave resources every five minutes, so for a while nothing seemed to happen, and the tester decided production was broken.</p>
<p>The numbers were right. The game just never showed them. Two more things came out of the same session: messages faded before anyone read them, and nothing said whether the browser version keeps your progress. It does.</p>
<h2>What changed in v0.13.0</h2>
<ul>
  <li><strong>A gift every minute.</strong> Creatures now give every minute instead of every five, at the same rate per hour. The garden earns exactly what it did before, and you can see it working.</li>
  <li><strong>The pace, explained.</strong> After the first creature's fate, a short note says the others grow over hours and keep giving while the game is closed.</li>
  <li><strong>Next gift.</strong> Hover a creature to see when its next gift arrives and how much it brings.</li>
  <li><strong>Messages you notice.</strong> Messages appear as cards with a soft sound. The important ones stay until you click them.</li>
  <li><strong>Unread mail.</strong> The Mail button counts the messages you haven't opened yet.</li>
  <li><strong>Saving on the web.</strong> The browser version says once that your progress is saved in that browser.</li>
</ul>
<p>The web build also lost a few symbols that its font could not draw.</p>
<p>One tester is not enough to tune the game's pace, so the next step is more players.</p>`,
  },
  {
    slug: "every-species-has-a-nature",
    title: "Every species has a nature",
    date: "2026-11-13",
    build: "v0.14.0",
    summary: "Species now reveal their nature at their first death, one of them saves everything for the end, and the garden's surplus finally has somewhere to go.",
    image: "07_attunement.webp",
    alt: "The Echo Arc open over the Roots of the World, with the garden's Attunement at rank 3 and its Offer button",
    body: `
<p>Until this build every creature worked the same way: it gave at a steady pace from the day it hatched to the day it died. v0.14.0 starts to change that.</p>
<h2>Natures</h2>
<p>Every species now has a nature. You learn it the first time one of them dies, and from then on it appears in the species' Codex entry.</p>
<p>Most species are Steady. The first nature that changes how a creature plays is the Bloomer: it gives little while it lives and pays it all back when it dies, at the moment you choose its fate. I won't say which species it is.</p>
<h2>Attunement</h2>
<p>Once a biome's collection was complete, its Root Sap or Living Ash sat at the cap and most of what the garden made was lost. In my simulations, a player checking in twice a day lost about four fifths of it.</p>
<p>The Echo Arc now has an Attunement track for the Roots of the World and the Tide of Ash. Offer pours everything you hold into it, nothing you offer is lost between ranks, and each rank leaves a Rastro, the second tier of the Echo Arc. In the same simulations the loss drops to about 2 percent.</p>
<h2>Also in v0.14.0</h2>
<ul>
  <li>The line that announces a new species now names the biome where it stirs.</li>
  <li>The Spanish and Italian text had a full review.</li>
</ul>
<p>This build goes to the testers next. How they play it decides how the other natures work.</p>`,
  },
  {
    slug: "someone-to-show-you-around",
    title: "Someone to show you around",
    date: "2026-11-13",
    build: "v0.15.0",
    summary: "Two testers said the first minutes left them with nothing to do and no idea what the game was about. v0.15.0 adds a short guide for the first session.",
    image: "01_roots_garden.webp",
    alt: "A garden in the Roots of the World biome with creatures on a grid",
    body: `
<p>The second tester put it plainly: in the first minutes there was nothing to do, the next thing took too long to unlock, and a little guidance would have helped them understand what the game was about. The first tester had hit a similar wall a week earlier.</p>
<p>I timed the first session against the game's own numbers. The first seed becomes affordable at around two and a half minutes. After the third purchase, at about eleven minutes, nothing points you anywhere until your first creature dies, close to the twenty-minute mark.</p>
<h2>First steps</h2>
<p>A small card in the corner now walks you through the first session, one step at a time. Each step names something you can do right now and says in one line why it matters:</p>
<ul>
  <li>Name your first creature.</li>
  <li>Open the Codex.</li>
  <li>Plant a second seed at the Seed Altar.</li>
  <li>Look at the Affinity Wheel.</li>
  <li>Plant a species you have not grown yet.</li>
  <li>Stay for the end of your first creature.</li>
</ul>
<p>The card closes with the first fate, and you can dismiss it at any time. Players who have already been through a first death never see it.</p>
<h2>Also in v0.15.0</h2>
<ul>
  <li>Four new lore fragments, earned through Attunement. I won't quote them.</li>
  <li>Reloading a save no longer announces fragments and achievements you already had.</li>
</ul>
<p>The guide does not change the game's pace. If the first minutes still feel slow with it, the next step is the pace itself.</p>`,
  },
  {
    slug: "signs-before-names",
    title: "Signs before names",
    date: "2026-11-13",
    build: "v0.16.0",
    summary: "Species you have not met yet now leave a sign at the Seed Altar, and the Spanish and Italian text had another pass.",
    image: "02_tide_of_ash.webp",
    alt: "The Tide of Ash biome with creatures among the cinders",
    body: `
<p>Until now a species you had not met yet was three question marks at the Seed Altar. Nothing told you it was there, or gave you a reason to wait for it.</p>
<p>Each of those rows now carries one line: a sign that something lives nearby, without its name. In the Roots of the World, one of them reads: "One of the boulders is not where it was last season." There is one for each of the 28 species, in English, Spanish and Italian.</p>
<h2>Also in v0.16.0</h2>
<ul>
  <li>The Spanish and Italian text added in the last three builds had a full review: the natures, Attunement, the first-steps guide and the new lore fragments.</li>
</ul>
<p>Next I wait for the testers. What they say about the first minutes decides whether the game's pace changes.</p>`,
  },
];
