# WebBlitz — Night Market

A new design direction for the WebBlitz marketing site: one-page websites for Sri Lankan small businesses, presented as a *pola* — an evening market where 40 lantern-lit stalls each show a different kind of business.

This is a static, backend-free site. Enquiries go to WhatsApp. There are no forms, accounts, payments, analytics or tracking.

## The concept

- **Palette:** deep indigo night, lantern amber, ember, hibiscus pink and betel-leaf green, with cream "daylight" sections for comfortable reading.
- **Type:** Bricolage Grotesque (display, optical sizing) and Instrument Sans (text), with Noto Sans Sinhala and Noto Sans Tamil for their scripts.
- **Story:** night market (hero, collection) → morning (how it works, what's included) → evening again (pricing) → sunrise (the final call to action).

### Motion inventory

| Where | Effect |
| --- | --- |
| Whole page | Background drifts between night and daylight as sections take the stage; top scroll-progress line; film grain; soft cursor light on desktop |
| Hero | WebGL dusk-aurora shader; floating lanterns with pointer parallax; word-by-word headline rise; fanned browser frames that spread and tilt as you scroll |
| Marquee | Two tilted category ribbons that speed up and skew with scroll velocity |
| Collection | Desktop: pinned horizontal ride through 12 highlights with 3D card depth. Phones: native swipe with snap. Pointer tilt and glare on cards |
| How it works | Desktop: a sticky phone assembles a site as each step scrolls past, with a filling progress line. Phones: the phone cycles its stages while visible |
| What's included | Staggered bento reveal; decorative counters for the content limits |
| Pricing | Ticket with a rotating conic-gradient border, glow and pointer tilt |
| FAQ | Native `<details>` accordion with animated height where supported |
| Finale | A sun that rises and fills the screen as you arrive, with slow rays |
| Footer | Outlined wordmark that fills with colour as you reach it |

Headings animate **whole words**, never individual letters, so Sinhala and Tamil shaping is untouched.

### Motion safety

- Native scrolling throughout. The only pinned section is the collection rail on desktop, and it holds content, not a loading gate.
- One visible **Pause motion** control stops decorative loops (aurora, lanterns, marquee, grain, gradients, phone cycling) and is remembered for the session.
- `prefers-reduced-motion` is respected, including changes during a visit. Scroll-linked transforms are removed and content stays in place.
- The aurora and phone cycling stop when offscreen or when the tab is hidden.
- Nothing depends on JavaScript to be readable: without it, every section, all 40 designs, prices and WhatsApp links are present. A 3-second fail-safe reveals the hero if the script fails to start.

## Stack

- [Astro](https://astro.build) 7 with static output, TypeScript and hand-written CSS (no CSS framework).
- [GSAP](https://gsap.com) 3 + ScrollTrigger for scroll choreography (≈49KB gzip including site code).
- A hand-written WebGL fragment shader for the aurora (no 3D library).
- Fontsource packages for self-hosted fonts.

Node **22.22.3** (`.nvmrc`) and npm 10.9.8.

```bash
npm ci
npm run dev            # local development
npm run build          # static output in dist/
npm run verify         # i18n + typecheck + build + asset budget + Chromium/WebKit tests
```

Configuration (build time, optional):

| Variable | Default | Purpose |
| --- | --- | --- |
| `SITE_URL` | `https://serendib.tech` | Canonical and alternate-language URLs, social images |
| `LEGAL_BASE_URL` | `https://serendib.tech` | Where the full Terms and Privacy notices live |

## Pages

| Route | Page |
| --- | --- |
| `/`, `/en/`, `/ta/` | Home in Sinhala (default), English, Tamil |
| `/designs/`, `/en/designs/`, `/ta/designs/` | All 40 designs with search and business-type filters (URL-synced) |
| `/404.html` | Not found |

## Content and provenance

- **Copy:** 268 keys (`src/i18n/*.json`), derived from the WebBlitz V2 marketing catalogue in `0-WebBlitz-V2` at commit `4f15e14` (`src/i18n/webblitz/`). Keys this site doesn't render have been removed, and the English, Sinhala and Tamil copy has since been rewritten to read naturally (#1, #2). The Sinhala and Tamil texts are agent-drafted and **still need native-speaker review** before publication.
- **Offer facts:** `src/data/site.ts` mirrors the standard offer (contract `web-blitz-v2-2026-07-30`): LKR 22,000 base, one page in one language, 3 working days from the day everything is ready, 12 months hosting, optional LKR 2,500 renewal, one correction round within 48 hours, and the five language add-on packages. The expired campaign price is not used.
- **Demos:** 40 supplied concepts with exact IDs and URLs (`src/data/demos.ts`). They are fictional, open in English, and are labelled that way.
- **Previews:** recaptured from the live demos on 23 September 2026 with `scripts/capture-previews.mjs` (log in `public/previews/capture-log.json`). Many still show the demos' former attribution; the demo owner is rebranding them. Six demos currently show a blank first screen or an error page (Ink & Fold, Bay Signal, Clay Loop, Table Parliament, Cutback Studio, Swap Courtyard). They get a designed cover with a "preview unavailable" note until their owner fixes them.
- **Legal:** Terms and Privacy link to the existing WebBlitz application at `LEGAL_BASE_URL/terms/` and `/privacy/` from every locale, because the application serves no locale-prefixed notices. This repository does not reproduce them.

## Checks

- `npm run check:i18n`: identical keys, placeholder parity, 40 names and descriptions, target script in Sinhala and Tamil, and no keys left unused by `src/`.
- `npm run check:budget`: gzip limits of 60KB largest JS, 16KB largest CSS, 24KB largest HTML.
- `npm run test:e2e`: Chromium and WebKit. Covers every locale, 320–1440px overflow, facts, WhatsApp and legal links, alternates, hero entrance, theme morph and current-section navigation, pause/resume, reduced motion, the catalogue filters and exact demo links, language switching, the mobile menu and no-JavaScript output.

CI (`.github/workflows/verify.yml`) runs `npm run verify` on every pull request and push to `main`.

Not yet done: physical Android/iPhone checks, native-language review, a screen-reader pass and field performance measurement.
