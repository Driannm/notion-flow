/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  TrendingUp,
  Gift,
  DollarSign,
  ArrowUpRight,
  Wallet,
  Plus,
  Trash2,
  Calendar,
  MoreVertical,
  Download,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { dictionary, Language } from "@/lib/dictionary";
import { SwipeableItem } from "@/components/finance/expenses/swipeable-item";
import { deleteIncome } from "@/app/action/finance/getIncome";

// Icon Mapping
const SOURCE_ICONS: Record<string, any> = {
  Salary: Briefcase,
  Gaji: Briefcase,
  Freelance: ArrowUpRight,
  Proyek: ArrowUpRight,
  Investment: TrendingUp,
  Investasi: TrendingUp,
  Gift: Gift,
  Hadiah: Gift,
  Bonus: DollarSign,
  Other: Wallet,
  General: Wallet,
};

// Colors for Horizontal Breakdown Cards
const COLORS = [
  "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
  "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
  "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
  "text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400",
  "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400",
];

interface IncomeData {
  transactions: any[];
  breakdown: any[];
  totalIncome: number;
}

export default function IncomeClientView({ data }: { data: IncomeData }) {
  const router = useRouter();
  const [lang] = React.useState<Language>("id");
  const t = dictionary[lang];

  const handleDeleteTrigger = (id: string) => {
    if (confirm("Hapus data ini?")) {
      handleDelete(id);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteIncome(id);
    if (res.success) {
      toast.success("Data dihapus");
      router.refresh();
    } else {
      toast.error("Gagal menghapus");
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans pb-32 transition-colors duration-300">
      
      {/* 1. Header */}
      <div className="px-6 py-6 flex items-center justify-between sticky top-0 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
            <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors group"
            >
            <ArrowLeft className="w-6 h-6 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
            </button>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                {t.incomeTitle}
            </span>
        </div>
        <button className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            <MoreVertical className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      <div className="px-6 max-w-md mx-auto space-y-8">
        
        {/* 2. HERO CARD (Gradient Style) */}
        <div className="relative p-6 rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-200/50 dark:shadow-none overflow-hidden mt-2">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-100 text-xs font-bold uppercase tracking-widest">
                  {t.month.thisMonth}
                </span>
                <div className="bg-white/20 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Flow
                </div>
              </div>
              
              <div className="text-4xl font-extrabold tracking-tight mb-6">
                {formatCurrency(data.totalIncome).replace("Rp", "Rp ")}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="h-9 bg-white/20 hover:bg-white/30 text-white border-0 text-xs font-semibold backdrop-blur-sm px-4 rounded-xl">
                  <Download className="w-3.5 h-3.5 mr-2" /> {t.viewReport}
                </Button>
              </div>
            </div>
        </div>

        {/* 3. Breakdown Sources (Horizontal Clean UI) */}
        {data.breakdown.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                {t.sourcesBreakdown}
                </h3>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {data.breakdown.map((source, idx) => {
                const colorClass = COLORS[idx % COLORS.length];

                return (
                  <div
                    key={idx}
                    className="flex flex-col justify-between min-w-[150px] p-4 bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${colorClass}`}>
                        {source.percentage}%
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate mb-0.5">
                        {source.label}
                      </h4>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                        {formatCurrency(source.amount).replace("Rp", "")}
                      </p>
                    </div>
                    
                    {/* Mini Bar */}
                    <div className="h-1.5 w-full bg-zinc-50 dark:bg-zinc-800 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full rounded-full ${colorClass.split(" ")[0].replace("text-", "bg-")}`}
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Transactions List (Clean UI List) */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              {t.recentTransactions}
            </h3>
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-1 rounded-md font-medium">
              {data.transactions.length} items
            </span>
          </div>

          <div className="space-y-0">
            {data.transactions.length > 0 ? (
              data.transactions.map((item) => {
                const Icon = SOURCE_ICONS[item.source] || SOURCE_ICONS["General"];
                
                return (
                  <SwipeableItem
                    key={item.id}
                    onClick={() => router.push(`/finance/income/${item.id}`)}
                    onEdit={() => router.push(`/finance/income/${item.id}/edit`)}
                    onDelete={() => handleDeleteTrigger(item.id)}
                  >
                    {/* ITEM CARD: Clean Style */}
                    <div className="group flex items-center gap-4 py-4 px-4 bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm mb-3 transition-all active:scale-[0.98]">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">
                            {item.title}
                          </h4>
                          <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(item.amount).replace("Rp", "")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-zinc-400 dark:text-zinc-500">
                          <div className="flex items-center gap-2">
                             <span className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 px-2 py-0.5 rounded-md text-zinc-500 dark:text-zinc-400 font-medium">
                                {item.source}
                             </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-80">
                            <Calendar className="w-3 h-3" />
                            {item.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwipeableItem>
                );
              })
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 opacity-50">
                <WalletCards className="w-16 h-16 mb-4 stroke-1" />
                <p className="text-sm font-medium">{t.noData}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Floating Action Button (FAB) */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          className="h-14 w-14 rounded-[1.2rem] shadow-xl shadow-emerald-400/30 dark:shadow-emerald-900/50 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white pointer-events-auto flex items-center justify-center transition-transform active:scale-90"
          onClick={() => router.push("/finance/income/add")}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}