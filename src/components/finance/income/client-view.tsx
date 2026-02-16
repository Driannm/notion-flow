/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  X,
  Briefcase,
  TrendingUp,
  Gift,
  BadgeDollarSign,
  CircleDollarSign,
  Landmark,
  Building2,
  Laptop,
} from "lucide-react";

import EmptyState from "@/components/finance/EmptyState";
import FloatingActionButton from "@/components/finance/FloatingActionButton";
import StatsCard from "@/components/finance/StatsCard";
import { SwipeableItem } from "@/components/finance/SwipeableItem";
import DeleteAlertDialog from "@/components/finance/AlertDelete";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

import { deleteIncome } from "@/app/action/finance/ActionIncome";

// Define types
interface Transaction {
  id: string;
  title: string;
  source: string;
  amount: number;
  date: string;
  dateObj: Date;
  bankAccount?: string;
}

interface MonthGroup {
  month: string;
  year: number;
  monthYear: string;
  items: Transaction[];
  total: number;
}

interface Props {
  initialData: Transaction[];
}

// Constants
const SOURCE_ICONS: Record<string, React.ReactNode> = {
  Salary: <Briefcase className="w-5 h-5" />,
  Freelance: <Laptop className="w-5 h-5" />,
  Business: <Building2 className="w-5 h-5" />,
  Investment: <TrendingUp className="w-5 h-5" />,
  Dividend: <Landmark className="w-5 h-5" />,
  Gift: <Gift className="w-5 h-5" />,
  Bonus: <BadgeDollarSign className="w-5 h-5" />,
  Other: <CircleDollarSign className="w-5 h-5" />,
};

// Animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

// Skeleton Components
const StatsCardSkeleton = () => (
  <div className="h-[200px] w-full p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-40" />
      </div>
      <Skeleton className="h-10 w-10 rounded-xl" />
    </div>
    <div className="space-y-3 mt-6">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

const SourceBreakdownSkeleton = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between px-2">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="min-w-[160px] p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex justify-between items-start mb-3">
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <div className="mb-3">
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-6 w-28 mb-2" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

const TransactionItemSkeleton = () => (
  <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-300 dark:border-zinc-700 shadow-md">
    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

const TransactionGroupSkeleton = () => (
  <div className="space-y-3">
    <div className="flex justify-between items-end px-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="space-y-2">
      <div className="flex justify-between items-center px-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <TransactionItemSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

export default function IncomeClientView({ initialData = [] }: Props) {
  const router = useRouter();

  // Loading states
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isStatsLoading, setIsStatsLoading] = React.useState(true);
  const [isBreakdownLoading, setIsBreakdownLoading] = React.useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = React.useState(true);

  // Normalize initial data
  const safeInitialData = React.useMemo(() => {
    return initialData.map((item) => ({
      ...item,
      dateObj: item.dateObj instanceof Date ? item.dateObj : new Date(item.date),
    }));
  }, [initialData]);

  // State
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedSources, setSelectedSources] = React.useState<string[]>([]);
  const [sortOption, setSortOption] = React.useState<"latest" | "highest" | "lowest">("latest");
  const [yearIndex, setYearIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Simulate progressive loading
  React.useEffect(() => {
    // Stats card loads first
    const statsTimer = setTimeout(() => {
      setIsStatsLoading(false);
    }, 300);

    // Breakdown loads next
    const breakdownTimer = setTimeout(() => {
      setIsBreakdownLoading(false);
    }, 600);

    // Transactions load last
    const transactionsTimer = setTimeout(() => {
      setIsTransactionsLoading(false);
      setIsInitialLoading(false);
    }, 900);

    return () => {
      clearTimeout(statsTimer);
      clearTimeout(breakdownTimer);
      clearTimeout(transactionsTimer);
    };
  }, []);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get all unique sources
  const allSources = React.useMemo(() => {
    const sources = new Set(safeInitialData.map((t) => t.source));
    return Array.from(sources).sort();
  }, [safeInitialData]);

  // Filter and sort data
  const processedData = React.useMemo(() => {
    let data = [...safeInitialData];

    // Apply search filter
    if (debouncedSearch) {
      const lower = debouncedSearch.toLowerCase();
      data = data.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.source.toLowerCase().includes(lower) ||
          (t.bankAccount && t.bankAccount.toLowerCase().includes(lower))
      );
    }

    // Apply source filter
    if (selectedSources.length > 0) {
      data = data.filter((t) => selectedSources.includes(t.source));
    }

    // Apply sorting
    if (sortOption === "highest") {
      data.sort((a, b) => b.amount - a.amount);
    } else if (sortOption === "lowest") {
      data.sort((a, b) => a.amount - b.amount);
    } else {
      data.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
    }

    return data;
  }, [safeInitialData, debouncedSearch, selectedSources, sortOption]);

  // Group by month and year
  const groupedTransactions = React.useMemo(() => {
    const groups: Record<string, MonthGroup> = {};

    processedData.forEach((t) => {
      const month = t.dateObj.toLocaleDateString("en-US", { month: "long" });
      const year = t.dateObj.getFullYear();
      const monthYear = `${month} ${year}`;

      if (!groups[monthYear]) {
        groups[monthYear] = {
          month,
          year,
          monthYear,
          items: [],
          total: 0,
        };
      }

      groups[monthYear].items.push(t);
      groups[monthYear].total += t.amount;
    });

    return Object.values(groups).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      return months.indexOf(b.month) - months.indexOf(a.month);
    });
  }, [processedData]);

  // Get available years
  const availableYears = React.useMemo(() => {
    const years = new Set(processedData.map((t) => t.dateObj.getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [processedData]);

  // Get active year
  const activeYear = availableYears[yearIndex] || new Date().getFullYear();

  // Calculate stats for active year
  const currentStats = React.useMemo(() => {
    const yearData = processedData.filter((t) => t.dateObj.getFullYear() === activeYear);

    const total = yearData.reduce((sum, curr) => sum + curr.amount, 0);
    const avg = yearData.length > 0 ? total / yearData.length : 0;

    const sourceBreakdown = yearData.reduce(
      (acc, curr) => {
        if (!acc[curr.source]) {
          acc[curr.source] = { amount: 0, count: 0 };
        }
        acc[curr.source].amount += curr.amount;
        acc[curr.source].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; count: number }>
    );

    return {
      total,
      avg,
      count: yearData.length,
      sourceBreakdown,
    };
  }, [processedData, activeYear]);

  // Create breakdown items for display
  const breakdownItems = React.useMemo(() => {
    return Object.entries(currentStats.sourceBreakdown)
      .map(([source, data]) => ({
        source,
        amount: data.amount,
        count: data.count,
        percentage: currentStats.total > 0 ? Math.round((data.amount / currentStats.total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentStats]);

  // Pagination handler
  const paginate = (newDirection: number) => {
    const maxIndex = availableYears.length - 1;
    const newIndex = yearIndex + newDirection;

    if (newIndex >= 0 && newIndex <= maxIndex) {
      setDirection(newDirection);
      setYearIndex(newIndex);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const res = await deleteIncome(deleteId);
      if (res.success) {
        setDeleteId(null);
        toast.success("Income deleted successfully");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete income");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </button>
          <span className="font-semibold text-sm">Income</span>
          <div className="w-8" />
        </div>
      </div>

      <div className="pt-4 px-4 space-y-6">
        {/* Stats Card with Skeleton */}
        {isStatsLoading ? (
          <StatsCardSkeleton />
        ) : availableYears.length > 0 ? (
          <div className="relative h-[200px] w-full">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeYear}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -1000) paginate(1);
                  else if (swipe > 1000) paginate(-1);
                }}
                className="absolute w-full h-full"
              >
                <StatsCard
                  title="Total Income"
                  mainValue={formatCurrency(currentStats.total)}
                  mainIcon={<Calendar className="w-5 h-5" />}
                  subtitle={activeYear.toString()}
                  theme="income"
                  stats={[
                    { label: "Transactions", value: currentStats.count, icon: null },
                    { label: "Average", value: formatCurrency(currentStats.avg), icon: null },
                    { label: "Sources", value: breakdownItems.length, icon: null },
                  ]}
                  swipeable={true}
                  currentIndex={yearIndex}
                  totalPages={availableYears.length}
                  onSwipe={paginate}
                  direction={direction}
                  className="h-full"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}

        {/* Source Breakdown with Skeleton */}
        {isBreakdownLoading ? (
          <SourceBreakdownSkeleton />
        ) : breakdownItems.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Sources Breakdown
              </h3>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                {currentStats.count} transactions
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {breakdownItems.map((item, idx) => {
                const colors = [
                  "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
                  "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  "bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
                  "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
                ];
                const colorClass = colors[idx % colors.length];

                return (
                  <div
                    key={item.source}
                    className="min-w-[160px] p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${colorClass}`}>
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="mb-3">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate mb-0.5">
                        {item.source}
                      </h4>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                        {item.count} {item.count === 1 ? "trans" : "trans"}
                      </p>
                    </div>

                    <div className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2">
                      {formatCurrency(item.amount)}
                    </div>

                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorClass.split(" ")[0].replace("bg-", "").replace("100", "500")}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Search & Filter */}
        <div className="sticky top-[57px] z-20 -mx-4 px-4 pb-2 pt-2 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-transparent transition-all">
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
              <Input
                placeholder="Search income..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-zinc-100 dark:bg-zinc-900 border-none shadow-none rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700 placeholder:text-zinc-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-zinc-200 dark:bg-zinc-800 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm shrink-0 relative"
                >
                  <SlidersHorizontal className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                  {(selectedSources.length > 0 || sortOption !== "latest") && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" />
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader>
                    <DrawerTitle>Filters & Sort</DrawerTitle>
                    <DrawerDescription>Customize your view.</DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 space-y-6">
                    {/* Sort Section */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sort By</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSortOption("latest")}
                          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                            sortOption === "latest"
                              ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900"
                              : "bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                          }`}
                        >
                          Latest
                        </button>
                        <button
                          onClick={() => setSortOption("highest")}
                          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                            sortOption === "highest"
                              ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900"
                              : "bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                          }`}
                        >
                          Highest
                        </button>
                      </div>
                    </div>

                    <Separator />

                    {/* Source Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Income Sources</h3>
                        {selectedSources.length > 0 && (
                          <button onClick={() => setSelectedSources([])} className="text-xs text-red-500 font-medium">
                            Reset
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allSources.map((source) => (
                          <button
                            key={source}
                            onClick={() => {
                              setSelectedSources((prev) =>
                                prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              selectedSources.includes(source)
                                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900"
                                : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                            }`}
                          >
                            {source}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button className="w-full h-12 rounded-xl text-base">Show Results</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* Transactions List with Skeleton */}
        <div className="space-y-8">
          {isTransactionsLoading ? (
            <>
              <TransactionGroupSkeleton />
              <TransactionGroupSkeleton />
            </>
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

                {/* Group by date within month */}
                {(() => {
                  const dateGroups: Record<string, Transaction[]> = {};
                  group.items.forEach((item: Transaction) => {
                    const dateKey = item.dateObj.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    });
                    if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
                    dateGroups[dateKey].push(item);
                  });

                  return Object.entries(dateGroups)
                    .sort(([dateA], [dateB]) => {
                      const dayA = parseInt(dateA.split(" ")[0]);
                      const dayB = parseInt(dateB.split(" ")[0]);
                      return dayB - dayA;
                    })
                    .map(([date, items]) => (
                      <div key={date} className="space-y-2">
                        {/* Date Sub-header */}
                        <div className="flex justify-between items-center px-2">
                          <h4 className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{date}</h4>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                            {formatCurrency(items.reduce((sum, item) => sum + item.amount, 0))}
                          </span>
                        </div>

                        {/* Transactions for this date */}
                        <div className="space-y-2">
                          {items.map((item) => {
                            const Icon = SOURCE_ICONS[item.source] || SOURCE_ICONS.Other;

                            return (
                              <SwipeableItem
                                key={item.id}
                                onClick={() => router.push(`/finance/income/${item.id}`)}
                                onEdit={() => router.push(`/finance/income/${item.id}/edit`)}
                                onDelete={() => setDeleteId(item.id)}
                              >
                                <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700 shadow-md hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-emerald-400">
                                    {Icon}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate pr-2">
                                        {item.title}
                                      </h4>
                                      <span className="font-bold text-sm font-mono text-emerald-500 dark:text-emerald-400">
                                        +{formatCurrency(item.amount)}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-400">{item.source}</span>
                                        {item.bankAccount && (
                                          <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                            {item.bankAccount}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-zinc-400">{item.date}</p>
                                    </div>
                                  </div>
                                </div>
                              </SwipeableItem>
                            );
                          })}
                        </div>
                      </div>
                    ));
                })()}
              </div>
            ))
          ) : (
            <EmptyState
              type="income"
              title={searchTerm || selectedSources.length > 0 ? "No matching income" : "No income yet"}
              description={
                searchTerm || selectedSources.length > 0
                  ? "Try adjusting your search or filters"
                  : "Add your first income source to get started"
              }
              actionLabel={searchTerm || selectedSources.length > 0 ? "Clear filters" : "Add Income"}
              onAction={() => {
                if (searchTerm || selectedSources.length > 0) {
                  setSearchTerm("");
                  setSelectedSources([]);
                  setSortOption("latest");
                } else {
                  router.push("/finance/income/add");
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => router.push("/finance/income/add")}
        icon="plus"
        variant="accent"
        position="bottom-center"
        label="Add Income"
        showLabel={false}
      />

      {/* Delete Dialog */}
      <DeleteAlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Income?"
        description="This action cannot be undone. The income record will be permanently removed."
      />
    </div>
  );
}