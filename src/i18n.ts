export type Lang = "en" | "es" | "ca";

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "ENGLISH" },
  { code: "es", label: "ESPAÑOL" },
  { code: "ca", label: "CATALÀ" },
];

export const translations: Record<
  Lang,
  {
    chooseLanguage: string;
    loading: string;
    back: string;
    enterPassword: string;
    hint: string;
    confirm: string;
    accessDenied: string;
    welcome: string;
    effectsOn: string;
    effectsOff: string;
  }
> = {
  en: {
    chooseLanguage: "CHOOSE LANGUAGE",
    loading: "LOADING",
    back: "← BACK",
    enterPassword: "ENTER PASSWORD:",
    hint: "HINT: 1234",
    confirm: "CONFIRM",
    accessDenied: "ACCESS DENIED",
    welcome: "Hi, welcome to my portfolio. Check my computer, please!",
    effectsOn: "CRT FX: ON",
    effectsOff: "CRT FX: OFF",
  },
  es: {
    chooseLanguage: "ELIGE IDIOMA",
    loading: "CARGANDO",
    back: "← ATRÁS",
    enterPassword: "INTRODUCE LA CONTRASEÑA:",
    hint: "PISTA: 1234",
    confirm: "CONFIRMAR",
    accessDenied: "ACCESO DENEGADO",
    welcome: "Hola, bienvenido a mi portfolio. Revisa mi PC a ver qué encuentras...",
    effectsOn: "EFECTOS CRT: SÍ",
    effectsOff: "EFECTOS CRT: NO",
  },
  ca: {
    chooseLanguage: "TRIA IDIOMA",
    loading: "CARREGANT",
    back: "← ENRERE",
    enterPassword: "INTRODUEIX LA CONTRASENYA:",
    hint: "PISTA: 1234",
    confirm: "CONFIRMAR",
    accessDenied: "ACCÉS DENEGAT",
    welcome: "Hola, benvingut al meu portfolio. Has mirat ja en el meu ordinador?",
    effectsOn: "EFECTES CRT: SÍ",
    effectsOff: "EFECTES CRT: NO",
  },
};
