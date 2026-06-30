import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import type { PerspectiveCamera } from "three";

export type FlightPhase = "idle" | "flying" | "arrived" | "returning";

// Tunable shots. ESTABLISHED is the wide intro framing (matches the camera
// prop passed to <Canvas>, and where "returning" lands). CLOSE is "pressed
// up against the screen" — tune these alongside the desk/computer
// rotation/position constants in Scene.tsx since they all assume the same
// model orientation.
// [eyeX, eyeY, eyeZ, targetX, targetY, targetZ]
const ESTABLISHED_LOOK: [number, number, number, number, number, number] = [
  4, 3, 6, 0, 1.2, 0,
];
const CLOSE_LOOK: [number, number, number, number, number, number] = [
  0, 1.5, 1.1, 0, 1.45, -1,
];
const ESTABLISHED_FOV = 50;
const CLOSE_FOV = 95;

const FLIGHT_DURATION = 2.4; // seconds — kept in sync with CameraControls' own transition time below
const RETURN_DURATION = 1.8;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function CameraRig({
  phase,
  onArrived,
  onReturned,
}: {
  phase: FlightPhase;
  onArrived: () => void;
  onReturned: () => void;
}) {
  const controls = useRef<CameraControls>(null);
  const { camera } = useThree();
  const elapsed = useRef(0);
  const startFov = useRef(ESTABLISHED_FOV);
  const prevPhase = useRef<FlightPhase>(phase);

  useEffect(() => {
    controls.current?.setLookAt(...ESTABLISHED_LOOK, false);
    // run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;

    if (phase === "flying") {
      c.setLookAt(...CLOSE_LOOK, true).then(onArrived);
    } else if (phase === "returning") {
      c.setLookAt(...ESTABLISHED_LOOK, true).then(onReturned);
    }
  }, [phase, onArrived, onReturned]);

  useFrame((_, delta) => {
    const cam = camera as PerspectiveCamera;

    if (phase !== prevPhase.current) {
      if (phase === "flying" || phase === "returning") {
        elapsed.current = 0;
        startFov.current = cam.fov;
      }
      prevPhase.current = phase;
    }

    if (phase === "flying" || phase === "returning") {
      const duration = phase === "flying" ? FLIGHT_DURATION : RETURN_DURATION;
      const endFov = phase === "flying" ? CLOSE_FOV : ESTABLISHED_FOV;

      elapsed.current += delta;
      const t = Math.min(elapsed.current / duration, 1);
      const eased = easeInOutCubic(t);

      cam.fov = startFov.current + (endFov - startFov.current) * eased;
      cam.updateProjectionMatrix();
    }
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      enabled={phase === "idle"}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={2}
      maxDistance={15}
    />
  );
}
