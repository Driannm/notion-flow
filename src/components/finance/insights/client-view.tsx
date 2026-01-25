"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { ICON_MAP } from "@/lib/constants";

interface StatGroup {
  totalCurrent: number;
  totalLast: number;
  percent: number;
  topCategories: { name: string; value: number }[];
}

interface ObligationGroup {
  totalRemaining: number;
  count: number;
}

interface InsightData {
  expense: StatGroup;
  income: StatGroup;
  debt: ObligationGroup;
  loan: ObligationGroup;
  netFlow: number;
}

const PercentBadge = ({
  percent,
  inverse = false,
}: {
  percent: number;
  inverse?: boolean;
}) => {
  const isPositive = percent > 0;
  const isGood = inverse ? !isPositive : isPositive;

  return (
    <div
      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
        isGood
          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {Math.abs(Math.round(percent))}% vs last month
    </div>
  );
};

export default function InsightsClientView({ data }: { data: InsightData }) {
  const router = useRouter();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* HEADER */}
      <div className="px-6 py-6 flex items-center justify-between sticky top-0 z-10 bg-zinc-50/90 dark:bg-zinc-950/80 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-zinc-600 dark:text-zinc-300" />
        </button>
        <span className="text-sm font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
          FULL REPORT
        </span>
        <div className="w-10" />
      </div>

      <div className="px-6 max-w-md mx-auto space-y-6">
        {/* NET CASH FLOW */}
        <div
          className={`p-6 rounded-[2rem] shadow-xl relative overflow-hidden ${
            data.netFlow >= 0
              ? "bg-zinc-900 text-white dark:bg-zinc-800"
              : "bg-red-600 text-white dark:bg-red-700"
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-70">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Net Cash Flow (This Month)
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 font-mono">
              {formatCurrency(data.netFlow)}
            </h1>
            <div className="text-xs opacity-80 font-medium">
              {data.netFlow >= 0
                ? "🎉 Great job! You are saving money."
                : "⚠️ Alert! You spent more than you earned."}
            </div>
          </div>
        </div>

        {/* INCOME & EXPENSE */}
        <div className="grid grid-cols-2 gap-4">
          {/* Income */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-[1.8rem] border border-zinc-100 dark:border-zinc-800 shadow-sm h-36 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400">
                <div className="p-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase">Income</span>
              </div>
              <div className="text-lg font-bold font-mono">
                {formatCurrency(data.income.totalCurrent)}
              </div>
            </div>
            <PercentBadge percent={data.income.percent} />
          </div>

          {/* Expense */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-[1.8rem] border border-zinc-100 dark:border-zinc-800 shadow-sm h-36 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
                <div className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase">Expense</span>
              </div>
              <div className="text-lg font-bold font-mono">
                {formatCurrency(data.expense.totalCurrent)}
              </div>
            </div>
            <PercentBadge percent={data.expense.percent} inverse />
          </div>
        </div>

        {/* TOP EXPENSES */}
        <div>
          <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 px-1">
            Top Expenses
          </h3>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
            {data.expense.topCategories.length > 0 ? (
              data.expense.topCategories.map((cat, idx) => {
                const Icon = ICON_MAP[cat.name] || ICON_MAP.default;
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold">{cat.name}</span>
                    </div>
                    <div className="text-sm font-bold font-mono">
                      {formatCurrency(cat.value)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-xs text-zinc-400 py-4">
                No expenses yet
              </div>
            )}
          </div>
        </div>

        {/* OBLIGATIONS */}
        <div>
          <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 px-1">
            Active Obligations
          </h3>
          <div className="space-y-3">
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 p-4 rounded-2xl flex justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-200/50 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-amber-700 dark:text-amber-300">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase">My Debts</div>
                  <div className="text-xs opacity-70">
                    {data.debt.count} active debts
                  </div>
                </div>
              </div>
              <div className="text-lg font-bold font-mono">
                {formatCurrency(data.debt.totalRemaining)}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 p-4 rounded-2xl flex justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-200/50 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-700 dark:text-blue-300">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase">Given Loans</div>
                  <div className="text-xs opacity-70">
                    {data.loan.count} active loans
                  </div>
                </div>
              </div>
              <div className="text-lg font-bold font-mono">
                {formatCurrency(data.loan.totalRemaining)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
