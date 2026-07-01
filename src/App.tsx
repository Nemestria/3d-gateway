import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import Scene from "./Scene";
import CameraRig, { type FlightPhase } from "./CameraRig";
import PasswordTerminal from "./PasswordTerminal";
import LanguageGate from "./LanguageGate";
import { translations, type Lang } from "./i18n";

// Env-driven so local testing doesn't require hardcoding the prod URL —
// see CHECKPOINTS.md Checkpoint 4.
const PORTFOLIO_BASE_URL =
  import.meta.env.VITE_PORTFOLIO_URL ??
  "https://portfolio-ashen-sigma-63gx2gi92g.vercel.app";
// ?embed=1 signals the portfolio to activate its embed-mode font/spacing
// adjustments (see mainRepo/src/main.tsx). Never used for security — the
// portfolio reads this to know it's inside the 3d-gateway, not a real user.
const PORTFOLIO_URL = `${PORTFOLIO_BASE_URL}?embed=1`;

// The portfolio's own layout targets ~1024x768 desktop (see its CLAUDE.md).
// The monitor's screen is only a few hundred CSS px wide, so a plain
// width:100%/height:100% iframe would trigger ITS mobile breakpoints
// instead of showing the real desktop site shrunk down — which is what
// "the site lives inside the screen" is supposed to look like. Fix: render
// the iframe at its real desktop resolution, then CSS-scale the whole thing
// down to fit whatever size the screen-plane's container actually is.
const PORTFOLIO_DESKTOP_WIDTH = 1280;
const PORTFOLIO_DESKTOP_HEIGHT = 800;

function PortfolioFrame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / PORTFOLIO_DESKTOP_WIDTH, height / PORTFOLIO_DESKTOP_HEIGHT));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
      }}
    >
      <iframe
        title="portfolio"
        src={PORTFOLIO_URL}
        style={{
          width: PORTFOLIO_DESKTOP_WIDTH,
          height: PORTFOLIO_DESKTOP_HEIGHT,
          border: "none",
          transform: `scale(${scale})`,
          transformOrigin: "center",
          flexShrink: 0,
        }}
      />
    </div>
  );
}

function App() {
  const [phase, setPhase] = useState<FlightPhase>("idle");
  const [unlocked, setUnlocked] = useState(false);
  // null until LanguageGate resolves — gates the whole experience the same
  // way the portfolio's own splash screen does (see ARCHITECTURE.md), and
  // doubles as the loading screen for the GLB models (useProgress in
  // LanguageGate tracks the same THREE.DefaultLoadingManager useGLTF uses).
  const [lang, setLang] = useState<Lang | null>(null);

  const t = translations[lang ?? "en"];

  // Rendered glued to the monitor's screen-plane (see Scene.tsx/CameraRig's
  // "Screen-plane" note) via drei's <Html transform>, not as a full-page
  // overlay — the portfolio lives inside the screen, camera/desk stay
  // visible around it. See ARCHITECTURE.md "How they connect".
  const screenContent =
    phase === "arrived" && !unlocked ? (
      <PasswordTerminal t={t} onSuccess={() => setUnlocked(true)} />
    ) : unlocked ? (
      <PortfolioFrame />
    ) : null;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", position: "relative" }}>
      <Canvas shadows camera={{ position: [4, 3, 6], fov: 50 }}>
        <Suspense fallback={null}>
          <Scene
            phase={phase}
            onComputerClick={() => setPhase("flying")}
            screenContent={screenContent}
            welcomeText={t.welcome}
          />
          <CameraRig
            phase={phase}
            onArrived={() => setPhase("arrived")}
            onReturned={() => setPhase("idle")}
          />
        </Suspense>
      </Canvas>

      {phase !== "idle" && phase !== "returning" && (
        <button
          onClick={() => {
            // Going back always resets the station — walking up to the
            // computer again means entering the password again, per design.
            setUnlocked(false);
            setPhase("returning");
          }}
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
          {t.back}
        </button>
      )}

      {!lang && <LanguageGate onDone={setLang} />}
    </div>
  );
}

export default App;
