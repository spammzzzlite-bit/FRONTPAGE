# QAMind AI — Landing Page Redesign

## What we are doing
Redesigning ONLY the public marketing landing page. Nothing else.
Treat the rest of the app as off-limits.

## HARD SCOPE GUARDRAILS — do not violate
- You may ONLY edit:
  - `src/routes/index.tsx` (the landing page)
  - `src/frontend/styles.css` (styles/tokens)
  - NEW files inside a new folder `src/components/landing/` (landing-only components)
- Do NOT touch: the `/auth` routes, any in-app/dashboard UI, backend, API,
  database, config, or any other route. If a change seems to require touching
  anything outside the list above, STOP and ask me first.
- Do NOT add new npm dependencies without asking. Reuse what's installed.

## Tech stack (do not assume Next.js — it is NOT Next.js)
- TanStack Start (Vite + Nitro + TanStack Router). File-based routes.
- Tailwind CSS v4, with `--c-*` CSS custom properties for all colours.
- Icons: `lucide-react`.
- Animation: GSAP + ScrollTrigger + SplitText + Lenis are ALREADY loaded.
  Reuse the existing setup; do not reinstall or duplicate it.
- Fonts already in use: Bricolage Grotesque, Hanken Grotesk, IBM Plex Mono.
- Light/dark via `.dark` class + `data-theme` on `<html>`. Dark is the default.
- Auth links: `<Link to="/auth" search={{ mode: "signup" }}>` (Get started),
  `<Link to="/auth" search={{ mode: "signin" }}>` (Sign in).

## Brand — follow docs/QAMind_AI_Brand_Guidelines.pdf. Load-bearing rules:
- Terracotta (#C2552E) is the ONLY accent. It carries every primary action,
  every link, and the "AI" in the wordmark. Never use it as a generic fill.
  Hover = #D9744A, pressed = #9E4220.
- Everything else is a warm neutral: espresso browns (dark mode), paper creams
  (light mode). No cold greys, no SaaS-blue.
- Typography roles: Bricolage = display/headlines/big numbers.
  Hanken Grotesk = body/UI/buttons. IBM Plex Mono = eyebrows, labels, run IDs,
  code, metadata.
- Semantic colours stay muted/earthy: sage = pass, clay = fail, gold = flaky.
- The wordmark gets no shadows, glows, or effects. Don't recolour "AI".

## Voice — write like a thoughtful senior engineer
- Precise, confident, human. Real numbers and real outcomes over adjectives.
- SAY things like: "QAMind caught 14 regressions in this PR." / "Coverage is
  at 73%. Here's the gap." / "This test is flaky — here's why, and the fix."
- NEVER say: "revolutionary", "10x", "effortlessly", "world's smartest",
  "synergy", "supercharge", "game-changer".
- The current site has a deliberate editorial/literary tone ("Quality, Slowly",
  "Empty is a state, not a failure", a colophon). Preserve that soul.


## Working conventions
- For any change touching more than one file, enter plan mode and show me the
  plan before writing code.
-
- Keep light mode AND dark mode working. 
- The full section plan lives in docs/SPEC.md — follow it.
- Commit after each section with a message like "landing: <section>".