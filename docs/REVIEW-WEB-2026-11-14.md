# Revisión web: echoesofthegarden.com, 14 de noviembre de 2026

- Base: `main` ee7e36a (#29), revisada en local a 1280 y 390 px: portada, guía, capítulo, bestiario, ficha, dev log, entrada, privacidad.
- Lighthouse (laboratorio, pasado después con la máquina libre, carga 2,75 en 4 núcleos): rendimiento móvil/escritorio portada 97/100 (TBT 200 ms), /es/ 99/100, guía 100/100, ficha 100/100, entrada 97/100. Accesibilidad 100; buenas prácticas 81 y SEO 92 por las causas conocidas.
- Capturas: carpeta temporal, no están en el repo.

## ¿Parece IA?
No. Los textos no tienen las muletillas habituales (rayas largas fuera de los textos del juego, "→", "no es X, es Y", listas de tres "no"). Lo que quedaba eran fallos de acabado visual, como el que señaló José en el roadmap.

## Arreglado en este pase
1. **Dev log desordenado.** Dos entradas del mismo día (v0.14 y v0.15) salían en el orden del fichero: 0.14, 0.15, 0.13. Ahora se ordena por fecha y, a igual fecha, por versión (`scripts/build-devlog.mjs`).
2. **Halos desiguales.** En el roadmap y en el bestiario las criaturas de los ecosistemas futuros no tenían halo y las de lanzamiento sí: parecían de otra web. Ahora todas tienen el mismo.
3. **Bestiario en móvil.** Siete criaturas por ecosistema en filas de 3 dejaban una sola en la última fila. Ahora van 4 + 3.
4. **Privacidad y 404.** El pie quedaba pegado al texto; ahora tiene aire y una línea encima.
5. **Traducciones.** 37 frases que ya no salen en la web, quitadas de `i18n/es.json` e `it.json`.

## Pendiente
- ✅ Lighthouse con la máquina libre (ver cabecera).
- Revisión nativa de es/it cuando la web esté cerrada.
