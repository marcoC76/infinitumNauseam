# infinitumNauseam

Blog de relatos de terror, misterio y ciencia ficción. Construido con Jekyll + GitHub Pages.

## Cómo agregar un nuevo relato

1. Creá un archivo `.md` en `_posts/` con el formato: `AAAA-MM-DD-titulo-del-relato.md`
2. Incluí al inicio del archivo:
   ```yaml
   ---
   title: "Título del relato"
   date: AAAA-MM-DD
   categories: [terror, ciencia ficcion]
   reading_time: 8
   ---
   ```
3. Escribí el cuento en Markdown debajo del front matter.
4. Hacé commit y push a `main`. GitHub Actions lo publica automáticamente.

## URL

https://marcoc76.github.io/infinitumNauseam

## Tecnologías

- Jekyll 4.3
- GitHub Actions + GitHub Pages
- CSS puro (estilo terminal oscura)
- JavaScript vanilla (animaciones typewriter + glitch)
