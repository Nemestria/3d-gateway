import { Vector3 } from "three";

// PLACEHOLDER — rough guesses, not yet derived from the live scene. Same
// empirical-derivation process as screenAnchor.ts's computer anchor: once
// the arcade renders (Scene.tsx's `Arcade`), sample `ArcadeScreen`'s real
// matrixWorld-transformed bounding box + face normal via the preview tools'
// eval against the running dev server, then replace these three constants.
// Re-derive any time the arcade group's position/rotation/scale changes.
//
// Current guess tracks Scene.tsx's ARCADE_POSITION (-2.6, 0, 0.6),
// ARCADE_ROTATION_Y (0.6 + PI — model front is local -Z) and 2.2m target
// height: screen at upper-cabinet height. The normal is local -Z run
// through that rotation, which lands back at (sin 0.6, 0, cos 0.6) —
// pointing toward the establishing camera.
export const ARCADE_SCREEN_WORLD_POSITION = new Vector3(-2.6, 1.5, 0.6);
export const ARCADE_SCREEN_WORLD_NORMAL = new Vector3(Math.sin(0.6), 0, Math.cos(0.6));
export const ARCADE_SCREEN_WORLD_ROTATION_Y = 0.6;
export const ARCADE_SCREEN_WORLD_SIZE: [number, number] = [0.9, 0.7];
