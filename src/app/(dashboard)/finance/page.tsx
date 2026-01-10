import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowRight,
  PieChart,
  Plus,
  ArrowLeftRight,
  WalletCards,
  Target,
  Home,
  PiggyBank,
  Receipt,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getFinancialInsights } from "@/app/action/finance/getInsights";
import { ICON_MAP } from "@/lib/constants";

// Format helper
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const dynamic = "force-dynamic";

export default async function FinanceDashboardV3() {
  const { success, data } = await getFinancialInsights();

  // Data Real dari Notion
  const stats = {
    expenses: data?.expense.totalCurrent || 0,
    income: data?.income.totalCurrent || 0,
    debts: data?.debt.totalRemaining || 0,
    loans: data?.loan.totalRemaining || 0,
    netFlow:
      (data?.income.totalCurrent || 0) - (data?.expense.totalCurrent || 0),
    topCategories: data?.expense.topCategories || [],
  };

  const isPositiveFlow = stats.netFlow >= 0;

  // Hitung persentase budget terpakai
  const budgetUsedPercent =
    stats.income > 0 ? Math.min((stats.expenses / stats.income) * 100, 100) : 0;

  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-24 transition-colors duration-300">
      
      {/* 1. Header Navigation */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-sm z-20 transition-colors">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">
              FINANCE HUB
            </h2>
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-none">
              Overview
            </h1>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4">
        
        {/* 2. Hero Card: Net Flow & Budget Health */}
        <div
          className={`p-6 rounded-[2rem] shadow-xl shadow-zinc-300/40 dark:shadow-none text-white relative overflow-hidden transition-colors duration-500 ${
            isPositiveFlow 
                ? "bg-zinc-900 dark:bg-zinc-800" 
                : "bg-red-600 dark:bg-red-800"
          }`}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 opacity-80">
                <Target className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Net Cash Flow
                </span>
              </div>
              {/* Savings Rate Badge */}
              {stats.income > 0 && (
                <div className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold backdrop-blur-md text-white">
                  {Math.round(100 - budgetUsedPercent)}% Saved
                </div>
              )}
            </div>

            <div className="text-4xl font-extrabold tracking-tight mb-4 text-white">
              {formatCurrency(stats.netFlow).replace("Rp", "Rp ")}
            </div>

            {/* Visual Budget Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-medium opacity-60 text-white">
                <span>Spent: {Math.round(budgetUsedPercent)}%</span>
                <span>Income Cap</span>
              </div>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${budgetUsedPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Decor */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        </div>

        {/* 3. Income & Expenses Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/finance/income" className="block group">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-[1.8rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all active:scale-98 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-16 h-16 text-green-600 dark:text-green-500" />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
                  Income
                </div>
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {formatCurrency(stats.income).replace("Rp", "IDR")}
                </div>
              </div>
            </div>
          </Link>

          <Link href="/finance/expenses" className="block group">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-[1.8rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all active:scale-98 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-16 h-16 text-red-600 dark:text-red-500" />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
                  Expense
                </div>
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {formatCurrency(stats.expenses).replace("Rp", "IDR")}
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 4. Debts & Loans Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Loans (Piutang / Uang kita di orang) */}
          <Link href="/finance/debts?tab=loans" className="block group">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-[1.8rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all active:scale-98 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <WalletCards className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
                  Loans
                </div>
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {formatCurrency(stats.loans).replace("Rp", "IDR")}
                </div>
              </div>
            </div>
          </Link>

          {/* Debts (Hutang Kita) */}
          <Link href="/finance/debts" className="block group">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-[1.8rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all active:scale-98 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <PiggyBank className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
                  My Debts
                </div>
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {formatCurrency(stats.debts).replace("Rp", "IDR")}
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 5. Top Spending Quick View */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <Receipt className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
              </div>
              <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                Top Spending
              </h3>
            </div>
            <Link href="/finance/expenses">
              <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats.topCategories.length > 0 ? (
              stats.topCategories.slice(0, 3).map((cat, i) => {
                const Icon = ICON_MAP[cat.name] || ICON_MAP.default;
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(cat.value).replace("Rp", "IDR")}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 py-2">
                No expenses yet this month.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-lg z-30 transition-colors">
        <div className="flex justify-around items-center py-3 px-6 max-w-md mx-auto">
          {/* Home Page */}
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>

          {/* Plus (Floating in Center) */}
          <div className="relative -mt-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group w-14 h-14 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full shadow-xl shadow-zinc-400/30 dark:shadow-black/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-zinc-50 dark:border-zinc-950">
                  <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                sideOffset={10}
                className="w-48 rounded-2xl p-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
                  Add Transaction
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                
                <Link href="/finance/expenses/add">
                  <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-xl focus:bg-red-50 dark:focus:bg-red-900/30 focus:text-red-600 dark:focus:text-red-400">
                    <TrendingDown className="w-4 h-4 text-red-500 dark:text-red-400" />
                    <span>Add Expense</span>
                  </DropdownMenuItem>
                </Link>
                
                <Link href="/finance/income/add">
                  <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-xl focus:bg-green-50 dark:focus:bg-green-900/30 focus:text-green-600 dark:focus:text-green-400">
                    <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />
                    <span>Add Income</span>
                  </DropdownMenuItem>
                </Link>
                
                <Link href="/finance/transfer/add">
                  <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-xl focus:bg-blue-50 dark:focus:bg-blue-900/30 focus:text-blue-600 dark:focus:text-blue-400">
                    <ArrowLeftRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span>Add Transfer</span>
                  </DropdownMenuItem>
                </Link>
                
                <Link href="/finance/debts/add?type=debt">
                  <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-xl focus:bg-amber-50 dark:focus:bg-amber-900/30 focus:text-amber-600 dark:focus:text-amber-400">
                    <WalletCards className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Add Debt</span>
                  </DropdownMenuItem>
                </Link>
                
                <Link href="/finance/debts/add?type=loan">
                  <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-xl focus:bg-blue-50 dark:focus:bg-blue-900/30 focus:text-blue-600 dark:focus:text-blue-400">
                    <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Add Loan</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Insight Page */}
          <Link
            href="/finance/insights"
            className="flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <PieChart className="w-6 h-6" />
            <span className="text-xs font-medium">Insights</span>
          </Link>
        </div>
      </div>
    </div>
  );
}