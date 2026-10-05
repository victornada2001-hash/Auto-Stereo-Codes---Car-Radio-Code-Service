export type Language = "en" | "es" | "pt" | "fr" | "de" | "it";

export const languageOptions: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇲🇽" },
  { code: "pt", label: "Português (Brasil)", flag: "🇧🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

export function paypalLocale(language: Language) {
  return {
    en: "en-US",
    es: "es-MX",
    pt: "pt-BR",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
  }[language];
}

export function normalizeLanguage(value: unknown): Language {
  const candidate = String(value || "").toLowerCase();
  return languageOptions.some((item) => item.code === candidate)
    ? (candidate as Language)
    : "en";
}
