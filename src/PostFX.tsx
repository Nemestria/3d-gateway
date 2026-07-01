import { EffectComposer, wrapEffect } from "@react-three/postprocessing";
import { LensDistortionEffect } from "postprocessing";
import { Vector2 } from "three";

// @react-three/postprocessing doesn't wrap every effect class the
// underlying `postprocessing` package ships — LensDistortionEffect (the
// fisheye/wide-lens warp) is one of the missing ones, so it's wrapped here
// the same way the library wraps its own built-ins.
const LensDistortion = wrapEffect(LensDistortionEffect);

const DISTORTION = new Vector2(0.12, 0.12);

// Barrel/fisheye warp of the 3D scene only — this has to stay Three.js-side
// since geometrically distorting arbitrary DOM (and the cross-origin
// portfolio iframe once unlocked) isn't practical the way warping a 3D
// render is. Chromatic aberration, scanlines, and the vignette moved to a
// page-wide CSS/SVG overlay instead (see CrtOverlay.tsx, applied in
// App.tsx) so those affect literally everything on screen, not just the
// canvas — this component used to include them too, which would have
// doubled up on the parts of the frame the canvas covers.
export default function PostFX({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={0}>
      <LensDistortion distortion={DISTORTION} />
    </EffectComposer>
  );
}
