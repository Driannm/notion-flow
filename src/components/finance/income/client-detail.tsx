/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Briefcase,
  TrendingUp,
  Gift,
  DollarSign,
  ArrowUpRight,
  Wallet,
  Loader2,
  Banknote,
  CreditCard,
  WalletCards,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
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

// Actions
import { deleteIncome } from "@/app/action/finance/getIncome";
import DeleteAlertDialog from "@/components/finance/AlertDelete";

// Icon Mapping
const SOURCE_ICONS: Record<string, any> = {
  Salary: Briefcase,
  "Main Job": Briefcase,
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

// Bank Icons
const BANK_ICONS: Record<string, any> = {
  "Bank Central Asia": CreditCard,
  "Livin' by Mandiri": CreditCard,
  "Blu by BCA Digital": CreditCard,
  "Bank Jago": WalletCards,
  Seabank: WalletCards,
  Gopay: Wallet,
  "Link Aja": Wallet,
  "Shopee-Pay": Wallet,
  Cash: Banknote,
};

interface IncomeDetailData {
  id: string;
  title: string;
  amount: number;
  source: string;
  bankAccount?: string;
  date: string;
  time: string;
}

interface Props {
  data: IncomeDetailData | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function IncomeDetailClientView({ data }: Props) {
  const router = useRouter();

  // State
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle delete
  const handleDelete = async () => {
    if (!data) return;

    setIsDeleting(true);
    const res = await deleteIncome(data.id);

    if (res.success) {
      toast.success("Income deleted successfully");
      router.push("/finance/income");
      router.refresh();
    } else {
      toast.error("Failed to delete income");
      setIsDeleting(false);
    }
  };

  // Loading state
  if (!isClient) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Empty state
  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="sticky top-0 z-30 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="px-4 h-14 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-500" />
            </button>
            <span className="font-semibold text-sm">Income Details</span>
            <div className="w-8" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <div className="text-center space-y-4">
            <Wallet className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Income not found
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              The income record you`&apos;re looking for is not found.
            </p>
            <Button
              onClick={() => router.push("/finance/income")}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Back to Income
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const Icon = SOURCE_ICONS[data.source] || SOURCE_ICONS["General"];
  const BankIcon = data.bankAccount
    ? BANK_ICONS[data.bankAccount] || Wallet
    : Wallet;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </button>
          <span className="font-semibold text-sm">Income Details</span>
          <div className="w-8" />
        </div>
      </div>

      <div className="pt-4 px-4 pb-32 max-w-md mx-auto">
        {/* Amount Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-500 text-white p-6 shadow-xl shadow-emerald-300/30 dark:shadow-none mb-6"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">
                Income Amount
              </p>
              <p className="text-sm opacity-90">{data.title}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-xl">
              <Icon className="w-6 h-6" />
            </div>
          </div>

          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="text-4xl font-extrabold tracking-tight mb-2"
          >
            {formatCurrency(data.amount)}
          </motion.h1>

          <div className="flex items-center gap-2 text-emerald-100 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{data.date}</span>
            <span className="opacity-70">•</span>
            <span>{data.time}</span>
          </div>
        </motion.div>

        {/* Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-md border border-zinc-200 dark:border-zinc-800 mb-6"
        >
          <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
            Transaction Details
          </h3>

          <div className="space-y-4">
            {/* Source */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Source
                  </p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {data.source}
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Account */}
            {data.bankAccount && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <BankIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Bank Account
                    </p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {data.bankAccount}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  Date
                </p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {data.date}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  Time
                </p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {data.time}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex gap-3"
        >
          <Button
            onClick={() => router.push(`/finance/income/${data.id}/edit`)}
            className="flex-1 h-12 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>

          <Button
            onClick={() => setShowDeleteDialog(true)}
            className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white"
            variant="destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteAlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Income?"
        description="This action cannot be undone. This will permanently delete this income record."
      />
    </div>
  );
}
