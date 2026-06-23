"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  Plus, X, Pencil, Trash2, Loader2, Check,
} from "lucide-react";
import {
  getWalletData,
  addTransfer,
  updateTransfer,
  deleteTransfer,
  getTransferById,
} from "@/app/action/finance/getCard";

/* ============================================================
   TYPES
============================================================ */
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
  title: string;
  from: string;
  fromId: string;
  to: string;
  toId: string;
  amount: number;
  fee: number;
  totalDeduction: number;
  date: string;
};

type ModalState =
  | { type: "none" }
  | { type: "add" }
  | { type: "detail"; id: string }
  | { type: "edit"; id: string };

/* ============================================================
   HELPERS
============================================================ */
const fmt = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

const fmtDate = (s: string) =>
  s ? new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

const today = () => new Date().toISOString().split("T")[0];

/* ============================================================
   CARD ICONS
============================================================ */
const EMVChip = () => (
  <svg width="42" height="32" viewBox="0 0 42 32" fill="none">
    <rect width="42" height="32" rx="5" fill="url(#cg)" />
    <rect x="1" y="1" width="40" height="30" rx="4" fill="url(#cg)" />
    <rect x="14" y="1" width="14" height="30" fill="#c8a845" opacity="0.4" />
    <rect x="1" y="10" width="40" height="12" fill="#c8a845" opacity="0.4" />
    <rect x="16" y="11" width="10" height="10" rx="2" fill="#b8952e" />
    <line x1="14" y1="1" x2="14" y2="31" stroke="#a07820" strokeWidth="0.5" />
    <line x1="28" y1="1" x2="28" y2="31" stroke="#a07820" strokeWidth="0.5" />
    <line x1="1" y1="10" x2="41" y2="10" stroke="#a07820" strokeWidth="0.5" />
    <line x1="1" y1="22" x2="41" y2="22" stroke="#a07820" strokeWidth="0.5" />
    <defs>
      <linearGradient id="cg" x1="0" y1="0" x2="42" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f5d97e" /><stop offset="40%" stopColor="#d4a827" />
        <stop offset="70%" stopColor="#e8c655" /><stop offset="100%" stopColor="#b8952e" />
      </linearGradient>
    </defs>
  </svg>
);

const ContactlessIcon = ({ color = "white" }: { color?: string }) => (
  <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
    <path d="M4.93 16.07C3.12 14.26 2 11.76 2 9C2 3.48 6.48 -1 12 -1" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M7.76 13.24C6.67 12.15 6 10.65 6 9C6 5.69 8.69 3 12 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <path d="M10.59 10.41C10.22 10.04 10 9.55 10 9C10 7.9 10.9 7 12 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
    <circle cx="12" cy="9" r="1.5" fill={color} />
  </svg>
);

const VisaLogo = ({ color = "white" }: { color?: string }) => (
  <svg width="52" height="18" viewBox="0 0 52 18" fill="none">
    <text x="0" y="15" fontFamily="Georgia, serif" fontSize="18" fontWeight="900" fontStyle="italic" fill={color} letterSpacing="-1">VISA</text>
  </svg>
);

const MastercardLogo = () => (
  <div className="flex items-center -space-x-2">
    <div className="w-7 h-7 rounded-full bg-red-500 opacity-90" />
    <div className="w-7 h-7 rounded-full bg-amber-400 opacity-90" />
  </div>
);

/* ============================================================
   CARD ITEM
============================================================ */
const CardItem = ({ card, index }: { card: CardData; index: number }) => {
  const [showBalance, setShowBalance] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const isEMoney = card.type === "E-Money";
  const paddedId = card.id.replace(/-/g, "").slice(0, 16).padEnd(16, "0");
  const groups = [paddedId.slice(0,4), paddedId.slice(4,8), paddedId.slice(8,12), paddedId.slice(12,16)];
  const holos = [
    "from-purple-500/20 via-cyan-400/20 to-pink-500/20",
    "from-emerald-500/20 via-blue-400/20 to-violet-500/20",
    "from-rose-500/20 via-amber-400/20 to-orange-500/20",
  ];

  return (
    <div className="relative cursor-pointer select-none w-full" style={{ perspective: "1000px" }} onClick={() => setIsFlipped(f => !f)}>
      <div className="relative w-full transition-transform duration-700" style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)", height: "200px" }}>
        {/* FRONT */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl" style={{ backfaceVisibility: "hidden" }}>
          <div className="absolute inset-0" style={{ background: card.bgColor.includes("gradient") ? card.bgColor : `linear-gradient(135deg,${card.bgColor}ee,${card.bgColor}99)` }} />
          <div className={`absolute inset-0 bg-gradient-to-br ${holos[index % 3]} mix-blend-screen opacity-60`} />
          <div className="absolute inset-0 opacity-10" style={{ background: "linear-gradient(115deg,transparent 40%,rgba(255,255,255,.8) 50%,transparent 60%)" }} />
          <div className="relative z-10 p-5 flex flex-col justify-between h-full" style={{ color: card.textColor }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] mb-0.5" style={{ color: `${card.textColor}99` }}>{isEMoney ? "E-Money" : "Debit Card"}</p>
                <p className="font-bold text-base tracking-wide">{card.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {!isEMoney && <ContactlessIcon color={card.textColor} />}
                {isEMoney ? <MastercardLogo /> : <VisaLogo color={card.textColor} />}
              </div>
            </div>
            {!isEMoney ? <EMVChip /> : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full opacity-30" style={{ background: card.textColor }} />
                <div className="w-10 h-10 rounded-full -ml-5 opacity-30" style={{ background: card.textColor }} />
              </div>
            )}
            <div className="font-mono tracking-[0.22em] text-sm" style={{ color: card.textColor }}>
              {groups.map((g, i) => <span key={i}>{i < 3 ? "••••" : g}{i < 3 ? " " : ""}</span>)}
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[8px] uppercase tracking-[0.15em] mb-0.5" style={{ color: `${card.textColor}80` }}>Card Holder</p>
                <p className="text-xs font-semibold uppercase tracking-widest">{card.owner}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase tracking-[0.15em] mb-0.5" style={{ color: `${card.textColor}80` }}>Balance</p>
                <button onClick={e => { e.stopPropagation(); setShowBalance(v => !v); }} className="font-mono font-bold text-xs" style={{ color: card.textColor }}>
                  {showBalance ? fmt(card.balance) : "IDR ••••••"}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* BACK */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: card.bgColor.includes("gradient") ? card.bgColor : `linear-gradient(135deg,${card.bgColor}cc,${card.bgColor}88)` }}>
          <div className="w-full h-11 bg-black/80 mt-7" />
          <div className="mx-5 mt-4">
            <div className="bg-white/90 rounded h-9 flex items-center justify-end px-3 gap-3">
              <span className="text-xs font-mono text-gray-800 tracking-widest italic" style={{ fontFamily: "cursive" }}>{card.owner}</span>
              <div className="bg-gray-200 rounded px-2 py-0.5"><span className="font-mono text-xs font-bold text-gray-700">{card.id.slice(-3)}</span></div>
            </div>
            <p className="text-[8px] text-white/50 mt-1 text-right">CVV</p>
          </div>
          <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
            <p className="text-[8px] leading-tight" style={{ color: `${card.textColor}60` }}>This card is property of {card.name}.{"\n"}If found, please return to nearest branch.</p>
            {isEMoney ? <MastercardLogo /> : <VisaLogo color={card.textColor} />}
          </div>
        </div>
      </div>
      <p className="text-center text-[9px] text-white/40 mt-2 tracking-wide">Tap card to flip</p>
    </div>
  );
};

/* ============================================================
   SHARED INPUT STYLES
============================================================ */
const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all";
const selectCls = `${inputCls} appearance-none`;

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase tracking-widest text-white/40 font-medium">{label}</label>
    {children}
  </div>
);

/* ============================================================
   TRANSFER FORM (Add & Edit shared)
============================================================ */
interface TransferFormProps {
  cards: CardData[];
  initial?: { fromId: string; toId: string; amount: number; fee: number; date: string };
  onSubmit: (fd: FormData) => Promise<{ success: boolean; message?: string }>;
  onClose: () => void;
  submitLabel: string;
}

const TransferForm = ({ cards, initial, onSubmit, onClose, submitLabel }: TransferFormProps) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.current) return;
    setBusy(true); setError("");
    const res = await onSubmit(new FormData(ref.current));
    setBusy(false);
    if (res.success) { setDone(true); setTimeout(onClose, 900); }
    else setError(res.message || "Terjadi kesalahan.");
  };

  return (
    <form ref={ref} onSubmit={handle} className="space-y-4 mt-2">
      <div className="grid grid-cols-2 gap-3">
        <Field label="From">
          <select name="fromId" defaultValue={initial?.fromId ?? ""} required className={selectCls}>
            <option value="" disabled className="bg-[#0d0d1a]">Pilih kartu</option>
            {cards.map(c => <option key={c.id} value={c.id} className="bg-[#0d0d1a]">{c.name}</option>)}
          </select>
        </Field>
        <Field label="To">
          <select name="toId" defaultValue={initial?.toId ?? ""} required className={selectCls}>
            <option value="" disabled className="bg-[#0d0d1a]">Pilih kartu</option>
            {cards.map(c => <option key={c.id} value={c.id} className="bg-[#0d0d1a]">{c.name}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Amount (IDR)">
        <input name="amount" type="number" min={1} defaultValue={initial?.amount || ""} placeholder="0" required className={inputCls} />
      </Field>

      <Field label="Transfer Fee (IDR)">
        <input name="fee" type="number" min={0} defaultValue={initial?.fee ?? 0} placeholder="0" className={inputCls} />
      </Field>

      <Field label="Date">
        <input name="date" type="date" defaultValue={initial?.date ?? today()} required className={inputCls} />
      </Field>

      {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-all">
          Batal
        </button>
        <button type="submit" disabled={busy || done} className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-60">
          {done ? <Check className="w-4 h-4 text-green-600" /> : busy ? <Loader2 className="w-4 h-4 animate-spin" /> : submitLabel}
        </button>
      </div>
    </form>
  );
};

/* ============================================================
   MODAL SHELL (bottom sheet)
============================================================ */
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-sm bg-[#0d0d1a] border border-white/8 rounded-t-3xl px-6 pt-5 pb-10 shadow-2xl">
      {/* drag handle */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/15" />
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold text-base">{title}</h3>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 transition-all">
          <X className="w-4 h-4 text-white/50" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

/* ============================================================
   DETAIL MODAL
============================================================ */
const DetailModal = ({ id, onClose, onEdit, onDeleted }: { id: string; onClose: () => void; onEdit: () => void; onDeleted: () => void }) => {
  const [data, setData] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    getTransferById(id).then(r => { if (r.success) setData(r.data); });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm) { setConfirm(true); return; }
    setDeleting(true);
    await deleteTransfer(id);
    onDeleted();
  };

  return (
    <Modal title="Detail Transfer" onClose={onClose}>
      {!data ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-white/30 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {/* Header card */}
          <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-xl font-mono">{data.title}</p>
              <p className="text-white/35 text-xs mt-0.5">{data.dateFormatted}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Total Deducted</p>
              <p className="text-blue-300 font-mono font-bold text-base">{fmt(data.totalDeduction)}</p>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4">
            <div className="flex-1 text-center">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">From</p>
              <p className="text-white text-sm font-semibold">{data.from}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <ArrowRight className="w-4 h-4 text-white/25 flex-shrink-0" />
            <div className="w-px h-8 bg-white/10" />
            <div className="flex-1 text-center">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">To</p>
              <p className="text-white text-sm font-semibold">{data.to}</p>
            </div>
          </div>

          {/* Amount breakdown */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Amount</p>
              <p className="text-white text-sm font-semibold font-mono">{fmt(data.amount)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Fee</p>
              <p className="text-white text-sm font-semibold font-mono">{fmt(data.fee)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                confirm
                  ? "bg-red-500/15 border border-red-500/30 text-red-400"
                  : "border border-white/10 text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {confirm ? "Yakin hapus?" : "Hapus"}
            </button>
            <button
              onClick={onEdit}
              className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-white/90 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

/* ============================================================
   EDIT MODAL
============================================================ */
const EditModal = ({ id, cards, onClose, onSaved }: { id: string; cards: CardData[]; onClose: () => void; onSaved: () => void }) => {
  const [initial, setInitial] = useState<TransferFormProps["initial"] | null>(null);

  useEffect(() => {
    getTransferById(id).then(r => {
      if (r.success && r.data) {
        setInitial({ fromId: r.data.fromId, toId: r.data.toId, amount: r.data.amount, fee: r.data.fee, date: r.data.date });
      }
    });
  }, [id]);

  return (
    <Modal title="Edit Transfer" onClose={onClose}>
      {!initial ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-white/30 animate-spin" /></div>
      ) : (
        <TransferForm cards={cards} initial={initial} onSubmit={fd => updateTransfer(id, fd)} onClose={onSaved} submitLabel="Simpan" />
      )}
    </Modal>
  );
};

/* ============================================================
   SKELETONS
============================================================ */
const CardSkeleton = () => <div className="w-full h-[200px] rounded-2xl bg-white/10 animate-pulse" />;

const TransferSkeleton = () => (
  <div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-4 border-b border-white/5">
        <div className="w-10 h-10 rounded-2xl bg-white/10 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
          <div className="h-2.5 bg-white/10 rounded animate-pulse w-1/3" />
        </div>
        <div className="h-3 bg-white/10 rounded animate-pulse w-20" />
      </div>
    ))}
  </div>
);

/* ============================================================
   TRANSFER ROW
============================================================ */
const TransferRow = ({ trx, onDetail }: { trx: TransferItem; onDetail: () => void }) => (
  <div className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0 cursor-pointer group" onClick={onDetail}>
    <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center flex-shrink-0 transition-all">
      <ArrowRight className="w-4 h-4 text-white/40" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 text-sm font-medium text-white/90">
        <span className="truncate max-w-[80px]">{trx.from}</span>
        <ArrowRight className="w-3 h-3 text-white/30 flex-shrink-0" />
        <span className="truncate max-w-[80px]">{trx.to}</span>
      </div>
      <p className="text-xs text-white/35 mt-0.5">{fmtDate(trx.date)}</p>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-sm font-semibold text-blue-300 font-mono">{fmt(trx.totalDeduction)}</p>
      {trx.fee > 0 && <p className="text-[10px] text-white/25 font-mono mt-0.5">+{fmt(trx.fee)} fee</p>}
    </div>
  </div>
);

/* ============================================================
   PAGE
============================================================ */
export default function WalletPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CardData[]>([]);
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "card">("all");
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const load = () => {
    setLoading(true);
    getWalletData().then(({ cards, transfers }) => {
      setCards(cards as CardData[]);
      setTransfers(transfers as TransferItem[]);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const closeModal = () => { setModal({ type: "none" }); load(); };

  const activeCard = cards[activeCardIndex] ?? null;
  const filteredTransfers = activeTab === "all"
    ? transfers
    : transfers.filter(t => t.from === activeCard?.name || t.to === activeCard?.name);

  const totalBalance = cards.reduce((s, c) => s + c.balance, 0);

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(125% 125% at 50% 100%, #000000 40%, #010133 100%)" }}>

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-white font-semibold text-base tracking-wide">My Wallet</h1>
        <button onClick={() => setModal({ type: "add" })} className="p-2 rounded-full hover:bg-white/10 transition-all group" title="Tambah Transfer">
          <Plus className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* TOTAL BALANCE */}
      <div className="text-center mt-2 mb-6 px-6">
        {loading ? (
          <div className="h-8 w-40 bg-white/10 rounded-full animate-pulse mx-auto" />
        ) : (
          <>
            <p className="text-white/40 text-[10px] tracking-widest uppercase mb-1">Total Balance</p>
            <p className="text-white text-3xl font-bold font-mono tracking-tight">{fmt(totalBalance)}</p>
          </>
        )}
      </div>

      {/* CARD CAROUSEL */}
      <div className="px-6">
        {loading ? <CardSkeleton /> : cards.length === 0 ? (
          <div className="h-[200px] rounded-2xl border border-white/10 flex items-center justify-center">
            <p className="text-white/30 text-sm">No cards added yet</p>
          </div>
        ) : (
          <>
            <div className="relative">
              <CardItem card={cards[activeCardIndex]} index={activeCardIndex} />
              {cards.length > 1 && (
                <>
                  <button onClick={() => setActiveCardIndex(i => (i - 1 + cards.length) % cards.length)} className="absolute left-0 top-[96px] -translate-x-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={() => setActiveCardIndex(i => (i + 1) % cards.length)} className="absolute right-0 top-[96px] translate-x-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </>
              )}
            </div>
            {cards.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-4">
                {cards.map((_, i) => (
                  <button key={i} onClick={() => setActiveCardIndex(i)}>
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${i === activeCardIndex ? "w-5 bg-white" : "w-1.5 bg-white/25"}`} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* TRANSFERS */}
      <div className="mt-8 px-6 pb-28">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white/70 text-sm font-semibold tracking-wide">Transfers</h2>
          {!loading && cards.length > 0 && (
            <div className="flex bg-white/5 rounded-full p-0.5 gap-0.5">
              <button onClick={() => setActiveTab("all")} className={`text-xs px-3 py-1 rounded-full transition-all ${activeTab === "all" ? "bg-white text-black font-semibold" : "text-white/40"}`}>All</button>
              <button onClick={() => setActiveTab(activeTab === "card" ? "all" : "card")} className={`text-xs px-3 py-1 rounded-full transition-all ${activeTab === "card" ? "bg-white text-black font-semibold" : "text-white/40"}`}>This Card</button>
            </div>
          )}
        </div>

        {loading ? <TransferSkeleton /> : filteredTransfers.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-white/20 text-sm">No transfers found</p>
          </div>
        ) : (
          filteredTransfers.map(trx => (
            <TransferRow key={trx.id} trx={trx} onDetail={() => setModal({ type: "detail", id: trx.id })} />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setModal({ type: "add" })}
        className="fixed bottom-8 right-6 w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl hover:bg-white/90 active:scale-95 transition-all z-40"
      >
        <Plus className="w-6 h-6 text-black" />
      </button>

      {/* MODALS */}
      {modal.type === "add" && (
        <Modal title="Tambah Transfer" onClose={closeModal}>
          <TransferForm cards={cards} onSubmit={addTransfer} onClose={closeModal} submitLabel="Tambah" />
        </Modal>
      )}

      {modal.type === "detail" && (
        <DetailModal
          id={modal.id}
          onClose={closeModal}
          onEdit={() => setModal({ type: "edit", id: modal.id })}
          onDeleted={closeModal}
        />
      )}

      {modal.type === "edit" && (
        <EditModal id={modal.id} cards={cards} onClose={closeModal} onSaved={closeModal} />
      )}
    </div>
  );
}