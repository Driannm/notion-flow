"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface CardData {
  id: number;
  type: "ATM" | "E-Money";
  name: string;
  owner: string;
  balance: number;
  bgColor: string;
  textColor: string;
}

interface CardWalletModalProps {
  loading: boolean;
  cards: CardData[];
  trigger: React.ReactNode;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const ChipIcon = () => (
  <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
    <rect x="0.5" y="0.5" width="35" height="27" rx="4.5"
      fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" />
    <rect x="13" y="0.5" width="10" height="27" fill="rgba(255,255,255,0.1)" />
    <rect x="0.5" y="9" width="35" height="10" fill="rgba(255,255,255,0.1)" />
    <rect x="13" y="9" width="10" height="10" rx="1"
      fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.4)" />
  </svg>
);

const ContactlessIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
      fill="rgba(255,255,255,0.15)" />
    <path d="M6.5 12a5.5 5.5 0 015.5-5.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8.5 12a3.5 3.5 0 013.5-3.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10.5 12a1.5 1.5 0 011.5-1.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="12" r="1" fill="white" />
  </svg>
);

const NetworkLogo = ({ type }: { type: "ATM" | "E-Money" }) => (
  <div className="flex items-center gap-1 opacity-80">
    {type === "ATM" ? (
      <>
        <div className="w-7 h-7 rounded-full bg-yellow-400 opacity-90" />
        <div className="w-7 h-7 rounded-full bg-orange-500 opacity-90 -ml-3" />
      </>
    ) : (
      <span className="text-white font-bold text-sm tracking-widest opacity-90">PAY</span>
    )}
  </div>
);

const CardItem = ({ card }: { card: CardData }) => {
  const [showBalance, setShowBalance] = useState(false);
  const last4 = card.id.toString().padStart(4, "0").slice(-4);

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-lg flex-shrink-0"
      style={{ background: card.bgColor, color: card.textColor, height: 160 }}
    >
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20"
        style={{ background: card.textColor }} />
      <div className="absolute -bottom-12 -left-6 w-40 h-40 rounded-full opacity-10"
        style={{ background: card.textColor }} />

      <div className="relative z-10 p-5 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60 mb-0.5">
              {card.type === "ATM" ? "Debit Card" : "E-Money"}
            </p>
            <p className="font-bold text-base leading-tight">{card.name}</p>
          </div>
          {card.type === "ATM" ? <ChipIcon /> : <ContactlessIcon />}
        </div>

        <div className="flex gap-3 items-center">
          {["••••", "••••", "••••"].map((dot, i) => (
            <span key={i} className="text-sm tracking-widest opacity-70">{dot}</span>
          ))}
          <span className="text-sm tracking-widest font-semibold">{last4}</span>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] uppercase tracking-widest opacity-50 mb-0.5">Card Holder</p>
            <p className="text-sm font-semibold uppercase tracking-wide">{card.owner}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest opacity-50 mb-0.5">Balance</p>
            <button
              onClick={() => setShowBalance((v) => !v)}
              className="text-sm font-bold font-mono tracking-tight transition-all duration-300"
              style={{ color: card.textColor }}
            >
              {showBalance ? formatCurrency(card.balance) : "IDR ••••••"}
            </button>
          </div>
          <NetworkLogo type={card.type} />
        </div>
      </div>
    </div>
  );
};

export default function CardWalletModal({
  loading,
  cards,
  trigger,
}: CardWalletModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">{trigger}</div>

      <Dialog open={open} onOpenChange={setOpen}>
        {/* ✅ TIDAK pakai overflow-hidden di sini — itu yang bikin scroll mati */}
        <DialogContent className="max-w-sm w-full bg-white dark:bg-[#0f0f13] border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-2xl">

          {/* Header */}
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  My Wallet
                </DialogTitle>
                {!loading && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {cards.length} card{cards.length !== 1 ? "s" : ""} saved
                  </p>
                )}
              </div>
              <DialogClose className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors text-gray-500 dark:text-gray-400 text-sm">
                ✕
              </DialogClose>
            </div>
          </DialogHeader>

          {/* Divider */}
          <div className="h-px bg-gray-100 dark:bg-white/5 -mx-6 mt-4" />

          {/* ✅ KUNCI FIX: pola -mx-6 max-h-[50vh] overflow-y-auto px-6 dari shadcn docs */}
          <div className="no-scrollbar -mx-6 max-h-[50vh] overflow-y-auto px-6 py-4 flex flex-col gap-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="h-[160px] w-full rounded-2xl flex-shrink-0 bg-gray-100 dark:bg-white/5"
                />
              ))
            ) : cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-3xl">
                  💳
                </div>
                <p className="text-sm font-medium">No cards added yet</p>
              </div>
            ) : (
              cards.map((card) => <CardItem key={card.id} card={card} />)
            )}
          </div>

          {/* Divider atas footer */}
          {!loading && <div className="h-px bg-gray-100 dark:bg-white/5 -mx-6" />}

          {/* Footer */}
          {!loading && (
            <div className="pt-4">
              <button className="w-full py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-150">
                + Add New Card
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}