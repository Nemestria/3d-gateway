import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { LANGUAGES, translations, type Lang } from "./i18n";

const PX = "'Press Start 2P', monospace";
const MONO = "'Share Tech Mono', monospace";
const ACCENT = "#00b9be";

// Shown until the visitor picks a language AND asset loading (the GLB
// models, preloaded from Scene.tsx) finishes — whichever takes longer.
// useProgress tracks THREE.DefaultLoadingManager, the same one useGLTF uses,
// so this reflects real load progress rather than a fake timer.
export default function LanguageGate({ onDone }: { onDone: (lang: Lang) => void }) {
  const { progress } = useProgress();
  const [chosen, setChosen] = useState<Lang | null>(null);

  useEffect(() => {
    if (chosen && progress >= 100) onDone(chosen);
  }, [chosen, progress, onDone]);

  const label = chosen ? translations[chosen].loading : translations.en.chooseLanguage;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#020a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        zIndex: 10,
      }}
    >
      <div style={{ fontFamily: PX, fontSize: 14, color: ACCENT, letterSpacing: 1 }}>
        {label}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 260 }}>
        {LANGUAGES.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => setChosen(code)}
            style={{
              width: "100%",
              background: chosen === code ? ACCENT : "transparent",
              color: chosen === code ? "#020a0a" : ACCENT,
              border: `1px solid ${ACCENT}`,
              fontFamily: PX,
              fontSize: 11,
              letterSpacing: 1,
              padding: "12px 0",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ fontFamily: MONO, fontSize: 12, color: `${ACCENT}99`, letterSpacing: 1 }}>
        {Math.round(progress)}%
      </div>
    </div>
  );
}
