# Architecture & Plan

## The pitch

1. 3D scene loads: a computer sits on a desk, establishing shot.
2. Visitor clicks the computer.
3. Camera flies from the establishing shot into a first-person view of the screen — FOV widens during the flight (fisheye/wide-angle feel), chromatic aberration kicks in (post-processing).
4. Once "inside" the screen, an HTML overlay appears: a retro terminal password prompt.
5. Visitor types a password. Wrong → shake/glitch, try again. Right → exit transition (flash/glitch), then **real browser navigation** to the live portfolio.

## Two-project split — why, and how they connect

The portfolio (`../mainRepo`) is a finished, deployed, independently-functioning site. This project is deliberately **not** merged into it:

- **Risk isolation.** The portfolio works today. Bolting an experimental 3D scene into its bundle risks breaking something that currently ships fine.
- **Bundle weight.** Three.js + react-three-fiber + postprocessing will roughly double-to-triple this project's JS payload on their own. The portfolio is currently ~227KB gzipped total — keeping that lean matters more than keeping these two experiences in one repo.
- **Independent iteration speed.** This project can be prototyped, broken, and rebuilt without touching `master` on the live portfolio.

### How they connect: portfolio embedded inside the in-scene screen (superseded decision)

**Revised.** The original plan below (real navigation, full-page redirect) is superseded by a diegetic requirement: the portfolio must visibly *live inside the computer's screen* in the 3D scene — camera stays in its close POV, monitor bezel and desk stay visible around the site, no page navigation away from the 3D view.

Implementation: an `<iframe src={PORTFOLIO_URL}>` sized and perspective-matched to the monitor's screen-plane mesh via drei's `<Html transform>` (same anchor the password terminal uses, see Checkpoint 3/4). Not a full-page iframe — it only fills the on-screen screen rectangle.

This intentionally reintroduces the iframe approach the original plan rejected. The original objection (iframes fighting the portfolio's fullscreen draggable-window UI) still applies if this iframe were full-page — it isn't; it's a small windowed embed, so that failure mode doesn't apply here. Two things worth verifying once wired up: whether the portfolio's own splash/intro reads fine at monitor-rectangle size, and whether the portfolio requires a specific viewport minimum (its own desktop-only ~1024×768 target, per its CLAUDE.md) that a small in-screen iframe won't satisfy — see Checkpoint 4.

**Original plan (kept for history, no longer the chosen approach):**

```ts
window.location.href = "https://portfolio-ashen-sigma-63gx2gi92g.vercel.app";
```

| Approach | Verdict (original) | Why |
|---|---|---|
| Real navigation | ✅ (superseded) | Simple, robust, no iframe sizing headaches — but breaks the "site lives in the screen" requirement |
| iframe embed, full-page | ❌ | Fights the portfolio's own fullscreen draggable-window UI |
| iframe embed, screen-rectangle-only | ✅ (current) | Confined to monitor-screen size, camera/desk stay visible around it — matches the diegetic requirement, avoids the full-page failure mode |
| Monorepo, shared deploy | ❌ | Forces both stacks' dependencies together; defeats bundle-isolation goal |
| Mount portfolio's `<App/>` inside this repo | ❌ | Duplicating/npm-linking mainRepo's App.tsx, fonts, assets — high maintenance for no benefit over an iframe |

**If a unified domain is wanted later**, that's a DNS/Vercel-routing concern, not a code-merging one.

## Stack

- **Vite + React 19 + TypeScript** — matches the portfolio's toolchain (consistency for whoever maintains both)
- **`@react-three/fiber`** — React renderer for Three.js, lets the scene be authored as JSX/components instead of imperative Three.js calls
- **`@react-three/drei`** — grab-bag of R3F helpers (model loaders, camera controls, `useGLTF`, etc.) — avoids reinventing common patterns
- **`@react-three/postprocessing`** (+ `postprocessing`) — chromatic aberration, vignette, bloom as composable effect passes

All four are already installed (`package.json`).

## The 3D computer model — resolved

`public/Computer.glb` and `public/Adjustable Desk.glb` are in use (loaded via `useGLTF` in `Scene.tsx`). Free/CC-style assets, not yet Alejandro's own Blender export — swappable later without touching camera/postprocessing/password code, per the original plan below.

<details>
<summary>Original options considered (for history)</summary>

1. Alejandro models it himself in Blender, exports glTF/GLB — best quality, his own timeline.
2. Build it from primitives in code — fully code-driven, no licensing question, less polished.
3. Free/CC asset from Sketchfab or similar — fastest, generic, license-check obligation. **This is the option currently in use.**

</details>

## Camera model — locked POV, not free orbit

**Revised.** The visitor is not an orbiting inspector — they're a POV in the room. At every phase (establishing shot and arrived/close shot):

- Drag (left-click) rotates yaw/pitch within a clamped range — can look around a bit, cannot spin to see all angles or fly around the room.
- Mouse near the viewport edge nudges a small look-offset (subtle parallax), independent of drag.
- Zoom is clamped to a tight range — a little push in/out, not free dolly.
- Once "arrived" (close POV on the screen), the clamp tightens further — mostly forced to look at the screen, small nudge room only.

This replaces the earlier plan of drei's free `<CameraControls>`/`<OrbitControls>` for dev/debug — those are gone now, not just disabled, since the locked-POV behavior is core to the experience, not a debug convenience.

## Camera fly-in

- Camera path: lerp/slerp position + lookAt target from the establishing shot to the close POV in front of the screen-plane (see below), driven by `useFrame` with an eased progress value (0→1).
- Wide-angle effect: ramp the camera's `fov` property up during the back half of the flight (e.g. 50° → 90°+) — cheap, no extra geometry needed, reads immediately as "uncomfortably close to a CRT."
- Trigger: raycast click on the computer mesh (`onClick` works directly on R3F mesh JSX) starts the animation; lock further clicks until it completes or the password screen exits.

## Screen-plane (hover glow + HTML/iframe anchor)

`Computer.glb`'s `Monitor` mesh is a single mesh/material — no separate screen face to key material changes off. Fix: an extra plane mesh (`ScreenPlane` in `src/Scene.tsx`), authored in code, not nested in the GLB or in Computer's auto-fit group (nesting it there fed back into the auto-fit bounding-box calc and broke the model's scale — see the git history for that detour). Instead it's a standalone top-level object positioned/rotated using the world-space anchor in `src/screenAnchor.ts`, which was derived by sampling `Computer.glb`'s own NORMAL accessor for its dominant front face and applying the live matrixWorld — not guessed.

This plane serves two jobs:
1. **Hover glow** — `onPointerOver`/`onPointerOut` (on the Computer body or the plane itself) toggles this plane's emissive intensity (screen lights up on hover, off on hover-out).
2. **HTML anchor** — drei's `<Html>` in **billboard mode** (no `transform` prop) attached at this plane's position, used for both the password terminal (Checkpoint 3) and the embedded portfolio iframe (Checkpoint 4). `<Html transform occlude>` was tried first but produced broken/off-screen CSS matrices in testing; billboard mode is a reasonable simplification here since the locked-POV camera (see above) always looks nearly straight at the screen by design, so there's no real perspective skew to correct for.

## Post-processing

`@react-three/postprocessing`'s `<EffectComposer>` wrapping `<ChromaticAberration offset={...} />` (+ optionally `<Vignette>`, `<Noise>` for CRT grain). Ramp the chromatic aberration offset in sync with the camera flight progress (subtle at rest, peak during the fastest part of the flight, settles to a low ambient amount once "inside" the screen) rather than a flat constant — reads as more intentional.

## Password terminal

Once the camera flight finishes, fade in an **HTML overlay anchored to the screen-plane** (via drei `<Html>` billboard mode, see above — not a full-page overlay, not a 3D-rendered texture):
- Reuse `Press Start 2P` / `Share Tech Mono` (match `../mainRepo`'s `PX`/`MONO` constants) for visual continuity between the two projects
- Plain controlled `<input>`, styled like a BIOS/terminal prompt (blinking cursor, echoed or asterisked characters — pick one, asterisks reads more "password," plain echo reads more "terminal")
- Wrong password: shake animation + "ACCESS DENIED" message, clear input, don't lock out (no rate limiting — this is a portfolio gimmick, not real auth)

**This is not real security.** The password is a hardcoded string checked client-side. Anyone can read it in devtools or view-source the bundle. That's fine and expected — it's a theatrical gate, not an access-control system. Don't build backend validation, rate limiting, or anything implying real auth; that would be wasted effort and wrong framing for a portfolio piece.

## In-scene note prop

A small paper/plane mesh near the desk, rendered with "1234" on it (canvas texture or drei `<Text>`) — the in-scene justification for the password, a discoverable hint rather than pure backstory.

## Open decisions (need Alejandro's input before/while building)

1. ~~Model source~~ — resolved, see above.
2. ~~The password itself~~ — resolved: `1234`, justified in-scene by the note prop above (deliberately simple/jokey rather than a "real" secret — matches "not real security").
3. **Mobile fallback** — WebGL performance on phones varies a lot. Recommended default: detect low-end/no-WebGL and skip straight to the password screen (no 3D flight) rather than forcing everyone through it. Confirm this is acceptable, or whether mobile should just be deprioritized entirely (desktop-only gate, like the portfolio itself targets ~1024×768). **Still open.**
4. **Domain/URL wiring** — redirect target is currently the Vercel preview URL, now embedded via iframe rather than full navigation (see "How they connect" above); decide later if a custom domain unifies both projects. **Still open.**
