# Revisión web: echoesofthegarden.com, 12 de noviembre de 2026

- **Commit en producción:** `eabebee` (main, Workers Builds). Comprobado: `/guide/` y los cinco capítulos responden 200 en los tres idiomas.
- **Páginas revisadas:** portada (en/es/it), guía (índice + capítulos), bestiario, ficha (moss-lizard), dev log, privacidad y 404. Anchos: 1280, 900 y 390 px.
- **Herramientas:**
  - Lighthouse local (laboratorio). No hay datos de campo, porque la web es nueva.
  - axe y el recorrido con teclado del script `a11y`, y `measure.mjs`.
  - Una revisión de textos en los tres idiomas hecha por un agente aparte, sin ver mi opinión. Sus afirmaciones principales las he comprobado contra `strings.csv` y el código del juego.
- **Capturas:** se hicieron en una carpeta temporal y no están en el repo.
- **Estado (2026-11-14):** todos los puntos aplicados en los PR #22, #23 y #25.
- **Etiquetas:** (O) observado en la web publicada · (H) heurística o convención · (D) documento o código.
- **Esfuerzo:** S < 1 h · M medio día · L más.

## ¿Sigue pareciendo IA?

**Mucho menos.** El arranque de la portada es lo que más se aleja de una plantilla: la vida de Hollowroot, su muerte con los textos reales del juego y el Libro de Ecos como registro (O). Lo mismo vale para la guía, el dev log y el 404, que suenan a una persona (O).

Lo que todavía delata una plantilla está concentrado en la segunda mitad de la portada:
1. **Misma estructura en cada sección.** Todas son título + frase gris + contenido, con el mismo espacio entre ellas: "How the garden grows", "Two ecosystems…", "Who lives there", "Where the game is now" (O). Es el ritmo de las landings generadas (H, frontend-design).
2. **La misma frase hecha con plantilla dos veces.** "Each one has its own creatures, its own pace and its own materials" y, una sección más abajo, "Each species has its own lifespan, its own yield and its own last words" (O).
3. **Frases solemnes y en tres tiempos:**
   - "Two more forms exist. No seed sells them. They are learned."
   - "Dates are targets, not promises." (estructura de "X, no Y")
   - "Nothing stops this and nothing reverses it." (guía, capítulo 1) (O)
4. **Restos de cromo de plantilla:**
   - La línea de tiempo de 5 puntos del roadmap.
   - Los metadatos unidos con punto medio ("5 November 2026 · Build v0.12.1").
   - La rejilla de 3 columnas del dev log.
   Por separado son aceptables; juntos, al final de la página, recuerdan a una plantilla (O+H).

## Lighthouse (laboratorio)

Esta pasada **no sirve para medir rendimiento**: la carga de la máquina estaba entre 19 y 22 en 4 núcleos. La guía pesa 90 KB, casi sin JS, y aun así marca un TBT de 5,3 s (O). La anterior medición con la máquina libre dio 99–100 en rendimiento.

| Página | Accesibilidad | Buenas prácticas | SEO | Peso |
|---|---|---|---|---|
| Portada | 100 | 81 | 92 | 298 KB |
| /es/ | 100 | 81 | 92 | 298 KB |
| /guide/ | 100 | 81 | 92 | 90 KB |
| Ficha | 100 | 81 | 92 | 145 KB |

El 81 y el 92 se deben a dos decisiones tuyas que ya conocíamos. No son errores nuevos:
- **Buenas prácticas 81:** 3 avisos de API obsoleta, todos de `/cdn-cgi/challenge-platform/` (Cloudflare JS Detections, que decidiste mantener).
- **SEO 92:** Lighthouse no reconoce la línea `Content-Signal: search=yes,ai-train=no,use=reference` de `robots.txt`. Es la que pusimos para que la IA pueda recomendar la web sin entrenar con ella. Google ignora las directivas que no conoce (H).

## Lista priorizada

### 1. [S] (O+D) La portada dice dos cosas del juego que no son exactas
- **Renacimiento:** la portada (#death) dice que la Semilla heredada lleva "one new mutation". En el juego, la mutación es una probabilidad (`base_mutation_chance`, `drop_factory.gd:171`), y la guía dice "can add a mutation".
- **Reliquia:** la portada dice "gives its home ecosystem a lasting bonus". En el juego solo da la bonificación **una reliquia activa por jardín** (`relic_slots.gd`), como explica la guía.

**Propuesta:**
- "An Inherited Seed that carries its lineage, sometimes with a new mutation. The line goes on."
- "A Relic that keeps its name and its epitaph. One per garden strengthens the whole garden."

### 2. [M] (O+D) La web llama "resonancia" a lo que el juego llama "afinidad"
El juego dice "Affinity", "Affinity Wheel", "Afinidad", "Rueda de afinidad", "Affinità" (`strings.csv`). La palabra "resonance" no aparece como sustantivo en ninguna cadena del juego. La web usa "resonance" en:
- la portada;
- la guía, cuyo capítulo 3 dice "resonance" y "Affinity Wheel" en el mismo párrafo;
- las 28 fichas, en la línea "… resonance".

**Propuesta:** cambiar a affinity / afinidad / affinità en las plantillas (`index.html`, `scripts/build-bestiary.mjs`, `scripts/build-guide.mjs`) y en sus traducciones. Si "resonancia" es una elección de marketing, apúntala en `design-intent.md`.

### 3. [S] (O+D) Las fichas en es/it no usan los textos del juego
- La web dice "Vida duradera · Producción modesta" y "Vita duratura".
- El juego dice "Vida larga", "Rendimiento modesto" y "Vita lunga", "Resa modesta".
- Igual con el Altar: el juego dice "Altar" / "Altare"; la web, "Altar de Semillas" / "Altare dei Semi".

**Propuesta:** copiar los valores exactos de `strings.csv` en `i18n/es.json` e `i18n/it.json`.

### 4. [S] (O+D) La newsletter promete una "Founder's Seed" que aún no está decidida
- La portada y privacidad dicen "a Founder's Seed at release".
- `design-intent.md` no la incluye entre las promesas.
- El juego la tiene pendiente: en `session-notes.md:107` queda por decidir qué es, cómo se canjea y quién la recibe.

**Propuesta:** quitarla hasta decidirla, o añadirla a "Promises" del intent con lo que sea. Tiene que estar resuelta antes de que se apunte gente con esa expectativa.

### 5. [S] (O) En móvil, las páginas interiores no tienen menú
Por debajo de 760 px, `.site-nav` está oculto (`assets/site.css:41`). La cabecera muestra solo el logo y "Play free" (`shots/chapter_390.png`). Para ir de un capítulo de la guía al bestiario hay que bajar hasta el pie. La portada sí tiene el botón "Menu".

**Propuesta:** la opción mínima es mostrar los tres enlaces en una segunda línea bajo el logo en móvil (flex-wrap, 17 px, `padding: 10px 0`). La alternativa es reutilizar el botón "Menu" de la portada.

### 6. [M] (O+H) La segunda mitad de la portada repite el mismo molde
Afecta a las secciones #systems, #ecosystems, #bestiary y #roadmap.

**Propuesta, quitando antes que añadiendo:**
- Eliminar la frase gris bajo "Two ecosystems…" y bajo "Who lives there". Ya las dicen las tarjetas y el subtítulo de cada jardín.
- Reescribir las frases solemnes: "Two more forms can't be bought. You learn them by playing." y "Dates are targets."
- Fundir "From the dev log" en una lista simple de enlaces (fecha + título), sin rejilla de 3 columnas ni "· Build".

### 7. [M] (O) En móvil, el formulario de la newsletter sigue lejos
Está a 11.051 px desde arriba en una página de 11.846 px. Ha mejorado: el 9 de noviembre estaba a 17.332 px. El roadmap ocupa 1.955 px en móvil.

**Propuesta:** en móvil, dejar solo el paso "Now" del roadmap y un enlace "Full roadmap". Al recortar el punto 6 se gana algo más.

### 8. [S] (O) Textos sueltos en es/it

| Texto actual | Problema | Propuesta |
|---|---|---|
| es «cuatro frases raras» (título del dev log) | Se lee como "frases extrañas" | «cuatro últimas palabras poco comunes» |
| en "four rare lines" (mismo título) | En el juego "line" es linaje | "four rare last words" |
| it «Una cattura dal gioco» | Calco de "capture" | «Uno screenshot dal gioco» |
| es «coleccionista de criaturas idle» | Un coleccionista es una persona | «juego idle de colección de criaturas» |
| it «Sappi quando arriva su Steam» | Suena rígido | «Ti avvisiamo quando arriva su Steam» (necesita nativo) |
| Hollowroot en italiano | Cambia de género en la misma sección | Unificar |
| `og:image:alt` y `aria-label="Language"` en es/it | Siguen en inglés | Traducirlos |

### 9. [S] (O) Un hueco grande bajo el hero de escritorio
Quedan unos 200 px vacíos entre los botones y "Hollowroot lived fourteen hours" a 1280 px (`shots/home-full-1280_0.png`).

**Propuesta:** reducir el padding inferior de `#hero` a la mitad.

## Revisión anterior (9 de noviembre)

- **Arreglados (O):**
  - 1–6: menú móvil con teclado, foco visible, contraste, reduced motion, `<main>`, formulario. axe da 0 errores y el recorrido con teclado sale limpio.
  - 8, 9 y 11: botón en español, logo y tamaño de los objetivos táctiles. No queda ningún objetivo por debajo de 44 px.
  - 10: CLS de 0,004 o menos.
  - 14: la línea de la ficha ahora enlaza a "How resonances work".
- **Mejorado, sigue abierto:** 7, la newsletter en móvil (punto 7 de arriba).
- **Arreglado (O):** 13, `/bestiary` y `/guide` sin barra final responden ahora 308.
- **Sin medir:** 12, rendimiento (máquina cargada otra vez).

## Lo que ya está bien (no tocar)

- **Accesibilidad:** no hay texto por debajo de 12 px ni objetivos por debajo de 44 px. Hay `<main>` en todas las plantillas. El menú móvil funciona con Enter, Tab y Escape, y respeta reduced motion. No hay scroll horizontal a 320 px (O).
- **Portada:** el hero tiene una imagen real del juego y la llamada principal visible en la primera pantalla, a 1280 y a 390 px (O).
- **Textos del juego:** los de la ceremonia de muerte coinciden exactamente con el juego (O+D).
- **Peso:** 298 KB en la portada y 90 KB en la guía, dentro de los presupuestos (O).
- **Promesas:** el Mercado aparece siempre en futuro y como condicional, y la parte de dos ecosistemas al lanzamiento sigue el plan de Steam (O+D).

## Top 5

1. Puntos 1 y 3: corregir las afirmaciones de la portada y los términos del juego en es/it (S).
2. Punto 4: decidir o quitar la Founder's Seed (S, decisión tuya).
3. Punto 5: menú en móvil en las páginas interiores (S).
4. Punto 2: "afinidad" en vez de "resonancia" (M, decisión tuya).
5. Puntos 6 y 7: recortar la segunda mitad de la portada. Es lo que más reduce la sensación de plantilla y acerca la newsletter en móvil (M).
