"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Locale, TranslationValue } from "./translations";
import { t as translateFn, tArr as translateArrFn } from "./translations";

interface I18nContextType {
  locale: Locale;
  toggleLocale: () => void;
  t: (path: string) => string;
  tArr: (path: string) => TranslationValue[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "certichain_locale";

function getInitialLocale(): Locale {
  try {
    if (typeof window === "undefined") return "vi";
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "vi" || stored === "en") return stored;
  } catch { /* noop */ }
  return "vi";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("vi");

  useEffect(() => {
    setLocale(getInitialLocale());
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(prev => {
      const next = prev === "vi" ? "en" : "vi";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const translate = useCallback((path: string) => translateFn(locale, path), [locale]);
  const translateArr = useCallback((path: string) => translateArrFn(locale, path), [locale]);

  return (
    <I18nContext.Provider value={{ locale, toggleLocale, t: translate, tArr: translateArr }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
