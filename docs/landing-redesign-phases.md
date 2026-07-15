# Landing Page Redesign — Phase Plan

**Status (2026-07-15):** Phases 1–4 done to the extent verifiable in a
sandbox with no internet access to Google Fonts. `next build` still needs
to be run once on a machine with open internet before deploying (see
Phase 4 notes below).

**Commit log for this effort:**
- `8c721fa` — Phase 1: tokens (palette + Fraunces/Inter typography)
- `6208361` — Phase 2: cinematic hero rebuild (custom video, glass nav, serif headline)
- `2862633` — doc: status header + commit log
- `9a96d4d` — Phase 3: section pass
- `bca12d0` — doc: Phase 3 commit hash
- *(pending)* — Phase 4: reduced-motion fix + QA pass

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
- [x] **Phase 3 — Section pass.**
  - Fixed a real contrast bug: `testimonials` had white text (`text-white/85`)
    sitting directly on the light `ct-paper` page background (no dark section
    bg was ever set) — nearly illegible. Moved it onto `bg-ct-graphite` where
    the `glass-panel` styling was actually designed to sit, and it now reads
    as the intended dark, glassy section plus improves light/dark rhythm.
  - De-duplicated the identical "3-dot window chrome" mock header that
    appeared identically in `why-choose`, `platform-overview`, and the hero
    card. Hero keeps it (it's the primary signature element); `why-choose`
    now shows a live-count pill; `platform-overview` shows an animated
    pulse + "Synced" label instead (needed `"use client"` + framer-motion
    import, since it's a functional component using `motion.span`).
  - `core-features` numbered badges switched from a blue→gold gradient
    circle to bare serif gold numerals (`font-display text-ct-ice`),
    consistent with the "serif numerals as signature" idea from Phase 2.
  - `testimonials` cards got a large serif opening-quote glyph in gold as
    their signature element, replacing the plain `“…”` inline quote marks.
  - `how-it-works`, `faq`, `security`, `core-features`, `trusted-companies`
    all standardized on the same eyebrow pattern (thin rule + wide-tracked
    mono label) and `font-medium` display headings instead of `font-bold`,
    matching the hero's lighter, more editorial weight.
  - Verified with `tsc --noEmit` and `eslint` on `src/components/landing` —
    both clean.
- [x] **Phase 4 — QA (partial, sandbox-limited).**
  - Found and fixed one real accessibility gap: `platform-overview`'s new
    "Synced" pulse dot (added in Phase 3) animated unconditionally — didn't
    check `useReducedMotion()` like every other `motion.*` element in the
    landing page does. Fixed: component is now `"use client"` with the same
    `shouldReduceMotion ? undefined : {...}` guard used in the hero.
  - Verified clean: `tsc --noEmit` and `eslint .` across the **whole**
    frontend (not just `landing/`).
  - Verified by code review: every other `motion.*` usage in
    `landing-page.tsx` already respects `useReducedMotion`; hero uses
    `min-h-[100svh]` (not `min-h-screen`, which jumps on mobile browser
    chrome show/hide); headline scales `52px → 6xl → 76px` across
    breakpoints; global `globals.css` has a `prefers-reduced-motion` CSS
    fallback for anything not driven by framer-motion.
  - **Not verifiable here:** an actual `next build` and a rendered visual/
    responsive pass. This sandbox's network allowlist doesn't include
    `fonts.googleapis.com` / `fonts.gstatic.com`, so `next build` fails at
    the font-fetch step every time — that's the sandbox, not the code
    (`tsc` and `eslint` both pass, and the only build failure was the
    Fraunces `weight`/`axes` conflict fixed in Phase 2). **Next step for
    whoever has an internet-connected machine:** run `pnpm build` (or
    `npm run build`) in `frontend/`, then eyeball the hero at 375px/768px/
    1440px widths and confirm the video/poster load correctly from
    `/videos/`.

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
