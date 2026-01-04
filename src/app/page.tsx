// src/app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/LanguageProvider"; // 1. Import Hook
import {
  Wallet,
  StickyNote,
  ArrowUpRight,
  Sparkles,
  MoreHorizontal,
  ChevronRight,
  Plus,
  Laptop2Icon,
  Settings,
  X,
  Globe,
  Moon,
  Sun,
  LogOut,
  User,
} from "lucide-react";

export default function MainDashboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // 2. Panggil Hook Bahasa
  const { language, setLanguage, t } = useLanguage();

  // Mock Data (Contoh penggunaan dinamis)
  const financePreview = {
    balance: 15450000,
    lastTx: `${t.lastTx} +12.000.000`, // Menggunakan teks dari dictionary
  };

  const notesPreview = {
    count: 12,
    latest: "Ide Kado Ulang Tahun...",
  };

  const formatIDR = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-300">
      {/* HEADER */}
      <div className="pt-8 pb-6 px-6 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
            NOTION OS
          </h2>
          {/* Menggunakan t.greeting */}
          <h1 className="text-2xl font-extrabold tracking-tight">
            {t.greeting}
          </h1>
        </div>

        {/* Tombol Profile / Settings */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="relative group w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 shadow-sm overflow-hidden active:scale-95 transition-transform"
        >
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-zinc-900 relative">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </div>

      <div className="px-6 pb-24">
        {/* WIDGET FINANCE */}
        <Link href="/finance">
          <div className="group relative w-full bg-zinc-900 dark:bg-zinc-900 rounded-[2rem] p-6 text-white shadow-xl shadow-zinc-300/50 dark:shadow-black/50 mb-6 overflow-hidden transition-transform active:scale-98">
            {/* ... dekorasi background ... */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-800 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/5">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-zinc-400 bg-zinc-800/50 px-3 py-1 rounded-full">
                  {/* Menggunakan t.finance */}
                  <span>{t.finance}</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>

              <div>
                {/* Menggunakan t.balance */}
                <p className="text-sm text-zinc-400 mb-1">{t.balance}</p>
                <h3 className="text-3xl font-bold tracking-tight mb-2">
                  {formatIDR(financePreview.balance).replace("Rp", "Rp ")}
                </h3>
                <div className="inline-flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
                  <ArrowUpRight className="w-3 h-3" />
                  {financePreview.lastTx}
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* GRID APPS */}
        <div className="grid grid-cols-2 gap-4">
          {/* NOTES */}
          <Link href="/notes" className="col-span-1">
            <div className="group bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm h-48 flex flex-col justify-between hover:shadow-md transition-all active:scale-95 cursor-pointer relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-10 dark:text-white">
                <StickyNote className="w-24 h-24" />
              </div>

              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                <StickyNote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  {t.notes}
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  {notesPreview.count} {t.activeNotes}
                </p>
              </div>
            </div>
          </Link>

          {/* WORK */}
          <button className="col-span-1 text-left">
            <div className="group bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm h-48 flex flex-col justify-between hover:shadow-md transition-all active:scale-95 cursor-pointer relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-10 dark:text-white">
                <Laptop2Icon className="w-24 h-24" />
              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                <Laptop2Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  {t.work}
                </h4>
                <p className="text-xs text-zinc-400 mt-1">{t.comingSoon}</p>
              </div>
            </div>
          </button>

          {/* WISHLIST */}
          <div className="col-span-2">
            <div className="group bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between hover:shadow-md transition-all active:scale-98 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {t.wishlist}
                  </h4>
                  <p className="text-xs text-zinc-400">{t.track}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-10 text-center opacity-30 dark:opacity-20">
          <p className="text-[10px] uppercase font-bold tracking-widest mb-2">
            {t.designed}
          </p>
        </div>
      </div>

      {/* --- SETTINGS MODAL --- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSettingsOpen(false)}
          ></div>

          <div className="bg-white dark:bg-zinc-900 w-full max-w-md p-6 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 duration-200">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-6"></div>

            <div className="flex items-center justify-between mb-8">
              {/* Menggunakan t.settingsTitle */}
              <h2 className="text-xl font-bold dark:text-white">
                {t.settingsTitle}
              </h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PROFILE SHORT */}
            <div className="flex items-center gap-4 mb-8 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                  Sayang
                </h3>
                <p className="text-xs text-zinc-500">Premium User</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* 1. LANGUAGE SETTING (RILL FITUR) */}
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="font-medium dark:text-zinc-200">
                    {t.langLabel}
                  </span>
                </div>

                {/* Toggle Bahasa Real */}
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full">
                  <button
                    onClick={() => setLanguage("id")} // Mengubah Context Global
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      language === "id"
                        ? "bg-white dark:bg-zinc-600 shadow-sm text-zinc-900 dark:text-white"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    }`}
                  >
                    ID
                  </button>
                  <button
                    onClick={() => setLanguage("en")} // Mengubah Context Global
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      language === "en"
                        ? "bg-white dark:bg-zinc-600 shadow-sm text-zinc-900 dark:text-white"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* 2. DARK MODE */}
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center">
                    {theme === "dark" ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                  </div>
                  <span className="font-medium dark:text-zinc-200">
                    {t.darkMode}
                  </span>
                </div>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${
                    theme === "dark"
                      ? "bg-zinc-800 border border-zinc-700"
                      : "bg-zinc-200"
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                      theme === "dark" ? "translate-x-6" : "translate-x-0"
                    }`}
                  >
                    {theme === "dark" ? (
                      <Moon className="w-3 h-3 text-zinc-900" />
                    ) : (
                      <Sun className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                </button>
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-4" />

              {/* 3. EDIT PROFILE */}
              <button className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors text-left">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium dark:text-zinc-200 block text-sm">
                    {t.editProfile}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300" />
              </button>
            </div>

            {/* LOGOUT */}
            <div className="mt-8">
              <button className="w-full py-4 rounded-xl border border-red-100 dark:border-red-900/30 text-red-500 bg-red-50 dark:bg-red-900/10 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                <LogOut className="w-4 h-4" />
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
