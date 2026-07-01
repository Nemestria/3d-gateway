# Claude Working Instructions

## Project
3D entry experience for Alejandro Sancho's portfolio — a computer in a 3D scene, click it, camera flies into a locked-POV first-person screen view (wide-angle + chromatic aberration), a retro terminal password prompt appears anchored to the screen, correct password embeds the live portfolio inside that same screen rectangle.

**Separate project from the portfolio on purpose** — see [ARCHITECTURE.md](ARCHITECTURE.md) for the reasoning. Don't merge this into `../mainRepo`. On success this app embeds the portfolio via an iframe sized to the monitor's screen-plane — **not** a full-page redirect (that was the original plan; superseded, see ARCHITECTURE.md "How they connect").

## Dev Setup
```bash
pnpm install
pnpm dev
pnpm build
```

## Before Starting
1. Read [ARCHITECTURE.md](ARCHITECTURE.md) — stack, the two-project split, the model-source decision, open questions
2. Read [CHECKPOINTS.md](CHECKPOINTS.md) — **work through these in order, don't skip ahead.** Checkpoints 0-1 done; 2-4 revised for the locked-POV camera + screen-anchored UI and in progress.
3. Read [DESIGN.md](DESIGN.md) — visual spec, what to reuse from the portfolio's design language

## Key Files
- `src/App.tsx` — top-level phase state (`idle`/`flying`/`arrived`/`returning`), mounts `<Canvas>`, renders the screen-anchored password terminal and embedded portfolio iframe once unlocked
- `src/Scene.tsx` — desk/computer GLB models, note prop, `ScreenPlane` (hover glow + Html anchor target)
- `src/CameraRig.tsx` — locked-POV camera controls + fly-in animation
- `src/screenAnchor.ts` — shared world-space position/normal/size for the monitor's screen-plane, used by both `CameraRig` (close-shot framing) and `Scene` (the anchor itself), so they can't drift apart
- `src/PasswordTerminal.tsx` — password UI, rendered via drei `<Html>` (billboard mode) anchored to the screen-plane
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
- The iframe embed target on password success is its live URL: https://portfolio-ashen-sigma-63gx2gi92g.vercel.app (or its local dev server during testing — see Checkpoint 4). It's embedded at monitor-screen size, not full-page.

## Testing
- Manual: `pnpm dev`, click through the full flow each checkpoint adds
- Check frame rate isn't tanking once real geometry/effects are in (no formal perf budget yet — use judgment, flag if a mid-range laptop chugs)
- No unit tests planned — this is a short, visual, interaction-heavy experience; manual testing is the right tool here

## Current State
Checkpoints 0-4 done, verified end-to-end in-browser: static scene w/ real GLB models, locked-POV camera rig (`src/CameraRig.tsx`), hover-glow + screen-anchored password terminal + embedded portfolio iframe all anchored to a screen-plane mesh (`ScreenPlane` in `src/Scene.tsx`, world-space anchor derived in `src/screenAnchor.ts`), visible 3D note prop ("1234") near the desk. Still open: chromatic aberration (Checkpoint 2), exit-transition flash on password success (Checkpoint 4), all of Checkpoint 5 (mobile fallback, loading state, deploy).
