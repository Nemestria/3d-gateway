// Page-wide retro filter: chromatic aberration (SVG filter, referenced via
// CSS `filter: url(#crt-aberration)` on the app root in App.tsx) plus
// scanlines/vignette drawn as a fixed layer on top of everything. Unlike
// PostFX.tsx's Three.js effects (canvas-only), CSS/SVG `filter` operates at
// the compositing stage, so it affects the 3D canvas, the plain DOM
// overlays (buttons, LanguageGate), AND the embedded cross-origin portfolio
// iframe — visual filters aren't blocked by CORS the way pixel-data access
// (e.g. drawing an iframe into a <canvas>) would be.
export default function CrtOverlay() {
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
          <feOffset in="r" dx="-2" dy="0" result="r" />
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
          <feOffset in="b" dx="2" dy="0" result="b" />
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
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)",
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
          ].join(", "),
          mixBlendMode: "multiply",
        }}
      />
    </>
  );
}
