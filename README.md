# Orbit Down Website

Static GitHub Pages site for Orbit Down.

- Production domain: `https://orbitdown.zelnick.pw/`
- Support URL: `https://orbitdown.zelnick.pw/support/`
- Privacy Policy URL: `https://orbitdown.zelnick.pw/privacy/`
- App Store URL: `https://apps.apple.com/app/id6789743974`
- Support contact: `https://github.com/Z3lnick/orbitdown/issues/new`

The `CNAME` file is included for branch-based GitHub Pages publishing. For a subdomain, GitHub Pages expects the DNS provider to point `orbitdown.zelnick.pw` at `Z3lnick.github.io` with a CNAME record.

## Production site

The homepage is a zero-build animated experience with:

- a real WebGL ribbon sculpture, clock dial and orbital particles using locally vendored Three.js;
- Anime.js entry choreography, scroll-controlled moment-card assembly and widget transformations;
- pointer parallax, horizontal scene dragging, an accessible time scrubber and countdown selection;
- a gentle automatic moment tour with reading pauses, permanent manual control after interaction, and shared motion/accessibility safeguards;
- an interactive palette/type/atmosphere playground and curated Quick Add examples;
- single, upcoming and dashboard website widget previews;
- explicit motion pause, reduced-motion support, offscreen/background pausing, and a CSS fallback;
- dark and light themes, responsive layouts, locally served libraries, and the updated app icon;
- a clean native Mac window capture from the 2 October 2026 local app, with transparent corners and no Codex control overlay, separate from illustrative website demos;
- coordinated support and privacy colours, existing store links and metadata.

Sources: `index.html`, `orbit.css`, `orbit.js`. Shared help-page styles: `styles.css` and `document.css`. Shared help-page theme behaviour: `site.js`. Library versions and licenses: `assets/vendor/`.

The site remains static GitHub Pages compatible. No Node runtime, build step, analytics, or external animation service is required. JavaScript-free visitors still get the complete story, a static scene, privacy/support links and store downloads. Interactive previews do not create countdowns or install widgets.

The editable 24-second HyperFrames product-film source lives in `hyperframes/orbit-down-launch/`. Its final render is intentionally kept separate from the website release until the visual preview is approved. After approval, run its checks and rebuild the film with:

```sh
cd hyperframes/orbit-down-launch
npm run check
npm run render -- --output ../../assets/video/orbit-down-launch.mp4 --quality high --fps 30
```

Serve the site locally from this directory so root-relative support, privacy, icon, and manifest URLs resolve correctly:

```sh
python3 -m http.server 4173
```
