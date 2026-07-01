import { EffectComposer, wrapEffect } from "@react-three/postprocessing";
import { LensDistortionEffect } from "postprocessing";
import { Vector2 } from "three";

// @react-three/postprocessing doesn't wrap every effect class the
// underlying `postprocessing` package ships — LensDistortionEffect (the
// fisheye/wide-lens warp) is one of the missing ones, so it's wrapped here
// the same way the library wraps its own built-ins.
const LensDistortion = wrapEffect(LensDistortionEffect);

const DISTORTION_IDLE   = new Vector2(0.12, 0.12); // full wide-lens warp
const DISTORTION_CLOSE  = new Vector2(0.03, 0.03); // subtle warp at screen

export default function PostFX({ enabled, atScreen = false }: { enabled: boolean; atScreen?: boolean }) {
  if (!enabled) return null;
  const distortion = atScreen ? DISTORTION_CLOSE : DISTORTION_IDLE;
  return (
    <EffectComposer multisampling={0}>
      <LensDistortion distortion={distortion} />
    </EffectComposer>
  );
}
