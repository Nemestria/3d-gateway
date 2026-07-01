import { Vector3 } from "three";

// The monitor's screen-plane, in world space. Derived (not guessed) by:
// 1. Sampling Computer.glb's Monitor mesh NORMAL accessor to find its
//    dominant flat front face (local normal (0,0,1), spanning the full
//    local width/height, z clustered near +37) — see Scene.tsx `Computer`'s
//    local-space placement for how that's used.
// 2. Applying the Computer group's live matrixWorld (auto-fit scale +
//    position, rotationY=0 since Computer.glb's own front already faces the
//    establishing camera reasonably well — see Scene.tsx `Computer`) to
//    that local point/normal via preview_eval against the running scene.
//
// Re-derive these (steps above) any time Computer's or Desk's rotation
// changes by hand — they're not automatically kept in sync.
//
// Kept as one shared source of truth so CameraRig's close-shot framing and
// Scene's screen-plane/Html anchor can't drift apart.
export const SCREEN_WORLD_POSITION = new Vector3(-0.3, 1.855, 0);
export const SCREEN_WORLD_NORMAL = new Vector3(0, 0, 1);
// Rotation that points a default (+Z-normal) plane/object along SCREEN_WORLD_NORMAL.
export const SCREEN_WORLD_ROTATION_Y = 0;
// World-space size of the screen rectangle (meters), matching the local
// SCREEN_SIZE in Scene.tsx run through the Computer group's ~0.0031732 scale.
export const SCREEN_WORLD_SIZE: [number, number] = [1.12, 0.65];
