"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { ArrowRight } from "lucide-react";

interface CardData {
  id: string;
  type: "ATM" | "E-Money";
  name: string;
  owner: string;
  balance: number;
  bgColor: string;
  textColor: string;
}

type TransferItem = {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
};

interface CardWalletModalProps {
  loading: boolean;
  cards: CardData[];
  transfers: TransferItem[];
  trigger: React.ReactNode;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

/* ==============================
   EMV CHIP SVG
================================ */
const EMVChip = () => (
  <svg width="42" height="32" viewBox="0 0 42 32" fill="none">
    <rect width="42" height="32" rx="5" fill="url(#chipGold)" />
    {/* Chip contact pads */}
    <rect x="1" y="1" width="40" height="30" rx="4" fill="url(#chipGold)" />
    <rect x="14" y="1" width="14" height="30" fill="#c8a845" opacity="0.4" />
    <rect x="1" y="10" width="40" height="12" fill="#c8a845" opacity="0.4" />
    <rect x="16" y="11" width="10" height="10" rx="2" fill="#b8952e" />
    <line x1="14" y1="1" x2="14" y2="31" stroke="#a07820" strokeWidth="0.5" />
    <line x1="28" y1="1" x2="28" y2="31" stroke="#a07820" strokeWidth="0.5" />
    <line x1="1" y1="10" x2="41" y2="10" stroke="#a07820" strokeWidth="0.5" />
    <line x1="1" y1="22" x2="41" y2="22" stroke="#a07820" strokeWidth="0.5" />
    <defs>
      <linearGradient id="chipGold" x1="0" y1="0" x2="42" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f5d97e" />
        <stop offset="40%" stopColor="#d4a827" />
        <stop offset="70%" stopColor="#e8c655" />
        <stop offset="100%" stopColor="#b8952e" />
      </linearGradient>
    </defs>
  </svg>
);

/* ==============================
   CONTACTLESS ICON
================================ */
const ContactlessIcon = ({ color = "white" }: { color?: string }) => (
  <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
    <path d="M10 11C10 11 7 8.5 7 6C7 4.34 8.34 3 10 3C11.66 3 13 4.34 13 6C13 8.5 10 11 10 11Z" fill="none" />
    <path d="M4.93 16.07C3.12 14.26 2 11.76 2 9C2 3.48 6.48 -1 12 -1" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M7.76 13.24C6.67 12.15 6 10.65 6 9C6 5.69 8.69 3 12 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <path d="M10.59 10.41C10.22 10.04 10 9.55 10 9C10 7.9 10.9 7 12 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
    {/* Central dot */}
    <circle cx="12" cy="9" r="1.5" fill={color} />
  </svg>
);

/* ==============================
   VISA LOGO
================================ */
const VisaLogo = ({ color = "white" }: { color?: string }) => (
  <svg width="52" height="18" viewBox="0 0 52 18" fill="none">
    <text x="0" y="15" fontFamily="Georgia, serif" fontSize="18" fontWeight="900" fontStyle="italic" fill={color} letterSpacing="-1">VISA</text>
  </svg>
);

/* ==============================
   MASTERCARD LOGO
================================ */
const MastercardLogo = () => (
  <div className="flex items-center -space-x-2">
    <div className="w-7 h-7 rounded-full bg-red-500 opacity-90" />
    <div className="w-7 h-7 rounded-full bg-amber-400 opacity-90" />
  </div>
);

/* ==============================
   CARD ITEM — REALISTIC ATM CARD
================================ */
const CardItem = ({ card, index }: { card: CardData; index: number }) => {
  const [showBalance, setShowBalance] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Format card number with groups
  const paddedId = card.id.padStart(16, "0");
  const groups = [
    paddedId.slice(0, 4),
    paddedId.slice(4, 8),
    paddedId.slice(8, 12),
    paddedId.slice(12, 16),
  ];

  const isEMoney = card.type === "E-Money";

  // Holographic shimmer colors per card
  const holoColors = [
    "from-purple-500/20 via-cyan-400/20 to-pink-500/20",
    "from-emerald-500/20 via-blue-400/20 to-violet-500/20",
    "from-rose-500/20 via-amber-400/20 to-orange-500/20",
  ];
  const holo = holoColors[index % holoColors.length];

  return (
    <div
      className="relative cursor-pointer select-none"
      style={{ perspective: "1000px" }}
      onClick={() => setIsFlipped((f) => !f)}
      title="Klik untuk balik kartu"
    >
      <div
        className="relative w-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          height: "200px",
        }}
      >
        {/* ===== FRONT FACE ===== */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Base gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${card.bgColor}ee 0%, ${card.bgColor}99 50%, ${card.bgColor}cc 100%)`,
            }}
          />

          {/* Holographic shimmer overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${holo} mix-blend-screen opacity-60`}
          />

          {/* Noise texture for depth */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px",
            }}
          />

          {/* Diagonal shine stripe */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background:
                "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)",
            }}
          />

          {/* Card content */}
          <div
            className="relative z-10 p-5 flex flex-col justify-between h-full"
            style={{ color: card.textColor }}
          >
            {/* TOP ROW */}
            <div className="flex justify-between items-start">
              <div>
                <p
                  className="text-[9px] uppercase tracking-[0.2em] mb-0.5"
                  style={{ color: `${card.textColor}99` }}
                >
                  {isEMoney ? "E-Money" : "Debit Card"}
                </p>
                <p className="font-bold text-base tracking-wide">{card.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {!isEMoney && (
                  <div className="opacity-80">
                    <ContactlessIcon color={card.textColor} />
                  </div>
                )}
                {isEMoney ? <MastercardLogo /> : <VisaLogo color={card.textColor} />}
              </div>
            </div>

            {/* CHIP ROW (only for ATM) */}
            {!isEMoney ? (
              <div className="flex items-center gap-3">
                <EMVChip />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full opacity-30"
                  style={{ background: card.textColor }}
                />
                <div
                  className="w-10 h-10 rounded-full -ml-5 opacity-30"
                  style={{ background: card.textColor }}
                />
              </div>
            )}

            {/* CARD NUMBER */}
            <div
              className="font-mono tracking-[0.22em] text-sm drop-shadow"
              style={{ color: card.textColor }}
            >
              {groups.map((g, i) => (
                <span key={i}>
                  {i < 3 ? "••••" : g}
                  {i < 3 ? " " : ""}
                </span>
              ))}
            </div>

            {/* BOTTOM ROW */}
            <div className="flex justify-between items-end">
              <div>
                <p
                  className="text-[8px] uppercase tracking-[0.15em] mb-0.5"
                  style={{ color: `${card.textColor}80` }}
                >
                  Card Holder
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest">
                  {card.owner}
                </p>
              </div>

              <div className="text-right">
                <p
                  className="text-[8px] uppercase tracking-[0.15em] mb-0.5"
                  style={{ color: `${card.textColor}80` }}
                >
                  Balance
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBalance((v) => !v);
                  }}
                  className="font-mono font-bold text-xs transition-all"
                  style={{ color: card.textColor }}
                >
                  {showBalance ? formatCurrency(card.balance) : "IDR ••••••"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== BACK FACE ===== */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `linear-gradient(135deg, ${card.bgColor}cc, ${card.bgColor}88)`,
          }}
        >
          {/* Magnetic stripe */}
          <div className="w-full h-11 bg-black/80 mt-7" />

          {/* Signature strip */}
          <div className="mx-5 mt-4">
            <div className="bg-white/90 rounded h-9 flex items-center justify-end px-3 gap-3">
              <span
                className="text-xs font-mono text-gray-800 tracking-widest italic"
                style={{ fontFamily: "cursive" }}
              >
                {card.owner}
              </span>
              <div className="bg-gray-200 rounded px-2 py-0.5">
                <span className="font-mono text-xs font-bold text-gray-700">
                  {card.id.slice(-3)}
                </span>
              </div>
            </div>
            <p className="text-[8px] text-white/50 mt-1 text-right">CVV</p>
          </div>

          {/* Bank info */}
          <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
            <p
              className="text-[8px] leading-tight"
              style={{ color: `${card.textColor}60` }}
            >
              This card is property of {card.name}.{"\n"}
              If found, please return to nearest branch.
            </p>
            {isEMoney ? <MastercardLogo /> : <VisaLogo color={card.textColor} />}
          </div>
        </div>
      </div>

      {/* Hint text */}
      <p className="text-center text-[9px] text-gray-400 mt-1.5 tracking-wide">
        Klik kartu untuk melihat bagian belakang
      </p>
    </div>
  );
};

/* ==============================
   MAIN COMPONENT
================================ */

export default function CardWalletModal({
  loading,
  cards,
  transfers,
  trigger,
}: CardWalletModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm w-full rounded-3xl p-6 bg-white dark:bg-[#0f0f13] border border-gray-200 dark:border-white/5 no-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">My Wallet</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid grid-cols-2 bg-gray-100 dark:bg-white/5 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transfers">Transfers</TabsTrigger>
            </TabsList>

            {/* ================= OVERVIEW ================= */}
            <TabsContent value="overview">
              <div className="space-y-6 mt-4 max-h-[55vh] overflow-y-auto pr-1">
                {loading ? (
                  <Skeleton className="h-[200px] rounded-2xl" />
                ) : cards.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No cards added yet
                  </div>
                ) : (
                  cards.map((card, i) => (
                    <CardItem key={card.id} card={card} index={i} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* ================= TRANSFERS ================= */}
            <TabsContent value="transfers">
              <div className="space-y-3 mt-4 max-h-[55vh] overflow-y-auto pr-1">
                {transfers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No transfers yet
                  </div>
                ) : (
                  transfers.map((trx) => (
                    <div
                      key={trx.id}
                      className="p-4 rounded-2xl border bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span>{trx.from}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span>{trx.to}</span>
                        </div>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(trx.amount)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(trx.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}