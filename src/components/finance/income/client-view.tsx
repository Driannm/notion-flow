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
  Calendar,
  MoreVertical,
  Download,
  WalletCards,
  X,
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
  "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
  "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10",
  "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10",
  "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10",
  "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10",
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 font-sans pb-24 selection:bg-zinc-200 dark:selection:bg-zinc-700">
      
      {/* 1. TOP NAV (Minimal & Clean) */}
      <div className="flex items-center justify-between px-6 py-6 sticky top-0 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm z-20">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
        </button>
        <span className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
          {t.incomeTitle}
        </span>
        <button className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
          <MoreVertical className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      <div className="px-6 max-w-md mx-auto">
        
        {/* 2. HERO SECTION (Big Numbers Style) */}
        <div className="flex flex-col items-center mb-8">
          <label className="text-xs font-bold uppercase tracking-widest mb-2 text-emerald-600 dark:text-emerald-400">
            {t.month.thisMonth}
          </label>
          <div className="relative w-full">
            <div className="w-full text-center text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white">
              {formatCurrency(data.totalIncome)}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-6">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-9 text-xs font-semibold rounded-xl border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Download className="w-3.5 h-3.5 mr-2" /> 
              {t.viewReport}
            </Button>
          </div>
        </div>

        {/* 3. BREAKDOWN SOURCES (Horizontal Cards) */}
        {data.breakdown.length > 0 && (
          <div className="mb-8">
            <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 block">
              {t.sourcesBreakdown}
            </label>
            
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {data.breakdown.map((source, idx) => {
                const colorClass = COLORS[idx % COLORS.length];
                const bgColor = colorClass.split(" ")[1];

                return (
                  <div
                    key={idx}
                    className="flex flex-col justify-between min-w-[140px] p-4 bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-100 dark:border-zinc-700 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${colorClass}`}>
                        {source.percentage}%
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate mb-1">
                        {source.label}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        {formatCurrency(source.amount)}
                      </p>
                    </div>
                    
                    {/* Mini Progress Bar */}
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${bgColor.replace("bg-", "bg-").split(" ")[0]}`}
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. TRANSACTIONS LIST */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              {t.recentTransactions}
            </label>
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-1 rounded-md font-medium">
              {data.transactions.length} items
            </span>
          </div>

          {data.transactions.length > 0 ? (
            <div className="space-y-3">
              {data.transactions.map((item) => {
                const Icon = SOURCE_ICONS[item.source] || SOURCE_ICONS["General"];
                
                return (
                  <SwipeableItem
                    key={item.id}
                    onClick={() => router.push(`/finance/income/${item.id}`)}
                    onEdit={() => router.push(`/finance/income/${item.id}/edit`)}
                    onDelete={() => handleDeleteTrigger(item.id)}
                  >
                    <div className="group flex items-center gap-4 py-4 px-5 bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-100 dark:border-zinc-700 shadow-sm transition-all active:scale-[0.98]">
                      
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-700/50 flex items-center justify-center text-zinc-400 dark:text-zinc-500 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate pr-2">
                            {item.title}
                          </h4>
                          <span className="font-bold text-base text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="bg-zinc-50 dark:bg-zinc-700 border border-zinc-100 dark:border-zinc-600 px-2 py-0.5 rounded-md text-zinc-500 dark:text-zinc-400 font-medium">
                            {item.source}
                          </span>
                          <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                            <Calendar className="w-3 h-3" />
                            {item.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwipeableItem>
                );
              })}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-600">
              <WalletCards className="w-16 h-16 mb-4 stroke-1" />
              <p className="text-sm font-medium">{t.noData}</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. FLOATING ADD BUTTON */}
      <div className="fixed bottom-6 left-0 w-full px-6 z-20">
        <Button 
          onClick={() => router.push("/finance/income/add")}
          className="w-full h-14 rounded-[2rem] bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl shadow-zinc-300/50 dark:shadow-zinc-950/50 text-lg font-medium transition-transform active:scale-95 flex items-center justify-center gap-2 max-w-md mx-auto"
        >
          <Plus className="w-5 h-5" />
          Add Income
        </Button>
      </div>

    </div>
  );
}