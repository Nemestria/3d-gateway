# Claude Working Instructions

## Project
3D entry experience for Alejandro Sancho's portfolio — a computer in a 3D scene, click it, camera flies into a first-person screen view (wide-angle + chromatic aberration), a retro terminal password prompt appears, correct password navigates to the live portfolio.

**Separate project from the portfolio on purpose** — see [ARCHITECTURE.md](ARCHITECTURE.md) for the reasoning. Don't merge this into `../mainRepo`; on success this app does a real browser navigation to the portfolio's URL.

## Dev Setup
```bash
pnpm install
pnpm dev
pnpm build
```

## Before Starting
1. Read [ARCHITECTURE.md](ARCHITECTURE.md) — stack, the two-project split, the model-source decision, open questions
2. Read [CHECKPOINTS.md](CHECKPOINTS.md) — **work through these in order, don't skip ahead.** Currently at Checkpoint 0 (scaffold done) → next is Checkpoint 1.
3. Read [DESIGN.md](DESIGN.md) — visual spec, what to reuse from the portfolio's design language

## Key Files
- `src/App.tsx` — currently a placeholder; Checkpoint 1 replaces it with the actual `<Canvas>` scene
- `package.json` — `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `postprocessing` already installed

## Conventions (carried over from the portfolio, keep consistent)
- pnpm, not npm/yarn
- TypeScript throughout
- Commit message: scope + what + why
- Don't autoplay audio without an explicit opt-in (matches `../mainRepo`'s splash screen pattern)
- The password is **not real security** — hardcoded client-side check is correct and sufficient, don't over-engineer auth

## Relationship to `../mainRepo` (the portfolio)
- Read-only reference, not a dependency — don't import code from it, don't add it as a workspace package
- Reuse its *design language* (fonts, color, tone) per DESIGN.md, by reading its source for reference, not by importing it
- The redirect target on password success is its live URL: https://portfolio-ashen-sigma-63gx2gi92g.vercel.app (or its local dev server during testing — see Checkpoint 4)

## Testing
- Manual: `pnpm dev`, click through the full flow each checkpoint adds
- Check frame rate isn't tanking once real geometry/effects are in (no formal perf budget yet — use judgment, flag if a mid-range laptop chugs)
- No unit tests planned — this is a short, visual, interaction-heavy experience; manual testing is the right tool here

## Current State
Checkpoint 0 (scaffold) complete: Vite + React 19 + TS, 3D stack installed, default template cleared, builds clean. Nothing 3D-specific built yet. Next: Checkpoint 1 (static scene with placeholder computer geometry).
