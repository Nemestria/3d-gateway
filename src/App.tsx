import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import Scene from "./Scene";
import CameraRig, { type FlightPhase } from "./CameraRig";
import PasswordTerminal from "./PasswordTerminal";

// Env-driven so local testing doesn't require hardcoding the prod URL —
// see CHECKPOINTS.md Checkpoint 4.
const PORTFOLIO_URL =
  import.meta.env.VITE_PORTFOLIO_URL ??
  "https://portfolio-ashen-sigma-63gx2gi92g.vercel.app";

function App() {
  const [phase, setPhase] = useState<FlightPhase>("idle");
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", position: "relative" }}>
      <Canvas shadows camera={{ position: [4, 3, 6], fov: 50 }}>
        <Suspense fallback={null}>
          <Scene phase={phase} onComputerClick={() => setPhase("flying")} />
          <CameraRig
            phase={phase}
            onArrived={() => setPhase("arrived")}
            onReturned={() => setPhase("idle")}
          />
        </Suspense>
      </Canvas>

      {phase === "arrived" && !unlocked && (
        <>
          <PasswordTerminal onSuccess={() => setUnlocked(true)} />
          <button
            onClick={() => setPhase("returning")}
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              fontFamily: "monospace",
              background: "rgba(0,0,0,0.6)",
              color: "#bfe9ff",
              border: "1px solid #bfe9ff",
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            ← BACK
          </button>
        </>
      )}

      {unlocked && (
        <iframe
          title="portfolio"
          src={PORTFOLIO_URL}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      )}
    </div>
  );
}

export default App;
