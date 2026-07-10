import { Vector3 } from "three";
import { SCREEN_WORLD_POSITION, SCREEN_WORLD_NORMAL } from "./screenAnchor";
import { ARCADE_SCREEN_WORLD_POSITION, ARCADE_SCREEN_WORLD_NORMAL } from "./arcadeScreenAnchor";

// Every clickable object the camera can fly in to. CameraRig looks up its
// "close" shot here instead of hardcoding a single target — see
// CameraRig.tsx's `station` prop. Add a new entry here (+ a screen-anchor
// module deriving its position/normal, same process as screenAnchor.ts) any
// time a new station is added.
export type StationId = "computer" | "arcade";

export interface StationShot {
  closeEye: Vector3;
  closeTarget: Vector3;
  closeFov: number;
}

const COMPUTER: StationShot = {
  closeEye: SCREEN_WORLD_POSITION.clone().addScaledVector(SCREEN_WORLD_NORMAL, 0.35),
  closeTarget: SCREEN_WORLD_POSITION.clone(),
  closeFov: 95,
};

// Placeholder until arcadeScreenAnchor.ts's constants are derived from the
// live scene (Phase 3). Stand-off is wider than the computer's 0.35 — the
// arcade's screen is physically bigger than the desk monitor's, so the
// same distance would clip inside the cabinet.
const ARCADE: StationShot = {
  closeEye: ARCADE_SCREEN_WORLD_POSITION.clone().addScaledVector(ARCADE_SCREEN_WORLD_NORMAL, 0.9),
  closeTarget: ARCADE_SCREEN_WORLD_POSITION.clone(),
  closeFov: 80,
};

export const STATIONS: Record<StationId, StationShot> = {
  computer: COMPUTER,
  arcade: ARCADE,
};
