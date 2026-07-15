# Landing Page Redesign — Phase Plan

**Status (2026-07-16): Design direction reversed.** The cinematic/glassmorphism
direction from the previous phase (dark hero, Fraunces serif, gold accent,
floating glass pill nav) has been replaced with a traditional enterprise SaaS
look, per an explicit client brief: white-and-blue palette, sticky top nav,
no glassmorphism, timeless/trustworthy over trendy. This doc's history below
is kept for context; the "design system" section describes the **current**
tokens.

**Commit log:**
- `8c721fa`, `6208361`, `2862633`, `9a96d4d`, `bca12d0`, `9ed163d` — prior
  cinematic-glassmorphism phase (superseded, see above)
- (uncommitted in this sandbox — see chat session) — Phase 5: traditional
  enterprise redesign

## Design system (current — Phase 5)

- **Palette** (`frontend/tailwind.config.ts`, `ct.*` tokens — shared by every
  marketing page, not just `/`):
  - `ct-paper` `#ffffff` — page background
  - `ct-mist` `#f6f8fb` — light alternating section background (new token)
  - `ct-graphite` `#0f1f3d` — dark navy, used for the footer and the final
    CTA band only (no longer the hero background)
  - `ct-blue` `#1d5bd6` / `ct-blueDeep` `#123f9e` — primary and hover blue
  - `ct-ice` — kept as a token name (still referenced by `/founder` and a few
    section files) but repurposed to the same value as `ct-blue`, so nothing
    renders gold anymore. New code should just use `ct-blue` directly instead
    of `ct-ice`.
  - Body background changed from a warm-ivory radial gradient to flat white.
  - `.glass-panel` / `.hero-glass` / `.glass-panel-strong` classes still exist
    in `globals.css` (for anything else that references them) but no longer
    use `backdrop-filter: blur()` — they're solid white/navy now, not frosted.
- **Type**: still Poppins (`--font-poppins`) for both display and body — no
  Fraunces serif. Headings use `font-semibold`, not the lighter editorial
  weight from the previous phase.

## What changed structurally

- **Nav**: floating rounded glass pill → sticky top nav, full-width, white
  background, border-bottom that appears on scroll. Logo left, links
  centered, "Request a demo" button right — matches the brief's spec
  literally. Hover = blue underline that grows from center, not a color-only
  fade.
- **Hero**: dark cinematic section with animated blur orbs and grid overlay →
  light (`ct-mist`) two-column hero with plain business copy and a static,
  hand-built dashboard preview (`sections/dashboard-preview.tsx` — sidebar,
  stat cards, attendance bar chart, activity feed) instead of a glass "pulse
  card". No stock photography (licensing), no video background (never
  actually existed as an asset despite prior doc's plan).
- **Sections**: `why-choose` expanded from a single paragraph into an actual
  4-card "platform benefits" grid. `core-features` (modules) numerals swapped
  for `lucide-react` icons. `testimonials` moved from a dark glass-panel
  section to a light section with plain bordered cards. `final-cta` kept as
  the one deliberately dark navy band (common enterprise CTA-banner pattern)
  but the blur-glow orb was removed for a flat background.
- **New**: `sections/pricing.tsx` — three-tier plan grid (Starter/Business/
  Enterprise), added between Security and Testimonials, plus a `#pricing`
  anchor and nav link.
- **Footer**: recolored only; columns renamed/reorganized to Company /
  Resources / Legal / Contact to match the brief's wording exactly (was
  Company / Platform / Legal, with contact info folded into the first
  column).

## Notes for the next agent

- Don't touch `ink` / `surface` / `line` / `brand.*` tokens — those are used
  by the authenticated app shell (dashboard etc.), out of scope here.
- `ct-ice` is a legacy token name — treat any remaining reference to it as a
  cleanup opportunity (swap to `ct-blue`), not a color to restore.
- The `.ct-cut` / `.ct-cut-sm` diagonal clip-path classes in `globals.css` are
  unused dead CSS (not referenced by any component) — harmless to leave, but
  fine to delete if doing a cleanup pass.
- Same sandbox limitation as before: `next build` can't fetch `Poppins` from
  Google Fonts here (network allowlist doesn't include `fonts.googleapis.com`
  / `fonts.gstatic.com`). `tsc --noEmit` and `eslint` both pass clean across
  the whole `frontend/`. Run `next build` once on a machine/CI with open
  internet before deploying.
