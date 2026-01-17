/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Plus,
  Calendar,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Truck,
  Percent,
  X,
  ArrowUpDown,
  Filter,
} from "lucide-react";

// UI Components
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Logic & Data
import { SwipeableItem } from "@/components/finance/expenses/swipeable-item";
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

const formatDateKey = (date: Date) => {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

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

  // Filter States
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    []
  );
  const [sortOption, setSortOption] = React.useState<
    "latest" | "highest" | "lowest"
  >("latest");

  // Card Slider State
  const [monthIndex, setMonthIndex] = React.useState(0); // 0 = Current, 1 = Last
  const [direction, setDirection] = React.useState(0);

  // Delete State
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // --- DEBOUNCE SEARCH ---
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- DERIVED DATA (FILTERING & GROUPING) ---
  const processedData = React.useMemo(() => {
    let data = [...initialData];

    // 1. Filter by Month (Slider Logic)
    const now = new Date();
    const targetDate = new Date(
      now.getFullYear(),
      now.getMonth() - monthIndex,
      1
    );
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
    else data.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()); // Latest default

    return { data, targetDate };
  }, [
    initialData,
    monthIndex,
    debouncedSearch,
    selectedCategories,
    sortOption,
  ]);

  // --- GROUPING LOGIC ---
  const groupedTransactions = React.useMemo(() => {
    const groups: Record<
      string,
      { date: Date; items: Transaction[]; total: number }
    > = {};

    processedData.data.forEach((t) => {
      const key = formatDateKey(t.dateObj);
      if (!groups[key]) {
        groups[key] = { date: t.dateObj, items: [], total: 0 };
      }
      groups[key].items.push(t);
      groups[key].total += t.amount;
    });

    // Sort keys descending (newest date first)
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
      {/* 1. HEADER */}
      <div className="sticky top-0 z-30 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </button>
          <span className="font-semibold text-sm">Expenses</span>
          <div className="w-8" />
        </div>
      </div>

      <div className="pt-4 px-4 space-y-6">
        {/* 2. SWIPEABLE TOTAL CARD */}
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
              <div className="h-full rounded-[2rem] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-6 shadow-xl shadow-zinc-300/30 dark:shadow-none flex flex-col justify-between overflow-hidden relative">
                {/* Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-black/5 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />

                {/* Header */}
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
                      Total Spending
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium bg-white/10 dark:bg-black/5 px-2 py-0.5 rounded-md backdrop-blur-md">
                        {processedData.targetDate.toLocaleDateString("id-ID", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/10 dark:bg-black/5 p-2 rounded-full">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                {/* Amount */}
                <div className="relative z-10">
                  <h1 className="text-4xl font-extrabold tracking-tighter">
                    {formatCurrency(currentStats.total)}
                  </h1>
                </div>

                {/* Breakdown Mini Grid */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 dark:border-black/5 relative z-10">
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">
                      Subtotal
                    </p>
                    <p className="text-xs font-bold font-mono">
                      {formatCurrency(currentStats.subtotal)}
                    </p>
                  </div>
                  <div className="text-center border-l border-white/10 dark:border-black/5">
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">
                      Fees
                    </p>
                    <p className="text-xs font-bold font-mono">
                      {formatCurrency(currentStats.fee)}
                    </p>
                  </div>
                  <div className="text-center border-l border-white/10 dark:border-black/5">
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">
                      Saved
                    </p>
                    <p className="text-xs font-bold font-mono text-green-400 dark:text-green-600">
                      {formatCurrency(currentStats.discount)}
                    </p>
                  </div>
                </div>

                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      monthIndex === 0
                        ? "bg-white dark:bg-black"
                        : "bg-white/20 dark:bg-black/20"
                    }`}
                  />
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      monthIndex === 1
                        ? "bg-white dark:bg-black"
                        : "bg-white/20 dark:bg-black/20"
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. COMMAND CENTER (Sticky Search & Filter) */}
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
                  {/* Active Indicator */}
                  {(selectedCategories.length > 0 ||
                    sortOption !== "latest") && (
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

        {/* 4. GROUPED TRANSACTIONS LIST */}
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

                {/* Items */}
                <div className="space-y-2 ">
                  {group.items.map((item) => {
                    const Icon = ICON_MAP[item.category] || ICON_MAP["default"];

                    return (
                      <SwipeableItem
                        
                        key={item.id}
                        onClick={() =>
                          router.push(`/finance/expenses/${item.id}`)
                        }
                        onEdit={() =>
                          router.push(`/finance/expenses/${item.id}/edit`)
                        }
                        onDelete={() => setDeleteId(item.id)}
                      >
                        <div
                          className="
                          flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-300 dark:border-white shadow-md hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors"                        
                        >
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
            <div className="py-20 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 opacity-50">
              <Search className="w-16 h-16 mb-4 stroke-1" />
              <p className="text-sm font-medium">No expenses found.</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB (Floating Action Button) */}
      <div className="fixed bottom-6 right-1/2 translate-x-1/2 max-w-md w-full px-4 flex justify-end pointer-events-none z-50">
        <Button
          className="h-14 w-14 rounded-[1.2rem] shadow-xl shadow-zinc-400/30 dark:shadow-black/50 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black pointer-events-auto flex items-center justify-center transition-transform active:scale-90"
          onClick={() => router.push("/finance/expenses/add")}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* DELETE DIALOG */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-0 rounded-[1.5rem] w-[300px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">Delete?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs">
              Permanently remove this record from Notion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 justify-center sm:justify-center">
            <AlertDialogCancel className="flex-1 rounded-xl h-10 border-0 bg-zinc-100 dark:bg-zinc-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="flex-1 rounded-xl h-10 bg-red-500 hover:bg-red-600 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
