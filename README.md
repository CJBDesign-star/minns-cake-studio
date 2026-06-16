# Minns Cake Studio — The Buttercream Bar

A custom, cinematic single-page website for the mobile live cake-artistry cart and
custom cake studio serving Ventura, Los Angeles & Santa Barbara Counties. Rebuilt
from the original Tilda site into a fast, fully-controlled static site.

## Stack
- **Static HTML/CSS/JS** — no build step, deploy anywhere (Netlify, Vercel, Cloudflare Pages, any static host).
- **GSAP + ScrollTrigger** — scroll-driven motion (alternating experience steps, parallax, reveals).
- **Lenis** — smooth momentum scrolling.

## Structure
```
index.html              # all markup (single page) + LocalBusiness JSON-LD
assets/css/styles.css   # editorial-luxury design system (ivory / champagne / espresso)
assets/js/main.js       # motion layer + interactions (tabs, FAQ, mobile menu, quote form)
assets/img/             # brand logo, photography, OG image
```

## Design system
- Type: **Playfair Display** (display) · **Cormorant Garamond** (italic accents) · **Inter** (body) · **Pinyon Script** (flourish).
- Palette: warm ivory `#FAF6F0`, champagne `#E4D2B8`, gold `#B68A52`, espresso `#2B2521`.
- Respects `prefers-reduced-motion`; responsive at 375 / 768 / 1024 / 1440.

## Before launch — TODO
- **Quote form:** add your free Web3Forms access key in `index.html` (`name="access_key"`) so submissions deliver. Until then the form shows a "not connected yet" notice.
- **Domain:** the OG/canonical/schema URLs assume `https://minnscakestudio.com/` — update if the final domain differs.
- **Analytics:** drop in a Plausible or GA4 snippet before `</head>`.

## Local preview
```bash
python -m http.server 8741        # then open http://localhost:8741
```

## Links wired in
- Consultation call: `https://minns.hbportal.co/schedule/69ddcb330fa94300429c0383`
- Instagram: `https://www.instagram.com/thebuttercreambar_/`
