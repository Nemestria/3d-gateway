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

### How they connect: real navigation, not embedding

On password success, this app does:
```ts
window.location.href = "https://portfolio-ashen-sigma-63gx2gi92g.vercel.app";
// or a relative/env-driven URL in dev — see Checkpoint 4
```

This was chosen over the alternatives:

| Approach | Verdict | Why |
|---|---|---|
| **Real navigation (chosen)** | ✅ | Simple, robust, each site stays independently deployable, no shared build tooling, no iframe security/sizing headaches |
| iframe embed | ❌ | iframes fight with the portfolio's own fullscreen draggable-window UI (z-index, viewport sizing, postMessage handshakes for the password gate) — fragile for no real benefit |
| Monorepo, shared deploy | ❌ | Forces both sites' dependencies (Three.js *and* the portfolio's stack) into consideration together; defeats the bundle-isolation goal above |
| Mount portfolio's `<App/>` inside this repo | ❌ | Would require duplicating or npm-linking `mainRepo`'s App.tsx, fonts, assets, CSS vars — high maintenance cost for low benefit over a plain redirect |

**If a unified domain is wanted later** (e.g. `alejandrosancho.dev` → 3D gate, same domain → portfolio), that's a DNS/Vercel-routing concern, not a code-merging one — both projects can stay separate repos under one custom domain with path-based rewrites in Vercel. Cross that bridge when there's a real domain to configure.

## Stack

- **Vite + React 19 + TypeScript** — matches the portfolio's toolchain (consistency for whoever maintains both)
- **`@react-three/fiber`** — React renderer for Three.js, lets the scene be authored as JSX/components instead of imperative Three.js calls
- **`@react-three/drei`** — grab-bag of R3F helpers (model loaders, camera controls, `useGLTF`, etc.) — avoids reinventing common patterns
- **`@react-three/postprocessing`** (+ `postprocessing`) — chromatic aberration, vignette, bloom as composable effect passes

All four are already installed (`package.json`).

## The 3D computer model — the biggest open variable

Three options, ranked by recommended order:

1. **Alejandro models it himself in Blender, exports glTF/GLB.** Best quality, most "authentically his," and he's a professional 3D artist for exactly this kind of asset — but it's work outside a coding session, on his own timeline. **Preferred if he has the bandwidth.**
2. **Build it from primitives in code** (boxes for the monitor body, a beveled/curved front for the CRT screen, cylinders for stand/keyboard keys) styled flat-shaded. Fits the portfolio's existing "no gradients, flat color" rule surprisingly well, fully code-driven — no external tool, no licensing question, but won't look as polished as a hand-modeled asset.
3. **Free/CC asset from Sketchfab or similar.** Fastest to get *something* in-scene for early checkpoints, but generic and carries a license-checking obligation. Reasonable as a **temporary stand-in** for Checkpoint 1 while deciding between options 1 and 2, not as the final asset.

**Recommendation:** start Checkpoint 1 with option 2 (procedural placeholder) so camera/interaction work isn't blocked on asset delivery, and swap in option 1 (Alejandro's model) when it's ready — the swap is just changing what gets loaded into the scene, doesn't touch camera/postprocessing/password code.

## Camera fly-in

- Camera path: lerp/slerp position + lookAt target from the establishing shot to a point just in front of (or "inside") the screen mesh, driven by `useFrame` with an eased progress value (0→1), or via GSAP if hand-tuning easing curves gets fiddly in raw R3F.
- Wide-angle effect: ramp the camera's `fov` property up during the back half of the flight (e.g. 50° → 90°+) — cheap, no extra geometry needed, reads immediately as "uncomfortably close to a CRT."
- Trigger: raycast click on the computer mesh (`onClick` works directly on R3F mesh JSX) starts the animation; lock further clicks until it completes or the password screen exits.

## Post-processing

`@react-three/postprocessing`'s `<EffectComposer>` wrapping `<ChromaticAberration offset={...} />` (+ optionally `<Vignette>`, `<Noise>` for CRT grain). Ramp the chromatic aberration offset in sync with the camera flight progress (subtle at rest, peak during the fastest part of the flight, settles to a low ambient amount once "inside" the screen) rather than a flat constant — reads as more intentional.

## Password terminal

Once the camera flight finishes, fade in an **HTML overlay** (not a 3D-rendered texture — much simpler, and lets it reuse the portfolio's existing retro font stack):
- Reuse `Press Start 2P` / `Share Tech Mono` (match `../mainRepo`'s `PX`/`MONO` constants) for visual continuity between the two projects
- Plain controlled `<input>`, styled like a BIOS/terminal prompt (blinking cursor, echoed or asterisked characters — pick one, asterisks reads more "password," plain echo reads more "terminal")
- Wrong password: shake animation + "ACCESS DENIED" message, clear input, don't lock out (no rate limiting — this is a portfolio gimmick, not real auth)

**This is not real security.** The password is a hardcoded string checked client-side. Anyone can read it in devtools or view-source the bundle. That's fine and expected — it's a theatrical gate, not an access-control system. Don't build backend validation, rate limiting, or anything implying real auth; that would be wasted effort and wrong framing for a portfolio piece.

## Open decisions (need Alejandro's input before/while building)

1. **Model source** — his own Blender export vs. procedural placeholder vs. temporary free asset (see above). Affects Checkpoint 1 timeline directly.
2. **The password itself** — any string is fine technically; pick something meaningful to him (a personal in-joke reads better than `"password123"`).
3. **Mobile fallback** — WebGL performance on phones varies a lot. Recommended default: detect low-end/no-WebGL and skip straight to the password screen (no 3D flight) rather than forcing everyone through it. Confirm this is acceptable, or whether mobile should just be deprioritized entirely (desktop-only gate, like the portfolio itself targets ~1024×768).
4. **Domain/URL wiring** — redirect target is currently the Vercel preview URL; decide later if a custom domain unifies both projects.
