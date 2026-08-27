import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import zh from "./locales/zh.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof en;
    };
  }
}

export const supportedLanguages = [
  { label: "简体中文", value: "zh" },
  { label: "English", value: "en" },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]["value"];

export const resources = {
  en: { translation: en },
  zh: { translation: zh },
} as const;

const syncDocumentLanguage = (language: string) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
};

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
      load: "languageOnly",
      nonExplicitSupportedLngs: true,
      resources,
      supportedLngs: supportedLanguages.map(({ value }) => value),
    });
}

syncDocumentLanguage(i18next.resolvedLanguage ?? i18next.language);
i18next.on("languageChanged", syncDocumentLanguage);

export const i18n = i18next;
