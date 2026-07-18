# Orbit Down Website

Static GitHub Pages site for Orbit Down.

- Production domain: `https://orbitdown.zelnick.pw/`
- Support URL: `https://orbitdown.zelnick.pw/support/`
- Privacy Policy URL: `https://orbitdown.zelnick.pw/privacy/`
- Support contact: `https://github.com/Z3lnick/orbitdown/issues/new`

The `CNAME` file is included for branch-based GitHub Pages publishing. For a subdomain, GitHub Pages expects the DNS provider to point `orbitdown.zelnick.pw` at `Z3lnick.github.io` with a CNAME record.

## Production site

The homepage is a zero-build static launch site with:

- responsive desktop and mobile product staging;
- accessible, reduced-motion-aware scroll reveals;
- real iPhone, iPad, Mac, and widget product imagery;
- the 24-second HyperFrames product film at `assets/video/orbit-down-launch.mp4`;
- Open Graph, Twitter Card, canonical, manifest, and SoftwareApplication metadata;
- versioned CSS and JavaScript URLs to prevent stale deployment caches.

The editable HyperFrames source lives in `hyperframes/orbit-down-launch/`. Run its checks and rebuild the film with:

```sh
cd hyperframes/orbit-down-launch
npm run check
npm run render -- --output ../../assets/video/orbit-down-launch.mp4 --quality high --fps 30
```

Serve the site locally from this directory so root-relative support, privacy, icon, and manifest URLs resolve correctly:

```sh
python3 -m http.server 4173
```
