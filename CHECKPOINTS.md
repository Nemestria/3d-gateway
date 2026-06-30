# Checkpoints

Work through these in order. Each one should run (`pnpm dev`) and visibly demonstrate the new piece before moving on — don't combine checkpoints, don't skip ahead on the model dependency (use the placeholder, see Checkpoint 1).

## ✅ Checkpoint 0 — Scaffold (done)

- Vite + React 19 + TS project created
- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `postprocessing` installed
- Default Vite template content cleared (`App.tsx` is a placeholder)
- Builds clean (`pnpm build`)
- Docs written (this set)

**Not done yet:** git init / GitHub repo / Vercel project for this new app — do that whenever ready to go live with it (see "Deploy" in Checkpoint 5).

## Checkpoint 1 — Static scene

**Goal:** a 3D computer sits in a scene, camera shows an establishing shot, nothing is interactive yet.

- [ ] `<Canvas>` mounted in `App.tsx`, basic lighting (ambient + directional/point)
- [ ] Computer model in scene — **use the procedural placeholder option from ARCHITECTURE.md first** (primitive boxes/cylinders), don't block this checkpoint on Alejandro's Blender export
- [ ] Static or gently orbiting establishing-shot camera (drei's `<OrbitControls>` is fine for dev/debugging, can be removed/disabled later)
- [ ] Floor/desk plane so the computer doesn't float in void; basic environment (solid color or simple gradient background, no need for a full room yet)

**Definition of done:** `pnpm dev`, see a computer-shaped object in a lit scene, can orbit-inspect it.

## Checkpoint 2 — Click-to-fly interaction

**Goal:** clicking the computer flies the camera into a close-up "inside the screen" view with the wide-angle + chromatic aberration effect.

- [ ] Raycast click handler on the computer mesh (R3F `onClick` on the relevant mesh/group)
- [ ] Camera animation: eased position/lookAt interpolation from establishing shot → screen close-up (see ARCHITECTURE.md for the lerp/GSAP note)
- [ ] FOV ramps wider during the flight
- [ ] `<EffectComposer>` + `<ChromaticAberration>` added, offset ramping with flight progress (subtle → peak → settle)
- [ ] Re-clicking during/after the flight doesn't restart or break the animation (guard with a state flag)

**Definition of done:** click the computer, watch a deliberate, non-janky camera flight that ends close to the screen with visible chromatic aberration.

## Checkpoint 3 — Password terminal overlay

**Goal:** once the camera arrives, an HTML password prompt appears, styled like a retro terminal.

- [ ] Overlay fades in after the camera flight completes (not before — don't show it during the flight)
- [ ] Styled with the portfolio's font stack (`Press Start 2P` / `Share Tech Mono`) for visual continuity — see DESIGN.md
- [ ] Controlled input, blinking cursor, masked or echoed characters (pick one per DESIGN.md)
- [ ] Wrong password → shake/glitch feedback + "ACCESS DENIED", input clears, can retry immediately (no lockout/rate limiting)
- [ ] Right password → proceeds to Checkpoint 4 (don't build the redirect yet if not ready, just log/console it)

**Definition of done:** can type the wrong password and see a clear rejection, and the right password is detectably different (e.g. console log) without yet leaving the page.

## Checkpoint 4 — Success transition + handoff to the portfolio

**Goal:** correct password actually takes the visitor to the live portfolio.

- [ ] Exit transition on success (screen flash/glitch — keep it short, don't make visitors wait)
- [ ] `window.location.href` (or equivalent real navigation) to the portfolio URL
- [ ] URL should be environment-driven (dev: `http://localhost:5173` or whatever the portfolio's dev server runs on; prod: the live Vercel URL) — don't hardcode the prod URL in a way that breaks local testing of the full flow
- [ ] Confirm: does NOT touch `mainRepo` at all — verify the portfolio's existing splash screen still appears normally when arrived at via this gateway (no attempt to skip/merge the two intros yet, that's a polish decision for later if desired)

**Definition of done:** full flow works end-to-end locally — click computer → fly in → type real password → land on the portfolio (running its own dev server, or the live URL).

## Checkpoint 5 — Polish, fallback, deploy

**Goal:** production-ready.

- [ ] Loading state for any model/texture assets (progress bar or simple spinner) — there will be a load delay once a real (non-procedural) model is in use
- [ ] Mobile/low-end fallback per the open decision in ARCHITECTURE.md (skip 3D entirely on detected low-end/no-WebGL, or accept desktop-only — confirm with Alejandro which)
- [ ] Performance pass: check frame rate with the final model + effects on a mid-range machine, not just dev hardware
- [ ] Swap procedural placeholder for Alejandro's real model, if/when delivered
- [ ] git init this repo (if not already), push to its own GitHub repo
- [ ] New Vercel project linked to that repo (same pattern as `mainRepo` — see `../mainRepo/CLAUDE.md` for the exact commands used last time)
- [ ] Decide & wire the final redirect URL (custom domain question from ARCHITECTURE.md, if relevant by this point)

**Definition of done:** live URL, works on a phone (either the full experience or the agreed fallback), the click-to-portfolio flow is publicly testable.
