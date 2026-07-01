import {
  EffectComposer,
  ChromaticAberration,
  Vignette,
  Noise,
  Scanline,
  wrapEffect,
} from "@react-three/postprocessing";
import { LensDistortionEffect, BlendFunction } from "postprocessing";
import { Vector2 } from "three";

// @react-three/postprocessing doesn't wrap every effect class the
// underlying `postprocessing` package ships — LensDistortionEffect (the
// fisheye/wide-lens warp) is one of the missing ones, so it's wrapped here
// the same way the library wraps its own built-ins.
const LensDistortion = wrapEffect(LensDistortionEffect);

const DISTORTION = new Vector2(0.12, 0.12);
const CHROMATIC_OFFSET = new Vector2(0.0015, 0.0015);

// Vintage CRT/monitor look for the whole viewport: barrel distortion
// (wide-lens warp toward the edges), chromatic aberration (color fringing),
// scanlines + a little grain, and a vignette. Toggleable from App.tsx's
// settings button — disabling just unmounts the composer, no separate
// enabled/disabled effect state to track.
export default function PostFX({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={0}>
      <LensDistortion distortion={DISTORTION} />
      <ChromaticAberration offset={CHROMATIC_OFFSET} />
      <Scanline density={1.75} opacity={0.12} blendFunction={BlendFunction.OVERLAY} />
      <Noise opacity={0.05} />
      <Vignette eskil={false} offset={0.15} darkness={0.9} />
    </EffectComposer>
  );
}
