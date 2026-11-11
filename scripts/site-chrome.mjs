// Header and closing call to action shared by the generated pages (creatures, bestiary index, dev log).
// privacy/index.html and 404.html carry a hand copy of the same markup: keep them in step.
const PLAY = "https://echoes-of-the-garden.itch.io/play";

export const CHROME_CSS = `
    .site-head { box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; gap: 16px; width: 100%; max-width: 900px; margin: 0 auto; padding: 16px }
    .site-logo { font-family: 'Cinzel Decorative', serif; color: #e8cb7a; text-decoration: none; font-size: 15px; border: 0; white-space: nowrap }
    .site-play { display: inline-block; padding: 10px 18px; border: 1px solid #5a9e6a; border-radius: 4px; background: #1e3324; color: #c8e8c0; text-decoration: none; font-size: 16px; line-height: 1.3; white-space: nowrap }
    .site-play:hover { background: #2a4630 }
    :focus-visible { outline: 2px solid #c8e8c0; outline-offset: 3px }
    @media (max-width: 420px) { .site-logo { font-size: 12px } .site-play { font-size: 14px; padding: 8px 12px } }
    .site-cta { width: 100%; max-width: 680px; margin: 48px auto 0; padding: 28px 16px 8px; border-top: 1px solid #222820; text-align: center }
    .site-cta p { margin: 0 0 14px }
    .site-cta .site-links { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 12px 20px }`;

export const HEADER = `  <header class="site-head">
    <a class="site-logo" href="/">Echoes of the Garden</a>
    <a class="site-play" href="${PLAY}" target="_blank" rel="noopener">Play free in browser</a>
  </header>`;

export const CTA = `  <aside class="site-cta">
    <p>Echoes of the Garden is a free-to-play idle game about creatures that die for good.</p>
    <p class="site-links"><a class="site-play" href="${PLAY}" target="_blank" rel="noopener">Play free in browser</a> <a href="/#newsletter">Get notified on launch</a></p>
  </aside>`;
