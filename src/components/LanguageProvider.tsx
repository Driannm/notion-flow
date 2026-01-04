"use client";

import React, { createContext, useContext, useState } from "react";
import { dictionary, Language } from "@/lib/dictionary";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof dictionary.id; // Type definition otomatis ambil dari dictionary
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage directly
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("app-language");
      if (savedLang === "id" || savedLang === "en") {
        return savedLang;
      }
    }
    return "id";
  });

  // 2. Fungsi ganti bahasa & simpan ke LocalStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("app-language", lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: dictionary[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom Hook biar gampang dipanggil di mana saja
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}