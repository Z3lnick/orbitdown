# Vendored animation libraries

Served locally so the site does not depend on a runtime CDN or transmit requests to one.

- Three.js 0.186.1: `three.module.min.js`, `three.core.min.js`, MIT. Obtained from the npm package via jsDelivr. The two relative core imports in the minified module are changed from `./three.core.js` to `./three.core.min.js` to match the local minified file. License: `THREE-LICENSE.txt`.
- Anime.js 4.5.0: `anime.esm.min.js`, MIT. Official npm ESM bundle via jsDelivr. License: `ANIME-LICENSE.md`.

The hero dynamically imports Three.js after the semantic page and controls initialise. The WebGL fallback remains available if it cannot load or the device cannot render WebGL.
