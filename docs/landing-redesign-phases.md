# Landing Page Redesign — Phase Plan

**Status (2026-07-15):** Phases 1–2 done and pushed to `main`. Phase 3
(section pass) not started. Next agent should pick up there.

**Commit log for this effort:**
- `8c721fa` — Phase 1: tokens (palette + Fraunces/Inter typography)
- `6208361` — Phase 2: cinematic hero rebuild (custom video, glass nav, serif headline)

Design reference: visual quality/UX of jrmhd.tech (cinematic hero, premium
enterprise aesthetic, glassmorphism, elegant typography, generous whitespace).
No branding, copy, colors, images, or layout are copied from that site — it is
used only as a quality/style bar. This doc exists so any agent picking up the
work mid-stream has full context without re-deriving the plan.

## Design system (locked in Phase 1)

- **Palette** (`frontend/tailwind.config.ts`, `ct.*` tokens — shared by every
  marketing page, not just `/`):
  - `ct-paper` `#f6f3ec` — warm ivory (light sections)
  - `ct-graphite` `#0b0e14` — ink (dark sections)
  - `ct-steel` `#11151f`, `ct-slate` `#1b2130` — dark panel variants
  - `ct-blue` `#3454d1` / `ct-blueDeep` `#1e3690` — primary cobalt accent (CTAs, links)
  - `ct-ice` `#c9a567` — repurposed to a muted champagne/gold, the secondary
    accent that gives the two-tone "sophisticated color hierarchy" the brief
    asked for. Same token name, new value — every section that already
    referenced `ct-ice` picked up the new color for free.
- **Type**: `font-display` = Fraunces (variable serif, opsz/soft/wonk axes) for
  headlines only. `font-body` / `font-inter` = Inter for body copy and UI
  chrome. `font-mono` = IBM Plex Mono for eyebrows/labels/data. Set in
  `frontend/src/app/layout.tsx` + `tailwind.config.ts`.
- Rationale: swapping tokens instead of hardcoded colors in each section
  means the whole marketing site (about, services, portfolio, blog, docs,
  help-center, contact, privacy, terms) re-themes consistently without
  touching those files.

## Phases

- [x] **Phase 1 — Tokens.** Palette + typography swap.
- [x] **Phase 2 — Hero.** Rebuilt `landing-page.tsx` hero: cinematic
  full-bleed video background (local asset `public/videos/hero-workforce.mp4`,
  compressed from a 4K source to 1080p/~1.3Mbps h264 for web delivery, with
  `hero-poster.jpg` as the paint-before-load poster), floating glass pill nav,
  oversized Fraunces serif headline with a single italic gold accent phrase,
  refined pill buttons, and a signature glass "workforce pulse" card with one
  small floating accent chip (intentionally singular — the old hero had two
  overlapping panels, which read as cluttered).
- [ ] **Phase 3 — Section pass.** Reduce the repeated "dark card with
  border-white/10 mockup" pattern across `why-choose`, `platform-overview`,
  and `security` so each reads as distinct rather than templated; refresh
  `core-features` card numerals (serif + gold instead of blue gradient
  badge); refine `testimonials` (serif quote glyph), `faq`, `final-cta`,
  `trusted-companies`, `site-footer` spacing/type to match the new tokens.
- [ ] **Phase 4 — QA.** `pnpm typecheck` + `pnpm build` in `frontend/`,
  responsive check (mobile/tablet/desktop), reduced-motion check, visual
  screenshot pass.

## Notes for the next agent

- `next/font/google` Fraunces must use `weight: "variable"` when `axes` is
  set — combining a fixed weight array with axes throws a build error.
  Control weight per-element with normal Tailwind `font-*` utilities; the
  variable font interpolates.
- Google Fonts CSS couldn't be fetched in the sandbox used to build this
  (network allowlist doesn't include `fonts.googleapis.com`) — `tsc --noEmit`
  passes clean, but `next build` needs to be re-verified once deployed
  somewhere with open internet (Vercel/Cloudflare/CI).
- Don't touch `ink` / `surface` / `line` / `brand.*` tokens — those are used
  by the authenticated app shell (dashboard etc.), out of scope here.
- Keep `.ct-cut` / `.ct-cut-sm` clip-path motif — it's the brand's diagonal-cut
  signature (echoes the logo), don't replace with plain rounded corners.
- No stock photography is used (licensing risk for a client deliverable);
  the hero uses a user-supplied video (compressed 4K→1080p) instead, and the
  "professional photography" feel elsewhere is carried by the glass
  dashboard mockups.
