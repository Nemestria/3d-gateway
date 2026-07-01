// Page-wide retro filter: chromatic aberration (SVG filter, referenced via
// CSS `filter: url(#crt-aberration)` on the app root in App.tsx) plus
// scanlines/vignette drawn as a fixed layer on top of everything. Unlike
// PostFX.tsx's Three.js effects (canvas-only), CSS/SVG `filter` operates at
// the compositing stage, so it affects the 3D canvas, the plain DOM
// overlays (buttons, LanguageGate), AND the embedded cross-origin portfolio
// iframe — visual filters aren't blocked by CORS the way pixel-data access
// (e.g. drawing an iframe into a <canvas>) would be.
// at-screen intensities are dialed down so the VFX don't fight readability
// when you're trying to read the password terminal or the embedded portfolio.
const IDLE_ABER  = 2;    // channel offset in px (full scene view)
const CLOSE_ABER = 0.6;  // channel offset when arrived at screen
const IDLE_SCAN  = 0.18; // scanline opacity (full scene)
const CLOSE_SCAN = 0.07; // scanline opacity at screen
const IDLE_VIG   = 0.55; // vignette strength (full scene)
const CLOSE_VIG  = 0.28; // vignette strength at screen

export default function CrtOverlay({ atScreen = false }: { atScreen?: boolean }) {
  const aber  = atScreen ? CLOSE_ABER  : IDLE_ABER;
  const scan  = atScreen ? CLOSE_SCAN  : IDLE_SCAN;
  const vig   = atScreen ? CLOSE_VIG   : IDLE_VIG;

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="crt-aberration" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="r"
          />
          <feOffset in="r" dx={-aber} dy="0" result="r" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="g"
          />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="b"
          />
          <feOffset in="b" dx={aber} dy="0" result="b" />
          <feBlend in="r" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b" mode="screen" />
        </filter>
      </svg>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          backgroundImage: [
            `repeating-linear-gradient(to bottom, rgba(0,0,0,${scan}) 0px, rgba(0,0,0,${scan}) 1px, transparent 1px, transparent 3px)`,
            `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${vig}) 100%)`,
          ].join(", "),
          mixBlendMode: "multiply",
          transition: "opacity 0.6s ease",
        }}
      />
    </>
  );
}
