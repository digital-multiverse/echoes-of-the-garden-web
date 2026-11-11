# Revisión de diseño: echoesofthegarden.com (2026-11-09, tras el PR #8)

**Solo revisión: no se ha tocado nada del repo, de Cloudflare ni de itch.**

- **Commit en producción:** `origin/main` = `fe82c00` (merge del PR #9). Los arreglos de la revisión de 2026-11 entraron con el PR #8 (`13a59f6`). Comprobado (O) con `diff <(git show origin/main:index.html) <(curl -A <navegador> /)`: lo único que cambia es el `<script>` de `/cdn-cgi/challenge-platform/` que inyecta Cloudflare.
- **Páginas revisadas:** `/`, `/es/`, `/it/`, `/devlog/`, `/devlog/ready-for-strangers/`, `/bestiary/`, `/bestiary/ash-drake/`, `/privacy/` y la 404 (`/no-existe/`). Todas a 1280, 390 y 900 px.
  - `measure.mjs` en la home (390 y 1280), la criatura y la entrada (390).
  - `a11y.mjs` en la home (390 y 1280), la criatura, la entrada y privacidad (390).
- **Rendimiento:** solo laboratorio, Lighthouse 13.0.1 en local; no hay datos de campo (CrUX). No probé PageSpeed: ayer devolvió 429 sin clave. **Ojo: la máquina estaba a carga 10–13 con 4 núcleos**, así que el TBT y la nota de rendimiento de esta pasada no son fiables (ver punto 12).
- **Capturas y datos:** `/tmp/claude-1000/-mnt-hdd-repositories-echoes-of-the-garden-echoes-of-the-garden-web/0d2ad470-5304-4537-8069-33077cab7b1e/scratchpad/review-echoes-2026-11-09/`. Allí están `shots/<página>_<ancho>.png`, `shots/top.png` y `shots/mob.png` (hojas de contacto), `lh/*.json`, `measure_*.json` y `a11y/*.txt`.
- **Etiquetas:** **(O)** observado · **(H)** heurística o convención · **(D)** documento o código. **Esfuerzo:** **S** < 1 h · **M** media jornada · **L** más.

## Lighthouse (local, laboratorio, máquina cargada)

| Página | Perf móvil | Perf escritorio | A11y | BP | SEO | LCP móvil | TBT móvil | CLS móvil | Peso |
|---|---|---|---|---|---|---|---|---|---|
| `/` (pasada 1) | 87 | 57 | 100 | 81 | 100 | 1,8 s | 490 ms | 0 | 485 KB |
| `/` (pasada 2) | 70 | 62 | 100 | 81 | 100 | 1,9 s | 3.220 ms | 0,034 | 485 KB |
| `/es/` | 69 | 68 | 100 | 81 | 100 | 2,2 s | 3.720 ms | 0,009 | 485 KB |
| `/bestiary/ash-drake/` | 73 | 100 | 100 | 81 | 100 | 0,9 s | 1.190 ms | **0,111** | 77 KB |
| `/privacy/` | 99 | 100 | 100 | 81 | 100 | 0,8 s | 100 ms | 0,001 | 71 KB |

- La home pesa 485 KB. En la pasada del 8 de noviembre, con el commit anterior, pesaba 1.719 KB (O).
- El 81 de Best Practices se debe al script de Cloudflare y es una decisión tomada (D: design-intent).

## Lista priorizada

### 1. [S] (O) Con el teclado no se puede usar el menú móvil
`a11y.mjs` a 390 y 1280 px, en la home:
- Enter abre el menú y el foco va a "✕".
- El primer Tab se sale del menú: va a "Play free in browser", que queda detrás.
- Escape no lo cierra: `aria-expanded` sigue en `true`.
- El botón conserva `aria-label="Open menu"` con el menú abierto y no tiene `aria-controls`.

Era el punto 1 de la pasada del 8 de noviembre y sigue abierto.

**Propuesta:** en `toggleMenu()` (`index.html`, alrededor de la línea 2919):
- Al abrir, llevar el foco al primer enlace de `.nav-links`.
- Con el menú abierto, que Escape lo cierre y devuelva el foco al botón.
- Cambiar `aria-label` entre "Open menu" y "Close menu".
- Añadir `aria-controls` apuntando al `id` de la lista.
- Mientras esté abierto, poner `inert` en `#hero` y en el resto de secciones, para que el Tab no salga del menú.

### 2. [S] (O) El foco del teclado apenas se ve en ninguna página
En todas las páginas medidas, cada parada de Tab tiene un contorno de menos de 2 px: 38 de 39 en la home y todas en la criatura, la entrada y privacidad. El campo de email solo marca el foco con una sombra. Es el punto 3 del 8 de noviembre, que ahora se ve en todo el sitio.

**Propuesta:** una regla común en `index.html` y en `CHROME_CSS` (`scripts/site-chrome.mjs`), y la misma en la copia a mano de privacy y 404:
```css
:focus-visible { outline: 2px solid #c8e8c0; outline-offset: 3px }
.nl-input:focus-visible { outline: 2px solid #c8e8c0; outline-offset: 2px }
```

### 3. [S] (O) Tres textos no llegan al contraste mínimo
- El enlace "Privacy" de la newsletter (`index.html:2793`) no tiene regla de color, así que sale en el azul por defecto del navegador sobre fondo casi negro. Es el punto 2 del 8 de noviembre (1,9:1), sigue abierto (O+D).
- `.dev-soon` ("Steam (soon)") usa `opacity: 0.55` (`index.html:1550`). axe lo marca como fallo a 390 y 1280 px.
- `.rm-phase` de la primera fase del roadmap: `#4a7a5a`, 12 px (`index.html:1195`). axe lo marca a 1280 px.

**Propuesta:**
- Añadir `.nl-privacy a { color: var(--text-muted); text-decoration: underline }`.
- En `.dev-soon`, quitar la opacidad y usar `color: var(--text-muted)`.
- En `.rm-item[data-p="0"] .rm-phase`, cambiar el color a `#6fae84` o a `var(--green-hi)`.

### 4. [S] (O+D) Dos animaciones infinitas no respetan reduced motion
Con `prefers-reduced-motion: reduce` siguen en marcha dos animaciones: los `pulse` de las líneas 190 y 595, el punto del badge y el del roadmap. El vídeo sí se para (O). Es el punto 4 del 8 de noviembre.

**Propuesta:** dentro del `@media (prefers-reduced-motion: reduce)` que ya existe, añadir `*, *::before, *::after { animation: none !important }`.

### 5. [S] (O) La home no tiene `<main>` ni enlace para saltar al contenido
- `measure.mjs` cuenta `main: 0` en la home, y axe da `landmark-one-main`.
- La criatura, la entrada y privacidad ya tienen uno (O). Eso está arreglado desde el PR #8.

Son los puntos 7 y 8 del 8 de noviembre.

**Propuesta:**
- Envolver las secciones de `#hero` a `#about-dev` en `<main id="content">`.
- Poner como primer hijo de `<body>` un `<a class="skip" href="#content">Skip to content</a>`, visible solo con foco. Basta con `.skip{position:absolute;left:-9999px}.skip:focus{left:16px;top:8px}`.
- `build-i18n.mjs` lo traduce con dos claves nuevas en `es.json` e `it.json`.

### 6. [S] (O) Etiquetas y errores del formulario sin asociar
- `aria-label` sobre `div` sin rol en `.hero-stats` y `.nl-perks` (axe `aria-prohibited-attr`): los lectores de pantalla no lo leen.
- El error `#nl-error` no está asociado al campo.

Es el punto 6 del 8 de noviembre. La referencia `aria-*` rota del 8 de noviembre ya está arreglada: `brokenAriaRefs` sale vacío (O).

**Propuesta:**
- Quitar los dos `aria-label` sobrantes, o añadir `role="list"` / `role="group"`.
- En el `<input>`, añadir `aria-describedby="nl-error"` y poner `aria-invalid="true"` cuando falle.

### 7. [M] (O) En móvil, el formulario de la newsletter queda a 17.332 px de la parte superior
- A 390 px la home mide 18.205 px. Antes medía unos 19.700; el punto 10 de la revisión anterior está mejor, pero no resuelto.
- El botón del hero "Get notified on launch" sí salta hasta el formulario. Quien hace scroll lo encuentra después de 12 secciones.
- Por altura en móvil, las secciones que más ocupan después del bestiario (2.734 px) son trading (1.453), what's new (1.506) y roadmap (1.830).

**Propuesta, cortar antes que añadir:**
- En móvil, ocultar `#trading` con `display: none` por debajo de 820 px. Se refiere a algo posterior al Early Access (D: ADR-012), así que no hace falta para decidir hoy.
- Mostrar solo las fases actual y siguiente del roadmap, con un enlace "Full roadmap".
- Si después sigue lejos, añadir una línea de suscripción tras `#bestiary`.

### 8. [S] (O) En español, el botón principal ocupa dos líneas en móvil
- A 390 px, "🌱 JUEGA GRATIS EN EL NAVEGADOR" se parte en dos líneas (`shots/es_390.png`).
- El badge ocupa 3 líneas en `/es/` y en `/it/`, y 2 en inglés.

**Propuesta:**
- En `i18n/es.json`, `"Play free in browser"` → `"Juega gratis"` solo para el botón. Como las claves son el texto inglés, hace falta una clave distinta, o envolver el resto en `<span class="hide-sm">`.
- `.btn-primary { letter-spacing: 2px }` por debajo de 420 px.
- Badge: quitar "Coming to Steam Early Access" en móvil, porque ya aparece en el roadmap.

### 9. [S] (O) En la cabecera común, el logo ocupa dos líneas a 390 px
En la criatura, la entrada, `/bestiary/`, privacidad y la 404, "Echoes of the Garden" se parte en dos líneas al lado del botón (`shots/mob.png`).

**Propuesta:** en `CHROME_CSS` y en sus copias:
- `.site-logo { font-size: 13px; white-space: nowrap }`
- `.site-play { padding: 10px 14px }` por debajo de 420 px.

### 10. [S] (O, causa H) La criatura en móvil mueve el texto al cargar (CLS 0,111)
- Lighthouse atribuye el salto a `<p class="lore">`. En escritorio es 0,001.
- Probablemente lo causa el cambio a la cursiva de Crimson Pro cuando termina de cargar (H). Es una sola pasada y la máquina estaba cargada.

**Propuesta:** primero, volver a medir con la máquina libre. Si se repite:
- En `PAGE_FONTS` (`build-bestiary.mjs`), precargar el woff2 de Crimson Pro italic.
- O usar `&display=optional` en la URL de Google Fonts solo para esas páginas.

### 11. [S] (O+H) Los enlaces del pie y del selector de idioma miden 16–20 px de alto
`measure.mjs` lo mide a 390 y 1280 px:
- "English", "Español" e "Italiano": 16 px.
- About, Play, Roadmap, Newsletter, Privacy y Legal notice: 20 px.

Están separados en fila, así que probablemente aplica la excepción de espaciado de WCAG 2.5.8 y no es un fallo AA (H). Aun así, el suelo del estudio es de 44 px.

**Propuesta:** `footer a, .lang a { display: inline-block; padding: 12px 6px }`.

### 12. [S] (O) Rendimiento: esta pasada no sirve para sacar conclusiones
- TBT de la home en móvil: 490 y 3.220 ms en dos pasadas seguidas.
- Escritorio: 57–62, con TBT de 860–3.110 ms.

Todo con la máquina a carga 10–13 sobre 4 núcleos (O). El peso sí es fiable: 485 KB, contra 1.719 KB antes.

**Propuesta:** repetir `SHOTS=0 RUN=3 LH_PAGES="home es detail" capture.sh` con la máquina libre antes de tocar nada. Si el TBT de escritorio sigue por encima de 500 ms, aislar `/cdn-cgi/challenge-platform/` con `BLOCK`.

### 13. [S] (O) `/bestiary` sin barra final responde 307 y no 301
Lo hace el `auto-trailing-slash` de Workers static assets. Los enlaces internos y el sitemap ya llevan la barra final, así que el impacto es bajo (H).

**Propuesta:** no tocarlo.

### 14. [S] (H) La línea de resonancias de la criatura no se entiende sin jugar
"Born by night · Fulgor · morning → Ascua · midday → Arraigo · evening → Umbra". Los nombres son canónicos y no se traducen (D: notas de sesión del juego), así que no es un error de idioma. Pero alguien que llega desde Google no sabe qué es "Fulgor".

**Propuesta:** convertir "resonance" en un enlace a `/#systems`, o añadir debajo una línea pequeña: "Resonances shift with the time of day. They decide which seeds a creature leaves."

## Revisión anterior

**`REVIEW-WEB-2026-11.md`**
- Puntos 1–6, 8, 9 y 11–17: **arreglados** y en producción (O).
- Punto 7 (baja): **arreglado en código**. Un token falso da 400 (O). Falta la prueba real con un correo.
- Punto 10 (altura de la home en móvil): **mejorado pero abierto**, de 19.700 a 18.205 px. Es el punto 7 de esta revisión.
- Punto 14 (itch): **arreglado**. La página del juego y el perfil enlazan a la web (O, curl).

**`REVIEW-WEB-2026-11-08.md`** (accesibilidad, sin commitear en el repo)

| Punto | Estado |
|---|---|
| 1. Menú con teclado | **Abierto** → punto 1 |
| 2. Contraste del enlace "Privacy" | **Abierto** → punto 3 |
| 3. Foco del email | **Abierto** → punto 2 |
| 4. Reduced motion | **Abierto** → punto 4 |
| 5. `aria` | La referencia rota está **arreglada**; los `aria-label` sin rol siguen **abiertos** → punto 6 |
| 6. Formulario | **Abierto** → punto 6 |
| 7. `<main>` | **Arreglado** en criatura, entrada y privacidad; **abierto** en la home → punto 5 |
| 8. Enlace para saltar al contenido | **Abierto** → punto 5 |
| 9. Tamaños | Sin texto de menos de 12 px (O); los objetivos táctiles pasan al punto 11 |

## Lo que ya está bien (no tocar)

- **Prueba de 5 segundos (O):** en en, es e it, a 1280 y a 390 px, la primera pantalla dice qué es, que es gratis y que se juega ya, y enseña el juego en movimiento.
- **Llamadas a la acción (O):** "Play free in browser" aparece en la cabecera y en el cierre de la criatura, la entrada, `/bestiary/`, privacidad y la 404. El selector de idioma se ve sin hacer scroll.
- **Reflow y texto (O):** no hay scroll horizontal, el reflow a 320 px y el espaciado de texto (1.4.12) pasan, y no hay texto de menos de 12 px.
- **Cookies y privacidad (O):** la única cookie es `cf_clearance` y la página de privacidad la nombra. Los 301 de `www`, `.es` y `netlify.app` funcionan. La CSP, HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy` y `Permissions-Policy` están presentes.
- **Contenido sin JS (O):** el aviso de `measure.mjs` sobre `#ecosystems` es un falso positivo. Lo provoca `.eco-card-glow`, una capa de hover que tiene `opacity: 0` a propósito.
- **Textos del trading (O+D):** hablan en futuro ("arrives with the first major update after Early Access"), como pide ADR-012.

## Top 5

1. **Un PR de accesibilidad** (puntos 1–6), unas 2 h en total. Cierra a la vez todo lo que quedó abierto el 8 de noviembre.
2. **Newsletter más arriba en móvil** (punto 7), quitando trading en móvil y recortando el roadmap.
3. **Botón en español y logo de la cabecera** (puntos 8 y 9), con CSS y una clave i18n.
4. **Rendimiento con la máquina libre** (punto 12), y con él el CLS de la criatura (punto 10).
5. **Prueba real de baja** con un correo propio. Es una acción manual tuya.

## Estado tras los arreglos (2026-11-10, rama `fix/a11y-review-2026-11-09`)

Comprobado en local con `a11y.mjs` y `measure.mjs` (O):
- axe: 0 fallos en home (390 y 1280 px), `/es/`, criatura, entrada y privacidad.
- Menú: focus va a "About", Tab se queda en el menú, Escape lo cierra y devuelve el foco al botón.
- Reduced motion: 0 animaciones en marcha.
- La newsletter queda a 15.858 px en móvil.

| # | Estado |
|---|---|
| 1. Menú con teclado | ✅ Foco al primer enlace, `inert` en el resto, Escape, `aria-label` y `aria-controls` |
| 2. Foco visible | ✅ `:focus-visible` de 2 px en la home y en la cabecera común (`site-chrome.mjs`, privacy, 404) |
| 3. Contraste | ✅ Enlace "Privacy", "Steam (soon)" (ahora sin opacidad y con borde discontinuo), primera fase del roadmap |
| 4. Reduced motion | ✅ `animation: none` dentro del `@media` existente |
| 5. `<main>` y enlace para saltar al contenido | ✅ en la home (en/es/it) |
| 6. `aria` y formulario | ✅ Fuera los `aria-label` sin rol; `aria-describedby` y `aria-invalid` en el email |
| 7. Newsletter en móvil | 🔄 `#trading` oculto en móvil: de 17.332 a 15.858 px. El recorte del roadmap queda pendiente |
| 8. Botón en español | ✅ "🌱 Juega gratis". El badge en móvil ya no menciona Steam |
| 9. Logo en la cabecera común | ✅ En una línea a 390 px |
| 10. CLS de la criatura | ✅ No se repite con la máquina libre: 0,054–0,062 en 3 pasadas. No se toca |
| 11. Objetivos del pie y de idioma | ✅ Unos 44 px de alto |
| 12. Rendimiento | Medido con la máquina libre: home 78–93, TBT 300–990 ms; criatura 99–100. Sin el script de Cloudflare: 80–86. El coste está en "Style & Layout" (1,4 s); nuevo pendiente |
| 13. `/bestiary` 307 | No se toca |
| 14. Resonancias | ✅ Enlace "How resonances work" → `/#systems` en cada criatura |

También arreglado: con el menú móvil abierto, "Get notified" se metía en la barra y partía el logo. Se quita del menú; el hero ya tiene ese botón.
