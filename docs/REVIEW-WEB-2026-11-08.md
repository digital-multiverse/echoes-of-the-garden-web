# Revisión de diseño — echoesofthegarden.com (2026-11-08, pase de accesibilidad)

**Solo revisión: no se ha tocado nada del repo, de Cloudflare ni del servidor.**

Esta es la tercera revisión del mismo commit hoy. Su objetivo es probar a fondo la skill
`a11y` (lente 4) y ver qué añade la `design-review` actualizada. El resto de lentes se
resume en "Sin cambios" y remite a `docs/REVIEW-WEB-2026-11.md` y a
`…/scratchpad/review-test/REVIEW-WEB-2026-11.md`.

- **Commit en producción:** `main` = `9456082`. Verificado (O): `diff <(git show main:index.html) <(curl -s /)` solo difiere en el `<script>` de `/cdn-cgi/challenge-platform/` que inyecta Cloudflare. La rama `fix/web-review-2026-11` (`791f857`) **no está desplegada**; donde digo "en la rama" lo he leído con `git show HEAD:index.html`.
- **Sin navegador real:** no se ha usado claude-in-chrome (otras revisiones comparten el navegador). Todo es Chromium headless: `capture.sh`, `measure.mjs`, `a11y.mjs` y tres scripts auxiliares en `…/scratchpad/reviews/echoes-tools/` (detalles de axe, foco con captura, menú móvil, colores de enlace).
- **Red:** `echoesofthegarden.com` resolvió a 172.67.213.226 (edge que funciona); no hizo falta `HOST_RULES`. `echoesofthegarden.es` sigue sin responder; por el edge (`--resolve`) da 301 → sin confirmar, red local.
- **Páginas:** `/`, `/es/`, `/it/`, `/devlog/`, `/devlog/creatures-that-die-for-good/`, `/bestiary/ash-drake/`, `/es/bestiary/ash-drake/`, `/privacy/`, 404 (`/no-existe/`). `a11y.mjs` a 1280 y 390 px en las nueve (18 pasadas); `measure.mjs` en home (390/1280), criatura y entrada (390).
- **Rendimiento:** PageSpeed sin clave → **429 "Quota exceeded"** (O). Lighthouse 13.0.1 local, laboratorio; sin datos de campo (CrUX). **Carga del host 5–21 con 4 núcleos** y otras revisiones en paralelo: el TBT no es fiable.
- **Capturas:** `/tmp/claude-1000/-mnt-hdd-repositories/222a2e80-19f1-4b7a-9994-abb9fe63231f/scratchpad/reviews/echoes/shots/` (`<página>_<ancho>.png`), `focus/` (foco y menú), JSON en `a11y/`, `lh/`, `measure_*.json`.
- **Etiquetas:** **(O)** observado · **(H)** heurística, con fuente · **(D)** documento/código. **Esfuerzo:** **S** < 1 h · **M** media jornada · **L** más.

## Lighthouse (local, laboratorio, una pasada, host cargado)

| Página | Perf móvil | Perf escritorio | A11y | Best practices | SEO | LCP móvil | TBT móvil | Peso |
|---|---|---|---|---|---|---|---|---|
| `/` | 77 | 89 | 100 | 81 | 100 | 1,8 s | 1.060 ms | 1.719 KB |
| `/es/` | 78 | 68 | 100 | 81 | 100 | 1,8 s | 1.010 ms | 1.721 KB |
| `/devlog/` | 69 | 100 | 100 | 81 | 100 / 92* | 1,7 s | **7.930 ms** (carga del host) | 86 KB |
| `/devlog/creatures-that-die-for-good/` | 96 | 100 | 100 | 81 | 100 | 1,1 s | 210 ms | 106 KB |
| `/bestiary/ash-drake/` | 99 | 100 | 98 | 81 | 100 | 0,8 s | 110 ms | 77 KB |
| `/privacy/` | 99 | 100 | 100 | 81 | 100 | 0,8 s | 100 ms | 22 KB |

404 sin Lighthouse (no es 200; la pasada falló como se espera). Rangos de TBT de la home de
la revisión anterior: 480–3.060 ms; esta pasada cae dentro.

Igual que en las revisiones anteriores (O): peso de la home ~1,7 MB por el WebP animado; Best
Practices 81 por el script de Cloudflare (decisión registrada en el intent, no es nuevo); a11y
100 en todas salvo criatura. No he repetido el aislamiento: la revisión anterior ya mostró que
bloquear `garden_loop` quita 1,38 MB pero no el TBT. El SEO 92 de `/devlog/` escritorio es
`robots-txt` "no se pudo descargar" en esa pasada; `robots.txt` responde 200 (O): ruido.

## Qué ha añadido la skill `a11y` (resumen)

| Comprobación | Resultado |
|---|---|
| axe-core completo (WCAG 2.2 A/AA + best practice) | 0 violaciones en dev log, entrada, privacidad y 404. Home/es/it: `region` (3). Criatura: `landmark-one-main` + `region` (10). |
| `axeIncomplete` revisado a mano | 3 × `aria-label` en `<div>` sin rol, 1 × `aria-labelledby` roto, 16–23 contrastes sobre degradado (hero, revisados en captura: legibles). |
| Recorrido de teclado | 59 paradas (1280) / 51 (390) en la home; 6–12 en el resto. Ninguna tapada por la cabecera fija. |
| Controles sin nombre (árbol de accesibilidad) | Ninguno. |
| Espaciado de texto 1.4.12 | Nada recortado. |
| Reflow a 320 px | Sin scroll horizontal en ninguna. |
| Movimiento reducido | Home: 2 animaciones infinitas siguen activas. Resto: 0. |
| A mano (§2) | Menú móvil, formulario, foco del campo, enlace de privacidad, `lang`, alt. Ver ítems 1–6. |

Lo que **solo** ha salido por este pase (ninguna de las dos revisiones anteriores lo tenía): ítems 1, 2, 3, 5 y 6.

## Lista priorizada

### 1. [S] (O) 2.4.3 / 2.1.1 Al abrir el menú móvil, el Tab se salta el menú y Escape no lo cierra
Home a 390 px (y `/es/`, `/it/`): Tab → "Open menu" → Enter abre el menú. El siguiente Tab
va a "🌱 Play in browser" del hero, **debajo** del menú abierto, porque en el DOM el `<ul
class="nav-links">` y `.nav-cta` van **antes** del botón (`index.html:2170-2179` en `main`,
`2194-2203` en la rama). Para llegar a los enlaces hay que ir hacia atrás con Shift+Tab.
Escape no hace nada (no hay `keydown`), y el `aria-label` sigue diciendo "Open menu" con el
menú abierto. La rama no lo cambia.
**Propuesta:** mover el `<button class="nav-mobile-btn">` justo después de `.nav-logo` (antes
del `<ul>`), sin tocar el CSS de posición; en `toggleMenu()` (`index.html:3044`) alternar
`aria-label` entre "Open menu"/"Close menu" (y sus traducciones en `build-i18n.mjs`), añadir
`aria-controls="main-nav"` y un `document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) { toggleMenu(); btn.focus(); } })`.
Capturas: focus/menu_open_390.png

### 2. [S] (O) 1.4.3 El enlace "Privacy" de la newsletter es azul de navegador sobre casi negro (1,9:1)
`.nl-privacy a` no tiene color propio: hereda `#0000EE` del navegador sobre `rgb(19,23,18)`,
contraste **1,93:1** (mínimo 4,5:1), a 9 px. Es el único enlace a la privacidad junto al
formulario. axe y Lighthouse no lo ven: cuando corren, la sección está a `opacity: 0` por el
efecto `reveal` (76 nodos con texto ocultos en la home al cargar). En la rama el texto pasa a
12 px, pero el enlace sigue sin color.
**Propuesta:** `.nl-privacy a { color: #8fba7a; text-decoration: underline; }` (el verde del
selector de idioma, 8,2:1 sobre ese fondo).
Capturas: focus/home_390_tab37.png (abajo del formulario)

### 3. [S] (O) 2.4.7 / suelo 2.4.13 El campo de email casi no muestra el foco
`.nl-input` tiene `outline: none` (`index.html:1409`) y en `:focus` solo cambia el borde de 1 px
a verde y añade una sombra al 10 % de opacidad (`:1417-1420`). En la captura se ve un borde fino;
no llega al suelo del estudio (≥ 2 px). El script lo da por bueno porque cuenta cualquier
`box-shadow` como anillo. Igual en la rama.
**Propuesta:** quitar `outline: none` y la sombra; `.nl-input:focus-visible { outline: 2px solid var(--green); outline-offset: 2px; }`.
Capturas: focus/home_390_tab37.png

### 4. [S] (O+D) 2.3.3 (suelo) Dos animaciones infinitas ignoran `prefers-reduced-motion`
Con `reduce`, siguen corriendo `pulse` en `.nav-logo-dot` y `.badge-dot` (`index.html:189` y
`:578`) en home, `/es/`, `/it/`. Ya estaba como parte del ítem 10 de la revisión anterior
("sin `prefers-reduced-motion` en CSS"); lo nuevo es que **la rama sí añade un bloque
`@media (prefers-reduced-motion: reduce)` pero solo cubre `.reveal`**, así que tras desplegarla
seguirán latiendo.
**Propuesta:** dentro de ese bloque de la rama (`index.html:397`), añadir
`.nav-logo-dot, .badge-dot { animation: none; }`.

### 5. [S] (O) 4.1.2 `aria-label` que nadie lee y una referencia rota
`aria-label` en tres `<div>` sin rol: `.badge` ("Development status"), `.hero-stats`
("Game stats"), `.nl-perks` ("Newsletter benefits"). Los lectores de pantalla lo ignoran en un
`div` genérico. Además `#about-dev` usa `aria-labelledby="dev-title"` y ese id no existe
(también lo marca `measure.mjs`); **la rama lo arregla** (`aria-label="About the developer"`).
**Propuesta:** cortar los tres `aria-label` (el texto visible ya dice lo mismo). Si se quiere
agrupar las cifras, `role="group"` en `.hero-stats`. Quitar antes que añadir.

### 6. [S] (O+H) 3.3.2 / 3.3.1 Formulario: la etiqueta solo existe para lectores y el error no se asocia al campo
`<label for="nl-email" class="sr-only">` + placeholder "your@email.com" como única pista
visible; cuando se escribe, desaparece. El error (`#nl-error`, `role="alert"`) se anuncia, pero
el campo no recibe `aria-invalid` ni `aria-describedby`, y el mensaje no dice qué falta ("Please
enter a valid email address." está bien escrito). Lo bueno: honeypot con `tabindex="-1"` y
`aria-hidden`, éxito con `role="status"`, `autocomplete="email"`. (H: la skill pide etiqueta
visible; WCAG acepta placeholder + nombre accesible como mínimo.)
**Propuesta:** hacer visible la etiqueta ("Your email", 12 px, sobre el campo) quitando
`sr-only`; en `handleSubscribe` (`index.html:~3060`) poner `aria-invalid="true"` y
`aria-describedby="nl-error"` al fallar, y quitarlos al reintentar.

### 7. [S] (O) 1.3.1 Sin `<main>` en la home ni en las páginas de criatura
Igual que el ítem 11 de la revisión anterior. axe lo confirma en criatura
(`landmark-one-main`, `region` × 10) y en la home (`region` × 3, el bloque "About the
developer"). Lighthouse sigue dando 100. En la rama, `index.html` sigue sin `<main>`.
**Propuesta:** envolver de `#hero` a `#about-dev` en `<main>` y el contenido de criatura en
`build-bestiary.mjs` igual.

### 8. [S] (H) 2.4.1 Sin enlace "saltar al contenido"
A 1280 px hay 10 paradas de menú antes del primer CTA y 28 tarjetas de criatura antes de la
newsletter (59 paradas en total). Con landmarks bien puestos (ítem 7) WCAG se cumple; un
enlace de salto es convención (H, WebAIM "Skip navigation links").
**Propuesta:** `<a class="sr-only-focusable" href="#about">Skip to content</a>` como primer hijo
de `<body>`, visible al recibir foco. Prioridad baja; primero el ítem 7.

### 9. Texto < 12 px y objetivos < 44 px — sin cambios (O)
`measure.mjs`: home 109 nodos < 12 px a 390 (118 a 1280); objetivos < 24 px: 12 a 390 (uno es el
honeypot, falso positivo), < 44 px: 18. Igual que los ítems 6 y 12 de la revisión anterior; en la
rama al menos `.nl-privacy` pasa de 9 a 12 px (no he medido la rama entera).

## Sin cambios respecto a la revisión anterior (mismo commit)

Comprobado de nuevo solo lo barato (curl, `measure.mjs`, capturas); todo sigue como en
`review-test/REVIEW-WEB-2026-11.md`: Market/"Trading" en el menú y en la home (1), "Q2 2027" (2),
primer pantallazo sin juego (3), criaturas sin CTA de jugar ni suscribirse y la entrada solo con
"Get the next entry by email" (4), WebP de 1,7 MB (5), menú roto 900–1200 px (7), selector de
idioma solo al final (8), newsletter a ~21 700 px en móvil (9: `firstFormTop` 21 683), contenido
oculto sin JS (10: 12 secciones), "no cookies"/`cf_clearance` y "Unsubscribe anytime" (13),
`href="#"` en Steam/Discord (14), privacidad y 404 (15), jerga del hero (16), `/devlog` → **307**
(17), `.es` sin respuesta (18). `www` y `netlify.app` → 301 (O).

## Lo que ya está bien (no "arreglarlo")

- (O) `lang` correcto en cada idioma (`en`/`es`); el selector tiene `lang` y `hreflang` en cada enlace y `aria-current` en el activo.
- (O) Alt de las capturas descriptivos y **traducidos** en `/es/` ("La Ceremonia de la muerte: el nombre de una criatura, su epitafio…"). Los nombres de especie quedan en inglés a propósito (`KEEP` en `build-i18n.mjs`, D); los trato como nombres propios, sin `lang="en"`.
- (O) Dev log, entrada, privacidad y 404: 0 violaciones de axe, orden de teclado corto y lógico.
- (O) Reflow a 320 px sin scroll horizontal y sin recortes con el espaciado 1.4.12, en las nueve páginas.
- (O) Ningún foco queda tapado por la cabecera fija; los enlaces muestran el anillo por defecto de Chrome.
- (O) Formulario: honeypot fuera del teclado y del lector, mensaje de éxito con `role="status"`, error con `role="alert"`.
- (O) El botón del menú tiene nombre y `aria-expanded` que cambia.

## No comprobado

Lector de pantalla (sin Orca en headless), zoom 200 % real (aproximado con el reflow a 320 px),
tema claro (el sitio solo tiene oscuro), la página de itch.io, navegador real.

## Top 5

1. Ítem 1: orden del botón del menú + Escape + "Close menu" (S).
2. Ítem 2: color del enlace "Privacy" de la newsletter (S, una línea).
3. Ítem 4: añadir los dos puntos que laten al bloque de movimiento reducido de la rama antes de desplegarla (S, una línea).
4. Ítem 3: anillo de foco de 2 px en el email (S).
5. Ítem 7 + 5: `<main>` y cortar los `aria-label` sobrantes (S).

Y siguen valiendo, por delante en impacto de conversión, los Top 5 de la revisión anterior
(Market, primer pantallazo, CTAs en las páginas que trae Google), que esta pasada no repite.
