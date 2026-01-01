"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Plus,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ICON_MAP } from "@/lib/constants";

interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  dateObj: Date;
  paymentMethod: string;
}

interface Props {
  initialData: Transaction[];
  totalExpense: number;
}

export default function ExpensesClientView({
  initialData,
  totalExpense,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("All");

  const [currentMonthFormatted] = React.useState(() => {
    return new Date().toLocaleDateString("id-ID", {
      month: "long",
    });
  });

  // Format Currency IDR
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  // 1. Generate Unique Categories dari Data untuk Filter Tabs
  const categories = [
    "All",
    ...Array.from(new Set(initialData.map((t) => t.category))),
  ];

  // 2. Filter Logic
  const filteredTransactions =
    activeTab === "All"
      ? initialData
      : initialData.filter((t) => t.category === activeTab);

  // 3. Generate Chart Data (Weekly based on current week)
  // Logic sederhana: map transaction ke hari dalam seminggu
  const weeklyChartData = React.useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const stats = days.map((day) => ({ day, amount: 0, active: false }));

    const today = new Date();
    const currentDayIndex = today.getDay(); // 0 = Sunday
    stats[currentDayIndex].active = true;

    // Filter transaksi 7 hari terakhir
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 6);

    initialData.forEach((t) => {
      if (t.dateObj >= oneWeekAgo && t.dateObj <= today) {
        const dayName = days[t.dateObj.getDay()];
        const stat = stats.find((s) => s.day === dayName);
        if (stat) stat.amount += t.amount;
      }
    });

    // Normalisasi tinggi bar (max height logic)
    const maxVal = Math.max(...stats.map((s) => s.amount), 1); // avoid div by 0
    return stats.map((s) => ({
      ...s,
      heightClass: `h-[${Math.max(
        Math.round((s.amount / maxVal) * 100),
        10
      )}%]`, // Tailwind dynamic value limitation workaround below
      heightPercent: Math.max(Math.round((s.amount / maxVal) * 100), 10), // Use inline style for height
    }));
  }, [initialData]);

  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col relative bg-background text-foreground shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="-ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="font-semibold text-lg">Expenses</div>
          <Button variant="ghost" size="icon" className="-mr-2">
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Total Expense Card */}
        <div className="p-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-red-100 text-sm font-medium">
                Total Spending (Month)
              </span>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs text-white backdrop-blur-sm">
                <Calendar className="w-3 h-3" />
                <span>{currentMonthFormatted}</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(totalExpense)}
            </div>
            <div className="text-xs text-red-100/80">Based on Notion Data</div>

            {/* Quick Stats */}
            {/* <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
              <div>
                <div className="text-xs text-white mb-1">
                  Biggest
                </div>
                <div className="text-sm font-semibold text-white">
                  {formatCurrency(stats.totalIncome).replace("Rp", "")}
                  20000
                </div>
              </div>
              <div>
                <div className="text-xs text-white mb-1">
                  Smalles
                </div>
                <div className="text-sm font-semibold text-white">
                  {formatCurrency(stats.totalExpenses).replace("Rp", "")}
                  20000
                </div>
              </div>
              <div>
                <div className="text-xs text-white mb-1">
                  Avarage
                </div>
                <div className="text-sm font-semibold text-white">
                  {formatCurrency(stats.totalDebts).replace("Rp", "")}
                  20000
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="px-4 mb-6">
          <div className="flex items-end justify-between gap-2 h-40 p-4 border border-border rounded-xl bg-card">
            {weeklyChartData.map((stat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 flex-1 h-full justify-end"
              >
                {/* Bar */}
                <div className="w-full relative group h-full flex items-end justify-center">
                  {/* Tooltip */}
                  {stat.amount > 0 && (
                    <div className="hidden group-hover:block absolute -top-8 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow z-20 whitespace-nowrap">
                      {formatCurrency(stat.amount)}
                    </div>
                  )}
                  <div
                    style={{ height: `${stat.heightPercent}%` }}
                    className={`w-full rounded-t-sm transition-all duration-500 min-h-[4px] ${
                      stat.active
                        ? "bg-red-500"
                        : "bg-red-200 dark:bg-red-900/30"
                    }`}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {stat.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Filters */}
        <div className="px-4 mb-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            <Button variant="outline" size="icon" className="shrink-0 w-9 h-9">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === cat
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="px-4 mt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Recent Transactions</h3>
            <span className="text-xs text-muted-foreground">
              {filteredTransactions.length} items
            </span>
          </div>

          <div className="space-y-3">
            {filteredTransactions.map((item) => {
              // Get Icon from Map based on Category Name
              const IconComponent =
                ICON_MAP[item.category] || ICON_MAP["default"];

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-red-500/10 text-red-500">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 ">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-semibold text-sm truncate pr-2">
                        {item.title}
                      </h4>
                      <span className="font-semibold text-sm text-red-500 shrink-0">
                        - {formatCurrency(item.amount).replace("Rp", "")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {item.paymentMethod}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.date}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No transactions found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-1/2 translate-x-1/2 max-w-md w-full px-4 flex justify-end pointer-events-none">
        <Button
          className="h-14 w-14 rounded-full shadow-xl bg-red-600 hover:bg-red-700 pointer-events-auto"
          onClick={() => router.push("/finance/expenses/add")}
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </div>
    </div>
  );
}
