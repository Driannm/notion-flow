/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
"use client";

import {
  Bell,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Info,
  Plus,
  DollarSign,
  CreditCard,
  ArrowLeftRight,
  WalletCards,
  ChevronLeft,
  ChevronRight,
  BellDot,
  Home,
  LucideIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getFinancialInsights } from "@/app/action/finance/ActionInsights";
import Link from "next/link";
import QuickAdd from "@/components/finance/dashboard/QuickAdd";
import { BorderBeam } from "@/components/ui/border-beam";
import { useLanguage } from "@/components/LanguageProvider";
import { getRecentTransactions } from "@/app/action/finance/getRecentTransactions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import YourMoneySection from "@/components/finance/dashboard/BalanceSummary";
import BalanceHeader from "@/components/finance/dashboard/BalanceHeader";

// Format helper
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// Helper untuk generate warna
const generateColors = (count: number, isExpense: boolean) => {
  if (isExpense) {
    // Warna untuk expenses (red to orange spectrum)
    return Array.from({ length: count }, (_, i) => {
      const hue = 0 + i * 30; // 0-60 untuk merah-orange
      return `hsl(${hue}, 80%, 60%)`;
    });
  } else {
    // Warna untuk income (green to blue spectrum)
    return Array.from({ length: count }, (_, i) => {
      const hue = 120 + i * 40; // 120-200 untuk hijau-biru
      return `hsl(${hue}, 80%, 60%)`;
    });
  }
};

// Donut Chart Component
const DonutChart = ({
  data,
  title,
  total,
  isExpense = true,
  colors,
}: {
  data: Array<{ name: string; value: number }>;
  title: string;
  total: number;
  isExpense?: boolean;
  colors: string[];
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-48 h-48 rounded-full border-8 border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <span className="text-gray-400 dark:text-gray-500 text-sm">
            {t.noDataAvailable}
          </span>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{title}</p>
      </div>
    );
  }

  // Hitung total untuk persentase
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  // Generate chart segments
  let cumulativeAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / totalValue) * 100;
    const angle = (percentage / 100) * 360;

    const segment = {
      ...item,
      percentage,
      startAngle: cumulativeAngle,
      endAngle: cumulativeAngle + angle,
      color: colors[index % colors.length],
    };

    cumulativeAngle += angle;
    return segment;
  });

  // Donut chart configuration
  const size = 200;
  const strokeWidth = 40;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgb(229, 231, 235)"
            strokeWidth={strokeWidth}
            className="dark:stroke-gray-700"
          />

          {/* Segments */}
          {segments.map((segment, index) => {
            const strokeDasharray = `${
              (segment.percentage / 100) * circumference
            } ${circumference}`;
            const strokeDashoffset = 0;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transform: `rotate(${segment.startAngle}deg)`,
                  transformOrigin: "center",
                  opacity:
                    hoveredIndex === null || hoveredIndex === index ? 1 : 0.3,
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(total)}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {segments.length} {t.categories}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 w-full space-y-2">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-2 rounded-lg transition-all ${
              hoveredIndex === index ? "bg-gray-50 dark:bg-gray-800" : ""
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {segment.name}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(segment.value)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {segment.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [insightsData, setInsightsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<"expense" | "income">(
    "expense"
  );
  const { language, setLanguage, t } = useLanguage();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Swipe handler
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeChart === "expense") {
      setActiveChart("income");
    }

    if (isRightSwipe && activeChart === "income") {
      setActiveChart("expense");
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ success, data }, recent] = await Promise.all([
          getFinancialInsights(),
          getRecentTransactions(6),
        ]);

        if (success) {
          setInsightsData(data);
        }

        setRecentTransactions(recent || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Data dari Notion
  const expenseData = insightsData?.expense || {
    totalCurrent: 0,
    totalLast: 0,
    percent: 0,
    topCategories: [],
  };

  const incomeData = insightsData?.income || {
    totalCurrent: 0,
    totalLast: 0,
    percent: 0,
    topCategories: [],
  };

  const debtData = insightsData?.debt || { totalRemaining: 0, count: 0 };
  const loanData = insightsData?.loan || { totalRemaining: 0, count: 0 };
  const netFlowData = insightsData?.netFlow || 0;

  // Generate colors untuk chart
  const expenseColors = generateColors(
    expenseData.topCategories?.length || 0,
    true
  );

  const incomeColors = generateColors(
    incomeData.topCategories?.length || 0,
    false
  );

  // Hitung persentase budget terpakai
  const budgetUsedPercent =
    incomeData.totalCurrent > 0
      ? Math.min(
          (expenseData.totalCurrent / incomeData.totalCurrent) * 100,
          100
        )
      : 0;

  // Current balance
  const currentBalance =
    incomeData.totalCurrent - expenseData.totalCurrent + 87000;

  type NavItem = {
    icon: LucideIcon;
    label: string;
    active: boolean;
    href: string;
  };

  const navItems: NavItem[] = [
    {
      icon: TrendingUp,
      label: t.navIncome,
      active: false,
      href: "/finance/income",
    },
    {
      icon: WalletCards,
      label: t.navLoan,
      active: false,
      href: "/finance/debts-loans?type=loan",
    },
    {
      icon: CreditCard,
      label: t.navDebt,
      active: false,
      href: "/finance/debts-loans?type=debt",
    },
    {
      icon: TrendingDown,
      label: t.navExpense,
      active: false,
      href: "/finance/expenses",
    },
  ];

  const summaryCards = [
    {
      id: 1,
      title: t.income,
      icon: TrendingUp,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-500",
      amount: formatCurrency(incomeData.totalCurrent),
      info: t.monthlyIncome,
      change: incomeData.percent,
    },
    {
      id: 2,
      title: t.expenses,
      icon: TrendingDown,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-500",
      amount: formatCurrency(expenseData.totalCurrent),
      info: t.monthlyExpenses,
      change: expenseData.percent,
    },
    {
      id: 3,
      title: t.loan,
      icon: WalletCards,
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-500",
      amount: formatCurrency(loanData.totalRemaining),
      info: t.activeLoans,
      count: loanData.count,
    },
    {
      id: 4,
      title: t.debt,
      icon: CreditCard,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-500",
      amount: formatCurrency(debtData.totalRemaining),
      info: t.totalDebt,
      count: debtData.count,
    },
  ];

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const CARDS_PER_PAGE = 2;
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const pageWidth = container.offsetWidth;
    const index = Math.round(container.scrollLeft / pageWidth);

    setActiveCardIndex(index);
  };

  const scrollToIndex = (pageIndex: number) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    container.scrollTo({
      left: container.offsetWidth * pageIndex,
      behavior: "smooth",
    });

    setActiveCardIndex(pageIndex);
  };

  const totalPages = Math.ceil(summaryCards.length / 2);

  type GroupedTransactions = {
    monthYear: string;
    month: string;
    year: string;
    total: number;
    items: any[];
  };

  const groupedTransactions: GroupedTransactions[] = (() => {
    if (!recentTransactions.length) return [];

    const groups: Record<string, GroupedTransactions> = {};

    recentTransactions.forEach((trx) => {
      const dateObj = new Date(trx.date);
      const month = dateObj.toLocaleString("en-US", { month: "short" });
      const year = dateObj.getFullYear().toString();
      const monthYearKey = `${month}-${year}`;

      if (!groups[monthYearKey]) {
        groups[monthYearKey] = {
          monthYear: monthYearKey,
          month,
          year,
          total: 0,
          items: [],
        };
      }

      groups[monthYearKey].items.push({
        ...trx,
        dateObj,
        formattedDate: dateObj.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
      });

      groups[monthYearKey].total += trx.amount;
    });

    return Object.values(groups).sort(
      (a, b) =>
        new Date(b.items[0].date).getTime() -
        new Date(a.items[0].date).getTime()
    );
  })();

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md bg-gray-50 dark:bg-gray-900 min-h-screen relative shadow-2xl dark:shadow-none overflow-hidden flex flex-col">
        <main className="flex-1 scroll-smooth pb-24">
          <div className="relative">
            {/* Header Balance */}
            <BalanceHeader
              loading={loading}
              currentBalance={currentBalance}
              netFlowData={netFlowData}
            />

            <div className="px-4 space-y-4 -mt-20 relative z-10">
              {/* Your Money */}
              <YourMoneySection loading={loading} summaryCards={summaryCards} />

              {/* Dinamis Donut Chart dengan Swipe */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-0 p-5 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {activeChart === "expense"
                        ? t.expenseBreakdown
                        : t.incomeBreakdown}
                    </h2>
                    <Info className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>

                {/* Swipeable Chart Area */}
                <div
                  className="relative"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Swipe Indicators */}
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() => setActiveChart("expense")}
                      className={`flex items-center gap-1 text-sm ${
                        activeChart === "expense"
                          ? "text-red-500 dark:text-red-400 font-semibold"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t.expense}
                    </button>

                    <button
                      onClick={() => setActiveChart("income")}
                      className={`flex items-center gap-1 text-sm ${
                        activeChart === "income"
                          ? "text-green-500 dark:text-green-400 font-semibold"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {t.income}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Chart Container */}
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{
                        transform: `translateX(${
                          activeChart === "expense" ? "0%" : "-100%"
                        })`,
                      }}
                    >
                      {/* Expenses Chart */}
                      <div className="min-w-full">
                        <DonutChart
                          data={expenseData.topCategories || []}
                          title={t.totalExpenses}
                          total={expenseData.totalCurrent}
                          isExpense={true}
                          colors={expenseColors}
                        />
                      </div>

                      {/* Income Chart */}
                      <div className="min-w-full">
                        <DonutChart
                          data={incomeData.topCategories || []}
                          title={t.totalIncome}
                          total={incomeData.totalCurrent}
                          isExpense={false}
                          colors={incomeColors}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Swipe Dots Indicator */}
                  <div className="flex justify-center gap-2 mt-6">
                    <div
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        activeChart === "expense"
                          ? "bg-red-500 dark:bg-red-400 w-6"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                    <div
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        activeChart === "income"
                          ? "bg-green-500 dark:bg-green-400 w-6"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Insight Banner */}
              <div className="relative overflow-hidden rounded-full">
                {/* CONTENT CARD */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-5 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                        <BellDot className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-white font-medium text-sm">
                        {t.insightReady}
                      </p>
                    </div>
                    <a href="/finance/insights">
                      <button className="bg-white/20 hover:bg-white/30 text-white h-8 px-4 rounded-full text-xs font-semibold backdrop-blur-sm transition-all">
                        {t.checkNow}
                      </button>
                    </a>
                  </div>
                </div>

                {/* BORDER BEAM (langsung di parent, bukan di dalam card content) */}
                <BorderBeam
                  size={120}
                  duration={10}
                  borderWidth={1}
                  colorFrom="#a855f7"
                  colorTo="#6366f1"
                />
              </div>

              {/* Transactions */}
              <div className="space-y-4 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {t.recentTransactionsTitle}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t.todayFullDate}
                    </p>
                  </div>
                </div>

                <div className="space-y-8 pb-10">
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 rounded-2xl" />
                      <Skeleton className="h-24 rounded-2xl" />
                    </div>
                  ) : groupedTransactions.length > 0 ? (
                    groupedTransactions.map((group) => (
                      <div key={group.monthYear} className="space-y-3">
                        {/* Month Header */}
                        <div className="flex justify-between items-end px-2">
                          <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                            {group.month} {group.year}
                          </h3>
                          <span className="text-xs font-mono font-medium text-zinc-400 dark:text-zinc-500">
                            {formatCurrency(group.total)}
                          </span>
                        </div>

                        {/* Group by Date */}
                        {(() => {
                          const dateGroups: Record<string, any[]> = {};

                          group.items.forEach((item) => {
                            if (!dateGroups[item.formattedDate])
                              dateGroups[item.formattedDate] = [];
                            dateGroups[item.formattedDate].push(item);
                          });

                          return Object.entries(dateGroups).map(
                            ([date, items]) => (
                              <div key={date} className="space-y-2">
                                {/* Date Header */}
                                <div className="flex justify-between items-center px-2">
                                  <h4 className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                                    {date}
                                  </h4>
                                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                                    {formatCurrency(
                                      items.reduce(
                                        (sum, item) => sum + item.amount,
                                        0
                                      )
                                    )}
                                  </span>
                                </div>

                                {/* Cards */}
                                <div className="space-y-2">
                                  {items.map((item) => {
                                    const iconMap: Record<string, LucideIcon> =
                                      {
                                        expense: TrendingDown,
                                        income: TrendingUp,
                                        debt: CreditCard,
                                        loan: WalletCards,
                                      };

                                    const Icon = iconMap[item.type];
                                    const isNegative = item.amount < 0;

                                    return (
                                      <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors"
                                      >
                                        <div
                                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            isNegative
                                              ? "bg-red-100 dark:bg-red-900/20 text-red-500"
                                              : "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500"
                                          }`}
                                        >
                                          <Icon className="w-5 h-5" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-center mb-0.5">
                                            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate pr-2">
                                              {item.title}
                                            </h4>
                                            <span
                                              className={`font-bold text-sm font-mono ${
                                                isNegative
                                                  ? "text-red-500"
                                                  : "text-emerald-500"
                                              }`}
                                            >
                                              {isNegative ? "-" : "+"}
                                              {formatCurrency(
                                                Math.abs(item.amount)
                                              )}
                                            </span>
                                          </div>

                                          <div className="flex justify-between items-center">
                                            <span className="text-xs text-zinc-400 uppercase tracking-wide">
                                              {item.type}
                                            </span>
                                            <p className="text-xs text-zinc-400">
                                              {item.dateObj.toLocaleDateString()}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )
                          );
                        })()}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-zinc-400">
                      {t.noTransactionData}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Clean & Minimalist Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-30">
          <div className="relative mx-3 mb-3">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full shadow-lg dark:shadow-gray-900/30 border border-gray-100/80 dark:border-gray-800/80">
              <div className="flex items-center justify-between px-2 py-2">
                {navItems.slice(0, 2).map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className="flex flex-col items-center gap-0.5 px-3 py-1.5"
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span className="text-[10px] font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
                <QuickAdd />
                {navItems.slice(2).map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={index + 2}
                      href={item.href}
                      className="flex flex-col items-center gap-0.5 px-3 py-1.5"
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span className="text-[10px] font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
