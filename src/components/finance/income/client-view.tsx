/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Calendar, ArrowLeft, Search, SlidersHorizontal, X, Plus, Briefcase, ArrowUpRight, TrendingUp, Gift, DollarSign, Wallet } from "lucide-react";

// Client Components yang kita PAKAI:
import EmptyState from "@/components/finance/EmptyState";
import FloatingActionButton from "@/components/finance/FloatingActionButton";
import StatsCard from "@/components/finance/StatsCard";
import { SwipeableItem } from "@/components/finance/SwipeableItem";
import DeleteAlertDialog from "@/components/finance/AlertDelete";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Logic & Data
import { deleteIncome } from "@/app/action/finance/getIncome";

// --- TYPES ---
interface Transaction {
  id: string;
  title: string;
  source: string;
  amount: number;
  date: string;
  dateObj: Date;
  bankAccount?: string;
}

interface Props {
  initialData: Transaction[];
}

// Icon Mapping
const SOURCE_ICONS: Record<string, React.ReactNode> = {
  Salary: <Briefcase className="w-5 h-5" />,
  Gaji: <Briefcase className="w-5 h-5" />,
  Freelance: <ArrowUpRight className="w-5 h-5" />,
  Proyek: <ArrowUpRight className="w-5 h-5" />,
  Investment: <TrendingUp className="w-5 h-5" />,
  Investasi: <TrendingUp className="w-5 h-5" />,
  Gift: <Gift className="w-5 h-5" />,
  Hadiah: <Gift className="w-5 h-5" />,
  Bonus: <DollarSign className="w-5 h-5" />,
  Other: <Wallet className="w-5 h-5" />,
  General: <Wallet className="w-5 h-5" />,
};

// --- HELPER FORMAT ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

const formatDisplayDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// --- COMPONENT START ---
export default function IncomeClientView({ initialData = [] }: Props) {
  const router = useRouter();

  // Transform data
  const safeInitialData = React.useMemo(() => {
    return initialData.map((item) => ({
      ...item,
      dateObj: item.dateObj instanceof Date ? item.dateObj : new Date(item.date),
    }));
  }, [initialData]);

  // --- STATE ---
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedSources, setSelectedSources] = React.useState<string[]>([]);
  const [sortOption, setSortOption] = React.useState<"latest" | "highest" | "lowest">("latest");
  const [monthIndex, setMonthIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // --- DEBOUNCE SEARCH ---
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- FILTER & SORT LOGIC ---
  const processedData = React.useMemo(() => {
    let data = [...safeInitialData];

    // 1. Filter by Month
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() - monthIndex, 1);
    data = data.filter(
      (t) =>
        t.dateObj.getMonth() === targetDate.getMonth() &&
        t.dateObj.getFullYear() === targetDate.getFullYear()
    );

    // 2. Filter by Search
    if (debouncedSearch) {
      const lower = debouncedSearch.toLowerCase();
      data = data.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.source.toLowerCase().includes(lower) ||
          (t.bankAccount && t.bankAccount.toLowerCase().includes(lower))
      );
    }

    // 3. Filter by Source
    if (selectedSources.length > 0) {
      data = data.filter((t) => selectedSources.includes(t.source));
    }

    // 4. Sort
    if (sortOption === "highest") data.sort((a, b) => b.amount - a.amount);
    else if (sortOption === "lowest") data.sort((a, b) => a.amount - b.amount);
    else data.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

    return { data, targetDate };
  }, [safeInitialData, monthIndex, debouncedSearch, selectedSources, sortOption]);

  // --- GROUPING LOGIC (By Month) ---
  const groupedTransactions = React.useMemo(() => {
    const groups: Record<
      string,
      {
        month: string;
        year: number;
        monthYear: string;
        items: Transaction[];
        total: number;
      }
    > = {};

    processedData.data.forEach((t) => {
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

    // Sort by date (newest first)
    return Object.values(groups).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      
      const monthIndex = (month: string) => {
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        return months.indexOf(month);
      };
      
      return monthIndex(b.month) - monthIndex(a.month);
    });
  }, [processedData.data]);

  // --- STATS CALCULATION ---
  const currentStats = React.useMemo(() => {
    const { data } = processedData;
    const total = data.reduce((sum, curr) => sum + curr.amount, 0);
    const avg = data.length > 0 ? total / data.length : 0;

    // Source breakdown
    const sourceBreakdown = data.reduce((acc, curr) => {
      if (!acc[curr.source]) {
        acc[curr.source] = { amount: 0, count: 0 };
      }
      acc[curr.source].amount += curr.amount;
      acc[curr.source].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    return {
      total,
      avg,
      count: data.length,
      sourceBreakdown,
    };
  }, [processedData]);

  // --- BREAKDOWN ITEMS ---
  const breakdownItems = React.useMemo(() => {
    const entries = Object.entries(currentStats.sourceBreakdown)
      .map(([source, data]) => ({
        source,
        amount: data.amount,
        percentage:
          currentStats.total > 0
            ? Math.round((data.amount / currentStats.total) * 100)
            : 0,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return entries;
  }, [currentStats.sourceBreakdown, currentStats.total]);

  // --- ACTIONS ---
  const paginate = (newDirection: number) => {
    const newIndex = monthIndex + newDirection;
    if (newIndex >= 0 && newIndex <= 1) {
      setDirection(newDirection);
      setMonthIndex(newIndex);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const res = await deleteIncome(deleteId);
    if (res.success) {
      setDeleteId(null);
      toast.success("Income deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete");
    }
    setIsDeleting(false);
  };

  const allSources = React.useMemo(
    () => Array.from(new Set(safeInitialData.map((t) => t.source))),
    [safeInitialData]
  );

  // Animation Variants
  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-32">
      {/* 1. HEADER (Manual) */}
      <div className="sticky top-0 z-30 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </button>
          <span className="font-semibold text-sm">Income</span>
          <div className="w-8" />
        </div>
      </div>

      <div className="pt-4 px-4 space-y-6">
        {/* 2. STATS CARD (Client Component) */}
        <div className="relative h-[200px] w-full">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={monthIndex}
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
                if (swipe < -1000) paginate(-1);
                else if (swipe > 1000) paginate(1);
              }}
              className="absolute w-full h-full"
            >
              <StatsCard
                title="Total Income"
                mainValue={formatCurrency(currentStats.total)}
                mainIcon={<Calendar className="w-5 h-5" />}
                subtitle={processedData.targetDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
                theme="income"
                stats={[
                  { label: "Transactions", value: currentStats.count, icon: null },
                  { label: "Average", value: formatCurrency(currentStats.avg), icon: null },
                  { label: "Sources", value: breakdownItems.length, icon: null },
                ]}
                swipeable={true}
                currentIndex={monthIndex}
                totalPages={2}
                onSwipe={paginate}
                direction={direction}
                className="h-full"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. SOURCE BREAKDOWN CARDS (Manual) */}
        {breakdownItems.length > 0 && (
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
                    key={idx}
                    className="min-w-[160px] p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${colorClass}`}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="mb-3">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate mb-0.5">
                        {item.source}
                      </h4>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                        {item.count} trans
                      </p>
                    </div>

                    <div className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2">
                      {formatCurrency(item.amount)}
                    </div>

                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorClass
                          .split(" ")[0]
                          .replace("text-", "bg-")
                          .replace("100", "500")}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. SEARCH & FILTER (Manual) */}
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
                  className="h-11 w-11 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm shrink-0"
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
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        Sort By
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSortOption("latest")}
                          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                            sortOption === "latest"
                              ? "bg-zinc-900 text-white border-zinc-900"
                              : "bg-white border-zinc-200 text-zinc-600"
                          }`}
                        >
                          Latest
                        </button>
                        <button
                          onClick={() => setSortOption("highest")}
                          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                            sortOption === "highest"
                              ? "bg-zinc-900 text-white border-zinc-900"
                              : "bg-white border-zinc-200 text-zinc-600"
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
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          Income Sources
                        </h3>
                        {selectedSources.length > 0 && (
                          <button
                            onClick={() => setSelectedSources([])}
                            className="text-xs text-red-500 font-medium"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allSources.map((source) => (
                          <button
                            key={source}
                            onClick={() => {
                              if (selectedSources.includes(source)) {
                                setSelectedSources((prev) =>
                                  prev.filter((s) => s !== source)
                                );
                              } else {
                                setSelectedSources((prev) => [...prev, source]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              selectedSources.includes(source)
                                ? "bg-zinc-900 text-white border-zinc-900"
                                : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
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
                      <Button className="w-full h-12 rounded-xl text-base">
                        Show Results
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* 5. TRANSACTIONS LIST (Manual dengan SwipeableItem) */}
        <div className="space-y-8">
          {groupedTransactions.length > 0 ? (
            groupedTransactions.map((group) => (
              <div key={group.monthYear} className="space-y-3">
                {/* Month Header */}
                <div className="flex justify-between items-end px-2">
                  <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    {group.month} {group.year}
                  </h3>
                  <span className="text-xs font-mono font-medium text-zinc-400 dark:text-zinc-500 font-semibold">
                    {formatCurrency(group.total)}
                  </span>
                </div>

                {/* Group by date within month */}
                {(() => {
                  const dateGroups: Record<string, Transaction[]> = {};
                  group.items.forEach((item) => {
                    const dateKey = item.dateObj.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    });
                    if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
                    dateGroups[dateKey].push(item);
                  });

                  const sortedDates = Object.entries(dateGroups).sort(
                    ([dateA], [dateB]) => {
                      const dayA = parseInt(dateA.split(" ")[0]);
                      const dayB = parseInt(dateB.split(" ")[0]);
                      return dayB - dayA;
                    }
                  );

                  return (
                    <div className="space-y-4">
                      {sortedDates.map(([date, items]) => (
                        <div key={date} className="space-y-2">
                          {/* Date Sub-header */}
                          <div className="flex justify-between items-center px-2">
                            <h4 className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                              {date}
                            </h4>
                            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                              {formatCurrency(
                                items.reduce((sum, item) => sum + item.amount, 0)
                              )}
                            </span>
                          </div>

                          {/* Transactions for this date */}
                          <div className="space-y-2">
                            {items.map((item) => {
                              const Icon =
                                SOURCE_ICONS[item.source] || SOURCE_ICONS["General"];

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
                                          <span className="text-xs text-zinc-400">
                                            {item.source}
                                          </span>
                                          {item.bankAccount && (
                                            <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                              {item.bankAccount}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-zinc-400 truncate">
                                          {item.date}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </SwipeableItem>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ))
          ) : (
            // EMPTY STATE (Client Component)
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
                } else {
                  router.push("/finance/income/add");
                }
              }}
            />
          )}
        </div>
      </div>

      {/* 6. FLOATING ACTION BUTTON (Client Component) */}
      <FloatingActionButton
        onClick={() => router.push("/finance/income/add")}
        icon="plus"
        variant="accent"
        position="bottom-center"
        label="Add Income"
        showLabel={false}
      />

      {/* 7. DELETE DIALOG */}
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