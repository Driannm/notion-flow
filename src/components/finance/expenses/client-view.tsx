/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Calendar, ChevronLeft, Search, SlidersHorizontal, X, Plus } from "lucide-react";

// Client Components yang kita PAKAI:
import EmptyState from "@/components/finance/EmptyState";
import FloatingActionButton from "@/components/finance/FloatingActionButton";
import StatsCard from "@/components/finance/StatsCard";

// Component lain yang masih manual:
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
import { deleteExpense } from "@/app/action/finance/getExpenses";
import { ICON_MAP } from "@/lib/constants";

// --- TYPES ---
interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  dateObj: Date;
  paymentMethod: string;
  fee?: number;
  discount?: number;
  subtotal?: number;
}

interface Props {
  initialData: Transaction[];
}

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

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// --- COMPONENT START ---
export default function ExpensesClientView({ initialData }: Props) {
  const router = useRouter();

  // --- STATE ---
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
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
    let data = [...initialData];

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
          t.category.toLowerCase().includes(lower)
      );
    }

    // 3. Filter by Category
    if (selectedCategories.length > 0) {
      data = data.filter((t) => selectedCategories.includes(t.category));
    }

    // 4. Sort
    if (sortOption === "highest") data.sort((a, b) => b.amount - a.amount);
    else if (sortOption === "lowest") data.sort((a, b) => a.amount - b.amount);
    else data.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

    return { data, targetDate };
  }, [initialData, monthIndex, debouncedSearch, selectedCategories, sortOption]);

  // --- GROUPING LOGIC ---
  const groupedTransactions = React.useMemo(() => {
    const groups: Record<string, { date: Date; items: Transaction[]; total: number }> = {};

    processedData.data.forEach((t) => {
      const key = formatDateKey(t.dateObj);
      if (!groups[key]) {
        groups[key] = { date: t.dateObj, items: [], total: 0 };
      }
      groups[key].items.push(t);
      groups[key].total += t.amount;
    });

    return Object.keys(groups)
      .sort()
      .reverse()
      .map((key) => groups[key]);
  }, [processedData.data]);

  // --- STATS CALCULATION ---
  const currentStats = React.useMemo(() => {
    const { data } = processedData;
    return data.reduce(
      (acc, curr) => ({
        total: acc.total + curr.amount,
        fee: acc.fee + (curr.fee || 0),
        discount: acc.discount + (curr.discount || 0),
        subtotal: acc.subtotal + (curr.subtotal || curr.amount),
      }),
      { total: 0, fee: 0, discount: 0, subtotal: 0 }
    );
  }, [processedData]);

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
    const res = await deleteExpense(deleteId);
    if (res.success) {
      setDeleteId(null);
      toast.success("Transaction deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete");
    }
    setIsDeleting(false);
  };

  const allCategories = Array.from(new Set(initialData.map((t) => t.category)));

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
            <ChevronLeft className="w-5 h-5 text-zinc-500" />
          </button>
          <span className="font-semibold text-sm uppercase tracking-wider">Expenses</span>
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
                title="Total Spending"
                mainValue={formatCurrency(currentStats.total)}
                mainIcon={<Calendar className="w-5 h-5" />}
                subtitle={processedData.targetDate.toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
                theme="expense"
                stats={[
                  { label: "Subtotal", value: formatCurrency(currentStats.subtotal), icon: null },
                  { label: "Fees", value: formatCurrency(currentStats.fee), icon: null },
                  { label: "Saved", value: formatCurrency(currentStats.discount), icon: null },
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

        {/* 3. SEARCH & FILTER (Manual) */}
        <div className="sticky top-[57px] z-20 -mx-4 px-4 pb-2 pt-2 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-transparent transition-all">
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
              <Input
                placeholder="Search transaction..."
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
                  {(selectedCategories.length > 0 || sortOption !== "latest") && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
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

                    {/* Category Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          Categories
                        </h3>
                        {selectedCategories.length > 0 && (
                          <button
                            onClick={() => setSelectedCategories([])}
                            className="text-xs text-red-500 font-medium"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              if (selectedCategories.includes(cat)) {
                                setSelectedCategories((prev) =>
                                  prev.filter((c) => c !== cat)
                                );
                              } else {
                                setSelectedCategories((prev) => [...prev, cat]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              selectedCategories.includes(cat)
                                ? "bg-zinc-900 text-white border-zinc-900"
                                : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                            }`}
                          >
                            {cat}
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

        {/* 4. TRANSACTIONS LIST (Manual dengan SwipeableItem) */}
        <div className="space-y-6">
          {groupedTransactions.length > 0 ? (
            groupedTransactions.map((group) => (
              <div key={formatDateKey(group.date)} className="space-y-2">
                {/* Group Header */}
                <div className="flex justify-between items-end px-2">
                  <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    {formatDisplayDate(group.date)}
                  </h3>
                  <span className="text-xs font-mono font-medium text-zinc-400 font-semibold">
                    {formatCurrency(group.total)}
                  </span>
                </div>

                {/* Transaction Items (Manual) */}
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const Icon = ICON_MAP[item.category] || ICON_MAP["default"];

                    return (
                      <SwipeableItem
                        key={item.id}
                        onClick={() => router.push(`/finance/expenses/${item.id}`)}
                        onEdit={() => router.push(`/finance/expenses/${item.id}/edit`)}
                        onDelete={() => setDeleteId(item.id)}
                      >
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700 shadow-md hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-red-400">
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                              <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate pr-2">
                                {item.title}
                              </h4>
                              <span className="font-bold text-sm font-mono text-red-500 dark:text-red-400">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-400 truncate">
                              {item.paymentMethod}
                            </p>
                          </div>
                        </div>
                      </SwipeableItem>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            // EMPTY STATE (Client Component)
            <EmptyState 
              type="expense" 
              title={searchTerm || selectedCategories.length > 0 ? "No matching expenses" : "No expenses yet"}
              description={
                searchTerm || selectedCategories.length > 0 
                  ? "Try adjusting your search or filters"
                  : "Add your first expense to get started"
              }
              actionLabel={searchTerm || selectedCategories.length > 0 ? "Clear filters" : "Add Expense"}
              onAction={() => {
                if (searchTerm || selectedCategories.length > 0) {
                  setSearchTerm("");
                  setSelectedCategories([]);
                } else {
                  router.push("/finance/expenses/add");
                }
              }}
            />
          )}
        </div>
      </div>

      {/* 5. FLOATING ACTION BUTTON (Client Component) */}
      <FloatingActionButton
        onClick={() => router.push("/finance/expenses/add")}
        icon="plus"
        variant="primary"
        position="bottom-center"
        label="Add Expense"
        showLabel={false}
      />

      {/* 6. DELETE DIALOG */}
      <DeleteAlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Transaction?"
        description="This action cannot be undone. The transaction will be permanently removed."
      />
    </div>
  );
}