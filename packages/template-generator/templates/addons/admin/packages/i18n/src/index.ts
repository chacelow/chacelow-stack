import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import zh from "./locales/zh.json";

export const supportedLanguages = [
  { label: "中文", value: "zh" },
  { label: "English", value: "en" },
] as const;

export const resources = {
  en: { translation: en },
  zh: { translation: zh },
} as const;

if (!i18next.isInitialized) {
  await i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      detection: {
        caches: ["localStorage"],
        order: ["localStorage", "navigator"],
      },
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
      resources,
      supportedLngs: supportedLanguages.map(({ value }) => value),
    });
}

export const i18n = i18next;
