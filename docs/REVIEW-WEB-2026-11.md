# Revisión de producto — echoesofthegarden.com (2026-11-07)

Web en producción (`main` = `9456082`). Solo revisión: no se ha tocado nada del repo.
Etiquetas de evidencia: **(O)** observado en la web real (captura, medición, curl) · **(H)** heurística / convención · **(D)** documento (BACKLOG, ROADMAP del juego, código).
Esfuerzo: **S** < 1 h · **M** media jornada · **L** más.

**Cómo se ha revisado**
- Chromium 1280×800 y 390×844 (headless) + Chrome real haciendo scroll por secciones. Páginas: `/`, `/es/`, `/it/`, `/devlog/`, una entrada del dev log, `/bestiary/ash-drake/` (en y es), `/privacy/`, un 404.
- Rendimiento: la API de PageSpeed sin clave tenía la **cuota diaria agotada**, así que se usó **Lighthouse 13.0.1 en local** (el mismo motor que PageSpeed, con throttling simulado de móvil) contra el dominio real. Los números son de laboratorio, no de CrUX (aún no hay datos de campo). Para el informe oficial, repetir en pagespeed.web.dev.
- Capturas en `scratchpad/shots/` (nombres abajo).

## Lighthouse (local, dominio real)

| Página | Perf móvil | Perf escritorio | A11y | Best practices | SEO | TBT móvil |
|---|---|---|---|---|---|---|
| `/` | **66 / 70** (2 pasadas) | 93 | 100 | 81 | 100 | **8,6 s / 2,8 s** |
| `/es/` | 82 | 97 | 100 | 81 | 100 | 630 ms |
| `/devlog/` | 99 | 100 | 100 | 81 | 100 | 100 ms |
| `/bestiary/ash-drake/` | 97 | 100 | 98 | 81 | 100 | 180 ms |
| `/privacy/` | 100 | 100 | 100 | 81 | 100 | 50 ms |

Aislando la causa en `/` móvil: **sin `garden_loop.webp` → perf 87, TBT 490 ms, TTI 2,5 s**; sin el script de Cloudflare → perf 73, TBT 1,6 s.

## Lista priorizada

### 1. [S] (O) El GIF de la portada hunde el móvil
`garden_loop.webp` es un WebP animado de **1,4 MB** (Lighthouse estima 1,37 MB de ahorro). Por sí solo es la diferencia entre perf 70 y 87 y entre 2,8–8,6 s y 0,5 s de bloqueo. En móvil se carga la versión de 1280 px porque `sizes="100vw"` × DPR supera los 640.
**Propuesta:** convertirlo a `<video autoplay muted loop playsinline preload="none" poster="garden_loop-poster.webp">` con MP4/WebM (normalmente 150–300 KB para 8 s) y `ffmpeg` desde el mismo origen. Si no quieres vídeo: primer fotograma estático en móvil y la animación solo en ≥ 700 px con `<picture media>`.
Captura: — (medición).

### 2. [M] (O+H) En 5 segundos no se ve el juego
Arriba del todo hay título, dos líneas de estado que repiten "Coming to Steam" (badge + subtítulo), una etiqueta "An idle creature collector" de 9 px y `aria-hidden`, y cifras ("10 Echo Arc tiers", "3 languages") que no dicen nada a quien llega. **No hay ni una imagen del juego**: en móvil la primera captura empieza a **1 722 px** de scroll. El texto ("A garden outside of time…") es bonito pero no explica qué haces tú.
**Propuesta:**
- Meter el loop del jardín (ya en vídeo, punto 1) o la captura de la Death Ceremony en el hero, bajo los botones.
- Sustituir la etiqueta de 9 px por una línea legible que diga qué es: *"An idle game where every creature lives, ages and dies for good — and you choose what it leaves behind."* Dejar el tagline poético debajo.
- Unir badge y subtítulo en una sola línea: *"Free · Play now in your browser · Steam Early Access 2027"*.
- Cambiar las cifras por hechos que venden: *28 creatures · permanent death · plays offline · free*.
Capturas: `home_1280_fold.png`, `home_390_fold.png`, `es_1280_fold.png`.

### 3. [S] (O) Las páginas de criatura y del dev log son callejones sin salida
Son las páginas que trae Google (28 × 3 idiomas + 5 entradas), y no tienen menú, ni botón "Play", ni newsletter: solo "← The Bestiary" y la frase "Echoes of the Garden is a free-to-play idle game…". La criatura además no tiene `<main>` (único fallo de a11y de Lighthouse, 98).
**Propuesta:** en las plantillas de `scripts/build-bestiary.mjs` y del dev log, una cabecera mínima (logo → inicio · "Play free in browser") y un bloque al final con los dos CTA (jugar en itch, suscribirse a `/#newsletter`). Envolver el contenido en `<main>`.
Capturas: `creature_1280_fold.png`, `creature_390_fold.png`, `devlog_1280_fold.png`, `devpost_390_fold.png`.

### 4. [S] (O+D) Textos que prometen más de lo que el plan sostiene
- Sección Trading: *"nothing is sold for real money"*. En el Steam Community Market los jugadores venden por saldo de Steam, que es dinero real. Riesgo de confianza cuando llegue el Market.
- Ciclo de vida: Seed *"Tradeable item"*, Adult *"Highest market value"*, pero el EA sale **sin Market** (ADR-012). Quien juega hoy no puede comerciar.
- "Trading" es una de las 8 entradas del menú, para algo que llega después del EA.
**Propuesta:** *"No real-money shop: every item comes from play. Trading on the Steam Community Market arrives with the first major update after Early Access."*; en el ciclo, "Market value" → "Relic quality"/"rarity"; quitar Trading del menú (la sección se queda).
Captura: `d_lifecycle.jpg`.

### 5. [S] (O) Selector de idioma escondido bajo el footer
En la portada, EN · ES · IT solo aparece **debajo del footer** (y no en el menú móvil). Un visitante español que llega a `/` no lo ve.
**Propuesta:** tres enlaces cortos "EN · ES · IT" en la barra de navegación, a la derecha antes de "Get notified", y dentro del menú móvil. Lo inyecta el mismo bloque `LANG:START/END` del build de i18n.
Captura: `d_footer.jpg`.

### 6. [S] (O) El menú se rompe entre ~860 y ~1100 px
A 900 px el logo ocupa 3 líneas y "Dev Log" y "Get notified" se parten (portátiles pequeños, tablets en horizontal). En español las etiquetas son más largas y ya van justas a 1280.
**Propuesta:** pasar al menú hamburguesa en `max-width: 1100px` y/o quitar 2–3 entradas (Lifecycle, Ecosystems, Trading) del menú.
Captura: `home_900_nav.png`.

### 7. [M] (O+D) "Unsubscribe anytime" es a mano y por correo
El formulario dice *"Unsubscribe anytime"*; el correo de bienvenida y `List-Unsubscribe` apuntan a `mailto:hello@…?subject=unsubscribe`, y la privacidad dice *"We remove you by hand, so it can take a few days"* (`src/worker.js:80,125`). Es legal, pero no es lo que el usuario entiende por "anytime", y Gmail/Yahoo esperan baja en un clic (RFC 8058) para envíos masivos.
**Propuesta:** `GET/POST /api/unsubscribe?e=<email>&t=<hmac>` en el worker que marque `unsubscribed: true` en la audiencia de Resend; `List-Unsubscribe: <https://…>, <mailto:…>` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click`; actualizar la frase de privacidad.

### 8. [S] (O) Cloudflare inyecta un script que la privacidad no menciona
Todas las páginas cargan `/cdn-cgi/challenge-platform/scripts/jsd/main.js` (JavaScript Detections / Bot Fight Mode). Es el origen de los 2 avisos de APIs obsoletas que dejan **Best Practices en 81 en todas las páginas**, y unos 860 ms de CPU en móvil. La página de privacidad dice "no analytics and no cookies" y no lo nombra. No he comprobado si llega a poner cookies.
**Propuesta:** desactivar JavaScript Detections en la zona (Security → Bots). El formulario ya tiene honeypot y el worker valida. Si prefieres mantenerlo, nombrarlo en `/privacy/`. (Es un cambio de Cloudflare: pasaría por la skill `infra-servidores` antes de tocarlo.)

### 9. [S] (O) El resaltado del menú marca la sección equivocada
Con el Bestiario en pantalla, el menú resalta "Trading". Causa: el observer usa `threshold: 0.35` y el Bestiario mide 2 715 px (4 839 en móvil), así que nunca llega al 35 % visible y se queda el último resaltado (`index.html:3032-3041`). Además hay dos observers muertos que no observan nada (`index.html:3009-3012` y `3021-3030`).
**Propuesta:** `rootMargin: '-45% 0px -50% 0px', threshold: 0` (una línea en el centro de la pantalla) y borrar los dos bloques muertos.
Captura: `d_bestiary_scrollspy.jpg`.

### 10. [M] (O) La portada en móvil mide ~19 700 px; el Bestiario es una cuarta parte
Las 28 tarjetas de criatura apiladas en móvil ocupan ~4 800 px; el newsletter, el CTA de conversión, queda al final de todo.
**Propuesta:** en la portada, 4–6 criaturas + "See all 28 →" a una página `/bestiary/` nueva (hoy no existe índice; el enlace de vuelta de cada criatura va a `/#bestiary`). Con eso el newsletter sube varios miles de px. En móvil, tarjetas en 2 columnas.
Captura: `m_bestiary.jpg`.

### 11. [S] (O+H) Accesibilidad que Lighthouse no ve
- ~20 reglas con texto de **9–10 px**, mayúsculas, monoespaciada y con espaciado: menú, etiquetas de cifras, eyebrows, perks del newsletter, footer. Contraste aprobado, legibilidad no.
- Botón del menú móvil: **19×30 px** (recomendado 44×44).
- `#about-dev` tiene `aria-labelledby="dev-title"`, pero ese id no existe.
- `.reveal` empieza en `opacity:0` sin alternativa: si el JS falla, todo lo que hay bajo el hero queda invisible, y no respeta `prefers-reduced-motion`.
**Propuesta:** mínimo 12 px (menú 12–13 px); padding del botón a 44×44; poner `id="dev-title"` al eyebrow; ocultar `.reveal` solo con una clase `.js` puesta por script inline y añadir `@media (prefers-reduced-motion: reduce) { .reveal { opacity:1; transform:none; transition:none } }`.

### 12. [S] (O) Tres estilos visuales distintos
Portada (Cinzel/Crimson/JetBrains), dev log y criaturas (Crimson) y privacidad/404 (Georgia/Times del sistema). Privacidad y 404 parecen otra web, justo en la página de confianza.
**Propuesta:** que privacidad y 404 usen el mismo `<link>` de fuentes y los tokens de color del dev log.
Capturas: `privacy_1280_fold.png`, `404_390_fold.png`.

### 13. [S] (O) Enlaces falsos "Steam (soon)" y "Discord (soon)"
Son `<a href="#">`: al pulsarlos suben al principio de la página.
**Propuesta:** `<span>` no clicable con estilo atenuado, o quitarlos hasta que existan (el BACKLOG ya prevé el CTA de Steam).
Captura: `d_footer.jpg`.

### 14. [S, manual en itch] (O) La página de itch no enlaza a la web
`curl` de `echoes-of-the-garden.itch.io/play`: ningún enlace a echoesofthegarden.com. Quien juega ahí no llega al newsletter.
**Propuesta:** en la descripción de itch, una línea "Website, dev log and Early Access news: echoesofthegarden.com", más el enlace en los links del perfil.

### 15. [S] (H) Aviso legal
Los datos del titular (LSSI-CE art. 10) están en `/privacy/`, lo cual sirve, pero el footer solo dice "Privacy". Lo habitual es un enlace propio.
**Propuesta:** en el footer, "Legal notice" → `/privacy/#who-we-are`, o una `/legal/` de 5 líneas. No es asesoramiento legal.

### 16. [S] (O+D) Idiomas: detalles
- En `/es/` e `/it/` los nombres de especie siguen en inglés ("Ash Drake" junto a "Marea de Ceniza"). Si el juego en español también los deja en inglés es coherente; si no, hay que traducirlos (el CSV de contenido del juego no trae nombres).
- Las traducciones son borradores (BACKLOG): "Ready for strangers" → "Listo para desconocidos" es literal; mejor "Listo para jugadores nuevos".
- El correo de bienvenida solo está en inglés (ya en BACKLOG).
Captura: `creature_es_390_fold.png`.

### 17. [S] (D) Documentación interna desfasada (no es producto)
El README sigue apuntando a netlify.app como "Live site" y describe el despliegue en Netlify. En el BACKLOG, "Deferred to Early Access" lista como pendiente lo que la sección de Cloudflare ya da por hecho, y "W4 i18n" sigue abierta aunque `/es/` e `/it/` están publicadas.

## Lo que ya está bien
- Cabeceras de seguridad completas: CSP estricta, HSTS, `nosniff`, `frame-ancestors 'none'`, Permissions-Policy (O).
- `www`, `.es` y netlify.app redirigen con 301 al dominio (O).
- SEO 100 en todo: hreflang en todas las páginas, sitemap con 108 URLs, robots, JSON-LD (O).
- Dev log, criaturas y privacidad casi perfectos en rendimiento (97–100) (O).
- Los `alt` de las capturas describen de verdad lo que se ve (O).
- 404 con el tono del juego ("Nothing grows here") y salidas útiles (O).
- La privacidad es clara, corta y nombra responsable, finalidades y plazos (O).
- La sección "Placeholder pixel art, real game — nothing here is a mock-up" es honesta y genera confianza (O).

## Top 5 para hacer primero
1. Vídeo en vez del WebP animado (punto 1) — S
2. Imagen del juego + línea clara en el hero (2) — M
3. Cabecera y CTA en criaturas y dev log (3) — S
4. Textos de Market y "real money" (4) — S
5. Selector de idioma en la barra + arreglo del menú a 900 px (5, 6) — S

## Estado tras los arreglos (2026-11-08, rama `fix/web-review-2026-11`)

Capturas de antes y después en el scratchpad de la sesión (`shots/`, `after/`), no se commitean.

| # | Estado |
|---|---|
| 1 | ✅ `garden_loop.mp4` (120 KB) + póster en lugar del WebP de 1,4 MB. Portada móvil en local: perf 86–91, TBT 320–470 ms (antes 66–70 y 2,8–8,6 s en producción). Se borran el WebP, su versión de 640 px y el GIF sin uso |
| 2 | ✅ Hero: insignia única, línea clara, vídeo bajo los botones, cifras nuevas (28 criaturas · 1 vida cada una · 24/7 · gratis sin pay-to-win) |
| 3 | ✅ Cabecera y CTA compartidos (`scripts/site-chrome.mjs`) en criaturas, dev log y `/bestiary/`; `<main>` en todas |
| 4 | ✅ Textos de Market y "real money" reescritos; Trading, Lifecycle y Ecosystems fuera del menú |
| 5 | ✅ EN · ES · IT en la barra y en el menú móvil (bloque `NAVLANG` en `build-i18n.mjs`) |
| 6 | ✅ Menú hamburguesa por debajo de 1200 px |
| 7 | ✅ `/api/unsubscribe` firmado (HMAC), GET pide confirmar y POST da de baja; `List-Unsubscribe-Post`. Falta poner el secreto `UNSUBSCRIBE_SECRET` |
| 8 | ✅ Decisión: JS Detections se queda. Verificado que pone la cookie `cf_clearance` (HttpOnly, persistente); la privacidad ya no dice "no cookies" y la nombra. Best Practices seguirá en 81 en producción por ese script |
| 9 | ✅ Scrollspy con una línea en mitad de la pantalla; borrados los dos observers muertos |
| 10 | ✅ Portada con 2 criaturas por bioma + "See all 28 creatures"; nueva página `/bestiary/` (también es/it y en el sitemap) |
| 11 | ✅ Mínimo 12 px (25 reglas), botón del menú 44×44, `aria-labelledby` roto corregido, `.reveal` solo oculta con JS, reduced motion respetado; el vídeo se pausa con un clic o con reduced motion |
| 12 | ✅ Privacidad y 404 con las fuentes de la web y la misma cabecera |
| 13 | ✅ "Steam (soon)" ya no es enlace; Discord quitado |
| 14 | ⏳ Manual en itch (texto en el BACKLOG) |
| 15 | ✅ "Legal notice" en el footer → `/privacy/#who-we-are` |
| 16 | ✅ "Listo para jugadores nuevos" / "Pronto per nuovi giocatori". Nombres de especie: se quedan en inglés a propósito, como en el juego (`build-i18n.mjs`, KEEP) |
| 17 | ✅ README reescrito para Cloudflare; BACKLOG sin la sección "Deferred to Early Access" ya cumplida |
