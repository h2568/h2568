# CLAUDE.md — Vantor Crew Ltd / Harry Gagen

> This file is the permanent AI context brain for this repository.
> Any AI agent or coding assistant (Claude Code, GitHub Copilot, etc.) should read this entire file before touching any code.

---

## 1. WHO THIS IS FOR

**Harry Gagen** — Freelance Crew Manager, Scenic Supervisor, and founder of **Vantor Crew Ltd**.

- **Company:** Vantor Crew Ltd — professional event crewing across London, Manchester, and Liverpool
- **Website:** [www.vantorcrewltd.co.uk](https://www.vantorcrewltd.co.uk)
- **Email:** harry@vantorltd.com
- **Phone:** +44 (0)7799 534291
- **Personal email:** harrygagen4@gmail.com
- **GitHub:** h2568/h2568
- **LinkedIn:** linkedin.com/in/harry-gagen-a15ab32a9

---

## 2. PROJECT OVERVIEW

This repo contains the **production website for Vantor Crew Ltd** — a dark-industrial, professionally designed static site built with HTML, CSS, and vanilla JavaScript.

### Stack
- **HTML** — `index.html` (single-page structure)
- **CSS** — `styles.css` (custom properties, no framework)
- **JavaScript** — `main.js` (vanilla JS, no build step, no bundler)
- **Fonts** — Google Fonts: `Barlow Condensed` (headings), supporting sans for body
- **No frameworks. No npm. No build pipeline.** Everything must work by opening `index.html` in a browser.

### Key Features Already Built
- Scroll reveal animations
- Sticky header with scroll-triggered style change
- Mobile hamburger navigation
- Contact form with client-side validation
- Dark industrial design with electric blue (`#007AFF` or equivalent) accent

---

## 3. BRAND & DESIGN RULES

These are **non-negotiable**. Do not deviate without explicit instruction.

### Colour Palette
| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0a0a0a` | Page background |
| `--color-surface` | `#111111` | Card / section backgrounds |
| `--color-border` | `#1e1e1e` | Subtle borders |
| `--color-accent` | `#007AFF` | Electric blue — CTAs, highlights, hover states |
| `--color-text` | `#e8e8e8` | Primary body text |
| `--color-muted` | `#888888` | Secondary / meta text |

### Typography
- **Headings:** `Barlow Condensed`, bold/semi-bold, uppercase where impactful
- **Body:** Clean sans-serif, comfortable line-height (~1.6)
- **No decorative or serif fonts**

### Tone of Voice
- **Professional, direct, confident** — not corporate waffle
- **Short sentences.** Action-oriented copy.
- **Industry-specific language** is fine (crew, scenic, supervisor, rigger, get-in, get-out, etc.)
- Never use: "passionate about", "synergy", "leverage", "innovative solutions"

### Logo / Name
- Always: **Vantor Crew Ltd** (not "Vantor", not "VANTOR CREW")
- Tagline direction: operational excellence, trusted crew, UK-wide

---

## 4. OUTSTANDING ITEMS (PRIORITY ORDER)

These are the known TODOs for this project. Work on them in this order unless instructed otherwise:

1. **Real photography** — Replace all placeholder images with actual event/crew photos. Format: landscape, high contrast, dark-toned preferred. Use `<img>` with descriptive `alt` text.
2. **Contact form backend** — The form currently validates client-side only. Needs a working submission endpoint. Options in order of preference: (a) Netlify Forms (add `netlify` attribute), (b) Formspree, (c) EmailJS. Do not add server-side code unless specifically asked.
3. **Company registration number** — Add to footer once confirmed. Format: `Company No. XXXXXXXX`
4. **SEO meta tags** — Add `<meta name="description">`, Open Graph tags, and structured data (LocalBusiness schema) to `<head>`
5. **Performance pass** — Lazy-load images, minify CSS/JS for production, add `loading="lazy"` to all `<img>`
6. **Cookie/privacy notice** — Simple banner, no third-party libraries

---

## 5. HARRY'S EVENT CREDITS (USE IN COPY IF NEEDED)

These are verified credits — use them verbatim in any bio, about section, or pitch copy.

### National — Crew Manager / Scenic Supervisor
Winter Wonderland 2025 · BBC Radio 2 2025 · BBC Radio 1 Big Weekend 2016–2018 & 2025 · Boomtown · Creamfields · Lost Village · El Dorado · MLB London · TikTok 2022–2025 · Circus Liverpool 2015–2025 · Glastonbury & Boomtown 2019–2022

### International — Scenic Supervisor / Crew Boss / Site Manager
Paris Olympics (ES Global) 2024 · Qatar AFC Asian Games Opening & Closing Ceremonies 2023 · Tomorrowland Belgium 2019 · WWE Royal Rumble Riyadh · Abu Dhabi Grand Prix · MDL Beast Festival Saudi Arabia 2018

### Television — Set Management
Eurovision 2023 · A League of Their Own · Britain's Got Talent · Dancing on Ice · Interior Design Masters · Royal Carols: Together at Christmas · Leicester Square Film Premieres · BAFTAs 2021–2024

### Corporate & Touring — Lead Scenic Supervisor
Goodwood Festival of Speed with Ferrari 2025 · Formula E London 2023 & 2025 · Aston Martin 2022 · Rolex 2021 · Ferrari 2020 · London Fashion Week (Gucci, Prada, Burberry) 2021 & 2022

### Certifications
IPAF 3A & 3B · Forklift/Telehandler · Working at Heights · Site & Crew Management

---

## 6. CODE CONVENTIONS

### General
- **Indent:** 2 spaces (no tabs)
- **Quotes:** double quotes in HTML attributes, single quotes in JS
- **No trailing whitespace**
- **Comments:** use sparingly, only for non-obvious logic

### CSS
- Use **CSS custom properties** (`--variable-name`) for all colours and repeated values
- Mobile-first: base styles for mobile, `@media (min-width: 768px)` for desktop
- BEM-lite naming: `.section-hero`, `.card__title`, `.btn--primary`
- No `!important` unless absolutely unavoidable
- Group properties: positioning → box model → typography → visual → animation

### JavaScript
- **Vanilla JS only** — no jQuery, no lodash, no external dependencies unless explicitly approved
- Use `const` / `let`, never `var`
- Use `addEventListener`, never inline `onclick`
- Wrap in `DOMContentLoaded` or defer script loading
- Always `null`-check DOM elements before operating on them: `if (!el) return;`

### HTML
- Semantic elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>`
- Every `<img>` must have a descriptive `alt` attribute
- Every form input must have an associated `<label>`
- `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1.0">` in every `<head>`

---

## 7. KNOWN BUGS & PITFALLS — READ BEFORE TOUCHING CSS/HTML

These bugs have already been identified and fixed. **Do not reintroduce them.**

### ⚠️ iOS Safari Font-Family String Escaping
- CSS `font-family` values containing apostrophes in font names (e.g. `'Barlow Condensed'`) must use **double quotes inside CSS strings** or be written without quotes if the name has no spaces conflict
- Malformed font-family declarations cause iOS Safari to silently fail and render a blank white page
- Always test: `font-family: 'Barlow Condensed', sans-serif;` — single quotes around the full name, no nested quotes

### ⚠️ Duplicate HTML Body
- There was previously a duplicated `<body>` tag in `index.html` causing rendering issues
- Always ensure there is exactly **one `<html>`, one `<head>`, one `<body>`** in the document
- If in doubt, run the file through an HTML validator before committing

### ⚠️ Mobile Nav Z-Index
- The mobile hamburger nav must have a higher `z-index` than all page content
- Sticky header: `z-index: 100` minimum
- Mobile nav overlay: `z-index: 200` minimum

---

## 8. FILE STRUCTURE

```
/
├── index.html          # Single-page site — all sections live here
├── styles.css          # All styles — do not split unless explicitly asked
├── main.js             # All JS — do not split unless explicitly asked
├── /images/            # All site imagery (to be populated with real photos)
│   ├── hero.jpg
│   ├── about.jpg
│   └── ...
├── CLAUDE.md           # This file — AI agent context
└── README.md           # Human-readable project overview
```

---

## 9. WHAT NOT TO DO

- **Do not introduce npm, webpack, Vite, or any build tool** unless Harry explicitly asks
- **Do not add CSS frameworks** (Bootstrap, Tailwind, etc.) — the design system is already established
- **Do not use jQuery** or any JS library without approval
- **Do not change the colour palette or typography** without explicit instruction
- **Do not add placeholder/lorem ipsum copy** — if real copy is needed, ask Harry or leave a `<!-- TODO: copy needed -->` comment
- **Do not commit API keys, tokens, or credentials** under any circumstances
- **Do not restructure the file layout** without asking first
- **Do not make the site lighter/brighter** — the dark industrial aesthetic is intentional and important to the brand

---

## 10. WHEN IN DOUBT

1. Check this file first
2. Preserve the existing design system
3. Ask Harry before making structural changes
4. Make the smallest possible change that solves the problem
5. Test on mobile (especially iOS Safari) before considering anything done

---

*Last updated: April 2026 | Maintained by Harry Gagen / h2568*
