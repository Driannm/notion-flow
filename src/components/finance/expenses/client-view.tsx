"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; // 👈 Import Animation
import { SwipeableItem } from "@/components/finance/expenses/swipeable-item";
import { deleteExpense } from "@/app/action/finance/getExpenses";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Plus,
  Calendar,
  Loader2,
  AlertTriangle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Truck,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ICON_MAP } from "@/lib/constants";
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

// Update Interface agar support breakdown fields
interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  dateObj: Date;
  paymentMethod: string;
  // Tambahan field (pastikan server action mengembalikan ini)
  fee?: number;
  discount?: number;
  subtotal?: number;
}

interface Props {
  initialData: Transaction[];
  totalExpense: number; // Ini total global (bisa diabaikan jika kita hitung ulang di client)
}

export default function ExpensesClientView({ initialData }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("All");

  // STATE BARU: 0 = Bulan Ini, 1 = Bulan Lalu
  const [monthIndex, setMonthIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0); // Untuk arah animasi slide

  const [deleteConfirmationId, setDeleteConfirmationId] = React.useState<
    string | null
  >(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // --- LOGIC CALCULATE TOTAL PER BULAN ---
  const currentStats = React.useMemo(() => {
    // Tentukan target bulan berdasarkan monthIndex
    const now = new Date();
    const targetDate = new Date(
      now.getFullYear(),
      now.getMonth() - monthIndex,
      1
    );

    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    // Filter data sesuai bulan yang dipilih
    const filteredData = initialData.filter((t) => {
      const tDate = new Date(t.dateObj);
      return (
        tDate.getMonth() === targetMonth && tDate.getFullYear() === targetYear
      );
    });

    // Hitung Breakdown
    const stats = filteredData.reduce(
      (acc, curr) => ({
        total: acc.total + curr.amount,
        fee: acc.fee + (curr.fee || 0), // Asumsi server return fee (shipping + service)
        discount: acc.discount + (curr.discount || 0),
        subtotal: acc.subtotal + (curr.subtotal || curr.amount), // Fallback ke amount jika subtotal kosong
      }),
      { total: 0, fee: 0, discount: 0, subtotal: 0 }
    );

    // Nama Bulan untuk Display
    const monthName = targetDate.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });

    return { ...stats, monthName, dataCount: filteredData.length };
  }, [initialData, monthIndex]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  // --- HANDLE SWIPE CARD ---
  const paginate = (newDirection: number) => {
    const newIndex = monthIndex + newDirection;
    // Batasi hanya 0 (Current) dan 1 (Previous)
    if (newIndex >= 0 && newIndex <= 1) {
      setDirection(newDirection);
      setMonthIndex(newIndex);
    }
  };

  // Filter Categories & Transactions (Untuk List di bawah)
  const categories = [
    "All",
    ...Array.from(new Set(initialData.map((t) => t.category))),
  ];

  // List Transaksi tetap menampilkan SEMUA atau difilter per bulan juga?
  // Biasanya list mengikuti card yang aktif. Mari kita filter list juga.
  const visibleTransactions = React.useMemo(() => {
    const now = new Date();
    const targetDate = new Date(
      now.getFullYear(),
      now.getMonth() - monthIndex,
      1
    );

    return initialData.filter((t) => {
      const tDate = new Date(t.dateObj);
      const isSameMonth =
        tDate.getMonth() === targetDate.getMonth() &&
        tDate.getFullYear() === targetDate.getFullYear();
      const isCategoryMatch = activeTab === "All" || t.category === activeTab;
      return isSameMonth && isCategoryMatch;
    });
  }, [initialData, monthIndex, activeTab]);

  // Logic Delete
  const handleDeleteTrigger = (id: string) => setDeleteConfirmationId(id);

  const confirmDelete = async () => {
    if (!deleteConfirmationId) return;
    setIsDeleting(true);
    try {
      const res = await deleteExpense(deleteConfirmationId);
      if (res.success) {
        setDeleteConfirmationId(null);
        toast.success("Transaksi Dihapus", {
          description: "Data telah dihapus.",
          icon: <Trash2 className="w-4 h-4" />,
        });
        router.refresh();
      } else {
        toast.error("Gagal menghapus data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setIsDeleting(false);
    }
  };

  // Variants Animation untuk Card Slider
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

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
        {/* === TOTAL EXPENSE CARD (SWIPEABLE) === */}
        <div className="p-4 relative overflow-hidden">
          <div className="relative h-[220px]">
            {" "}
            {/* Fixed height container */}
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={monthIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -10000) {
                    paginate(-1); // Swipe Left -> Next Month (Previous time)
                  } else if (swipe > 10000) {
                    paginate(1); // Swipe Right -> Prev Month (Current time)
                  }
                }}
                className="absolute w-full h-full rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg p-6 flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <span className="text-red-100 text-sm font-medium">
                    Total Spending
                  </span>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs text-white backdrop-blur-sm">
                    <Calendar className="w-3 h-3" />
                    <span>{currentStats.monthName}</span>
                  </div>
                </div>

                {/* Main Amount */}
                <div>
                  <div className="text-3xl font-bold mb-1 font-mono">
                    {formatCurrency(currentStats.total)}
                  </div>
                  <div className="text-xs text-red-100/80">
                    {currentStats.dataCount} transactions recorded
                  </div>
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/20">
                  <div>
                    <div className="text-[10px] text-red-100 uppercase opacity-70 mb-1 flex items-center gap-1">
                      <Receipt className="w-3 h-3" /> Subtotal
                    </div>
                    <div className="font-semibold text-sm font-mono">
                      {formatCurrency(currentStats.subtotal)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-red-100 uppercase opacity-70 mb-1 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Fees
                    </div>
                    <div className="font-semibold text-sm font-mono">
                      {formatCurrency(currentStats.fee)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-red-100 uppercase opacity-70 mb-1 flex items-center gap-1">
                      <Percent className="w-3 h-3" /> Save
                    </div>
                    <div className="font-semibold text-sm font-mono">
                      {formatCurrency(currentStats.discount)}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => paginate(-1)}
              className={`w-2 h-2 rounded-full transition-all ${
                monthIndex === 0 ? "bg-red-600 w-4" : "bg-red-200"
              }`}
            />
            <button
              onClick={() => paginate(1)}
              className={`w-2 h-2 rounded-full transition-all ${
                monthIndex === 1 ? "bg-red-600 w-4" : "bg-red-200"
              }`}
            />
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
            <h3 className="font-semibold text-sm">
              {monthIndex === 0
                ? "Recent Transactions"
                : `Transactions in ${currentStats.monthName}`}
            </h3>
            <span className="text-xs text-muted-foreground">
              {visibleTransactions.length} items
            </span>
          </div>

          <div className="space-y-0">
            {visibleTransactions.map((item) => {
              const IconComponent =
                ICON_MAP[item.category] || ICON_MAP["default"];

              return (
                <SwipeableItem
                  key={item.id}
                  onClick={() => router.push(`/finance/expenses/${item.id}`)}
                  onEdit={() =>
                    router.push(`/finance/expenses/${item.id}/edit`)
                  }
                  onDelete={() => handleDeleteTrigger(item.id)}
                >
                  <div className="flex items-center gap-3 p-3 border border-border bg-card rounded-xl">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-red-500/10 text-red-500">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-semibold text-sm truncate pr-2">
                          {item.title}
                        </h4>
                        <span className="font-semibold text-sm text-red-500 shrink-0 font-mono">
                          - {formatCurrency(item.amount)}
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
                </SwipeableItem>
              );
            })}

            {visibleTransactions.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No transactions found for {currentStats.monthName}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-1/2 translate-x-1/2 max-w-md w-full px-4 flex justify-end pointer-events-none z-50">
        <Button
          className="h-14 w-14 rounded-full shadow-xl bg-red-600 hover:bg-red-700 pointer-events-auto flex items-center justify-center"
          onClick={() => router.push("/finance/expenses/add")}
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* 👇 iOS STYLE ALERT DIALOG (Adaptive Dark/Light) */}
      <AlertDialog
        open={!!deleteConfirmationId}
        onOpenChange={(open) => !open && setDeleteConfirmationId(null)}
      >
        <AlertDialogContent
          className="p-0 border-0 rounded-[14px] w-[270px] sm:w-[320px] max-w-none gap-0 shadow-2xl overflow-hidden backdrop-blur-xl 
          data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
          bg-white/85 dark:bg-zinc-900/95 
          text-zinc-900 dark:text-white"
        >
          {/* HEADER SECTION */}
          <div className="p-5 text-center space-y-1">
            <AlertDialogTitle className="text-[17px] font-semibold leading-snug">
              Delete Transaction?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-normal text-zinc-500 dark:text-zinc-400">
              This action cannot be undone. Are you sure you want to delete
              this?
            </AlertDialogDescription>
          </div>

          {/* BUTTONS SECTION (GRID LAYOUT) */}
          <div className="flex flex-row border-t border-zinc-900/5 dark:border-white/15">
            {/* CANCEL BUTTON */}
            <AlertDialogCancel
              disabled={isDeleting}
              className="flex-1 h-11 m-0 rounded-none border-0 bg-transparent text-[17px] font-normal focus:ring-0 active:scale-100 transition-colors
              text-blue-600 dark:text-blue-500 
              hover:bg-zinc-900/5 dark:hover:bg-white/10"
            >
              Cancel
            </AlertDialogCancel>

            {/* SEPARATOR (Vertical Line) */}
            <div className="w-[1px] bg-zinc-900/5 dark:bg-white/15" />

            {/* ACTION BUTTON (DELETE) */}
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="flex-1 h-11 m-0 rounded-none border-0 bg-transparent text-[17px] font-semibold focus:ring-0 active:scale-100 transition-colors
              text-red-600 dark:text-red-500 
              hover:bg-zinc-900/5 dark:hover:bg-white/10"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
