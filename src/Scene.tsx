import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useGLTF, Grid, Html, Text, Billboard } from "@react-three/drei";
import { Box3, Vector3 } from "three";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import type { FlightPhase } from "./CameraRig";
import {
  SCREEN_WORLD_POSITION,
  SCREEN_WORLD_ROTATION_Y,
  SCREEN_WORLD_SIZE,
} from "./screenAnchor";

// CSS width of the billboard-mode Html div; distanceFactor (computed in
// ScreenPlane, per canvas size) scales it to the plane's actual world size.
const HTML_WIDTH_PX = 300;

// Wireframe was used to hand-fit SCREEN_WORLD_SIZE/POSITION against the
// monitor's actual bezel (see screenAnchor.ts) — dialed in now, off.
const SCREEN_DEBUG = false;

// In-scene hint for the password — a sticky note near the desk, not just
// backstory. See ARCHITECTURE.md "In-scene note prop".
function Note() {
  return (
    <group position={[0.55, 1.06, 0.55]} rotation={[-Math.PI / 2, 0, 0.25]}>
      <mesh receiveShadow>
        <planeGeometry args={[0.16, 0.12]} />
        <meshStandardMaterial color="#f2e8c9" roughness={0.9} />
      </mesh>
      <Text
        position={[0, 0, 0.001]}
        fontSize={0.045}
        color="#2a2a2a"
        anchorX="center"
        anchorY="middle"
      >
        1234
      </Text>
    </group>
  );
}

// Google Fonts "Boldonse" — a genuinely heavy display weight, fetched as a
// direct .woff URL (troika's SDF text renders from a font file, not CSS, so
// the usual @import-in-index.css trick doesn't apply here).
const BOLDONSE_FONT_URL = "https://fonts.gstatic.com/s/boldonse/v1/ZgNQjPxGPbbJUZemjC3_.woff";

// One-time welcome signage off to the side of the room, visible from the
// establishing shot only — dismissed (see Scene's signDismissed) after 15s
// or as soon as the visitor picks a station, since a Billboard this size
// would otherwise bleed into the close-up screen view (it always faces the
// camera, including once zoomed into the monitor).
function WelcomeSign() {
  return (
    <Billboard position={[-3.2, 1.8, 3]}>
      <Text
        font={BOLDONSE_FONT_URL}
        fontSize={0.24}
        maxWidth={3.2}
        lineHeight={1.35}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#ffffff"
        letterSpacing={0.01}
      >
        HI, WELCOME TO MY PORTFOLIO. THIS IS ALE'S ROOM
      </Text>
    </Billboard>
  );
}

function Desk() {
  const { scene } = useGLTF("/Adjustable Desk.glb");
  return <primitive object={scene} position={[0, 0, 0]} scale={1.4} rotation={[0, Math.PI/2, 0]} />;
}

function Computer({
  onClick,
  onHoverChange,
  interactive,
}: {
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  onHoverChange: (hovered: boolean) => void;
  interactive: boolean;
}) {
  const { scene } = useGLTF("/Computer.glb");

  // Desk top is roughly y=0.75 (placeholder Adjustable Desk.glb) — auto-fit
  // the computer's own bounding box onto that surface instead of guessing
  // a hardcoded scale/position per model.
  const deskTopY = 0.75 * 1.4 + 0.27; // matches Desk's scale={1.4}, nudged up onto the surface

  const rotationY = 0;

  const { scale, position } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    box.getSize(size);
    const targetHeight = 0.9;
    const s = size.y > 0 ? targetHeight / size.y : 1;
    const center = new Vector3();
    box.getCenter(center);
    // Center offset must be rotated to match the model's applied Y rotation,
    // since position is applied in world axes after rotation swaps x/z.
    const rotatedCenter = center
      .clone()
      .applyAxisAngle(new Vector3(0, 1, 0), rotationY);
    return {
      scale: s,
      position: [
        -rotatedCenter.x * s,
        deskTopY - box.min.y * s,
        -rotatedCenter.z * s,
      ] as [number, number, number],
    };
  }, [scene, deskTopY, rotationY]);

  return (
    <primitive
      object={scene}
      scale={scale}
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick(e);
      }}
      onPointerOver={() => {
        if (!interactive) return;
        document.body.style.cursor = "pointer";
        onHoverChange(true);
      }}
      onPointerOut={() => {
        if (!interactive) return;
        document.body.style.cursor = "auto";
        onHoverChange(false);
      }}
    />
  );
}

// The visible screen surface, kept as its own top-level world-space object
// (not nested inside Computer's auto-fit group — see screenAnchor.ts for why
// and how its world position/normal were derived). Doubles as the hover-glow
// target and the anchor for the password terminal / embedded portfolio.
function ScreenPlane({
  onClick,
  hovered,
  onHoverChange,
  screenContent,
  interactive,
}: {
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  screenContent?: ReactNode;
  interactive: boolean;
}) {
  // drei's billboard-mode Html sizes itself as
  // (objectScale(camera) * distanceFactor), where objectScale already
  // cancels out fov/distance to give a true world-size billboard — the only
  // free variable left is canvas height in css px. Solving for "on-screen
  // width == SCREEN_WORLD_SIZE[0] projected" gives distanceFactor purely as
  // (worldWidth * canvasHeightPx) / htmlWidthPx, independent of camera
  // distance/fov/zoom. A fixed constant here (previously 0.9) only matched
  // one specific window size — this keeps the embed pinned to the plane's
  // actual world size regardless of viewport or zoom.
  const canvasHeight = useThree((state) => state.size.height);
  const distanceFactor = (SCREEN_WORLD_SIZE[0] * canvasHeight) / HTML_WIDTH_PX;

  return (
    <group position={SCREEN_WORLD_POSITION} rotation={[0, SCREEN_WORLD_ROTATION_Y, 0]}>
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick(e);
        }}
        onPointerOver={() => {
          if (!interactive) return;
          document.body.style.cursor = "pointer";
          onHoverChange(true);
        }}
        onPointerOut={() => {
          if (!interactive) return;
          document.body.style.cursor = "auto";
          onHoverChange(false);
        }}
      >
        <planeGeometry args={SCREEN_WORLD_SIZE} />
        <meshStandardMaterial
          color="#001414"
          emissive={hovered ? "#00e5ec" : "#00373a"}
          emissiveIntensity={hovered ? 1.4 : 0.25}
          wireframe={SCREEN_DEBUG}
          side={2}
        />
        {screenContent && (
          // Billboard mode (no `transform`), not perspective-matched — fine
          // here since the locked-POV camera (CameraRig) always looks
          // nearly straight at this plane by design, so there's no real
          // skew to correct for. Much more robust than <Html transform>,
          // which produced broken off-screen CSS matrices in testing.
          <Html
            position={[0, 0, 0.01]}
            center
            occlude
            distanceFactor={distanceFactor}
            style={{
              width: HTML_WIDTH_PX,
              height: HTML_WIDTH_PX * (SCREEN_WORLD_SIZE[1] / SCREEN_WORLD_SIZE[0]),
              pointerEvents: "auto",
            }}
          >
            {screenContent}
          </Html>
        )}
      </mesh>
    </group>
  );
}

export default function Scene({
  phase,
  onComputerClick,
  screenContent,
}: {
  phase: FlightPhase;
  onComputerClick: () => void;
  screenContent?: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  // Hover-glow only makes sense while picking a station from the general
  // camera — once flying/arrived/returning ("in the computer"), the screen
  // is either mid-transition or already the active focus, not a hoverable
  // menu item.
  const interactive = phase === "idle";

  // WelcomeSign is a one-shot greeting: gone after 15s, or immediately once
  // the visitor enters a station for the first time (whichever comes first).
  const [signDismissed, setSignDismissed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSignDismissed(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (!interactive) return;
    setSignDismissed(true);
    onComputerClick();
  };
  const handleHoverChange = (h: boolean) => setHovered(interactive && h);

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 8, 30]} />

      <ambientLight intensity={0.08} />
      <spotLight
        position={[0, 6, 0.5]}
        angle={0.35}
        penumbra={0.6}
        intensity={120}
        distance={12}
        decay={2}
        color="#bfe9ff"
        castShadow
        target-position={[0, 0.9, 0]}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2b2622" roughness={1} />
      </mesh>

      <Grid
        position={[0, 0.002, 0]}
        args={[200, 200]}
        cellSize={1}
        cellThickness={1}
        cellColor="#3d352c"
        sectionSize={4}
        sectionThickness={1}
        sectionColor="#4a3f33"
        fadeDistance={25}
        fadeStrength={1.5}
        infiniteGrid
      />

      <Desk />
      <Note />
      {!signDismissed && <WelcomeSign />}
      <Computer onClick={handleClick} onHoverChange={handleHoverChange} interactive={interactive} />
      <ScreenPlane
        onClick={handleClick}
        hovered={hovered}
        onHoverChange={handleHoverChange}
        screenContent={screenContent}
        interactive={interactive}
      />
    </>
  );
}

useGLTF.preload("/Adjustable Desk.glb");
useGLTF.preload("/Computer.glb");
