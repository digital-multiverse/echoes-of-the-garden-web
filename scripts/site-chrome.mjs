// Head assets, header, closing call to action and footer shared by every page except the home.
// Styles live in /assets/site.css. privacy/index.html and 404.html carry a hand copy of the same
// markup: keep them in step.
const PLAY = "https://echoes-of-the-garden.itch.io/play";

export const HEAD_ASSETS = `  <link rel="preload" href="/assets/fonts/crimson-pro-normal-300-600.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/cinzel-decorative-normal-700.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/fonts/fonts.css">
  <link rel="stylesheet" href="/assets/site.css">`;

/** `current` is the section the page belongs to ("guide", "bestiary" or "devlog"), marked in the nav. */
export const header = (current) => {
  const link = (key, href, label) => `<a href="${href}"${key === current ? ' aria-current="true"' : ""}>${label}</a>`;
  return `  <header class="site-head">
    <a class="site-logo" href="/">Echoes of the Garden</a>
    <nav class="site-nav" aria-label="Main navigation">${link("game", "/#life", "The game")}${link("guide", "/guide/", "How to play")}${link("bestiary", "/bestiary/", "Bestiary")}${link("devlog", "/devlog/", "Dev log")}</nav>
    <a class="btn btn-gold" href="${PLAY}" target="_blank" rel="noopener">Play free in your browser</a>
  </header>`;
};

export const CTA = `  <aside class="site-cta" aria-label="Play the game">
    <p>Echoes of the Garden is a free idle game about creatures that live, age and die for good.</p>
    <div class="actions"><a class="btn btn-gold" href="${PLAY}" target="_blank" rel="noopener">Play free in your browser</a><a class="btn" href="/#newsletter">Tell me when it's on Steam</a></div>
  </aside>`;

export const FOOTER = `  <footer class="site-foot">
    <div>
      <div class="foot-logo">Echoes of the Garden</div>
      <p>An independent game by a single developer. © 2026</p>
    </div>
    <nav aria-label="Footer">
      <a href="${PLAY}" target="_blank" rel="noopener">Play on itch.io</a>
      <span>Steam (soon)</span>
      <a href="/bestiary/">Bestiary</a>
      <a href="/guide/">How to play</a>
      <a href="/devlog/">Dev log</a>
      <a href="/privacy/">Privacy</a>
      <a href="/privacy/#who-we-are">Legal notice</a>
      <a href="https://digital-multiverse.com">A Digital Multiverse project</a>
    </nav>
  </footer>`;
