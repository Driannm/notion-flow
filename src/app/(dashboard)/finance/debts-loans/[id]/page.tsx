"use client";

import * as React from "react";
import { Suspense } from "react";
import { toast } from "sonner";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Plus, 
  Calendar,
  FileText,
  Loader2,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoneyInput } from "@/components/finance/MoneyInput";
import { getDebtById, recordPayment, deleteDebt } from "@/app/action/finance/debtsAction";

interface DebtData {
  id: string;
  name: string;
  total: number;
  paid: number;
  remaining: number;
  progress: number;
  status: "Active" | "Ongoing" | "Paid" | "Overdue";
  dueDate: string;
  purpose: string;
}

function DebtDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const type = (searchParams.get("type") as "debt" | "loan") || "debt";

  const [isLoading, setIsLoading] = React.useState(true);
  const [debt, setDebt] = React.useState<DebtData | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const result = await getDebtById(id);
      
      if (result.success && result.data) {
        setDebt(result.data);
      } else {
        toast.error("Failed to load data");
        router.push("/finance/debts");
      }
      setIsLoading(false);
    };

    fetchData();
  }, [id, router]);

  if (isLoading || !debt) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-neutral-950">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  const isDebt = type === "debt";
  const remaining = debt.remaining;
  const percentage = debt.progress;

  const themeAccent = isDebt 
    ? "bg-amber-500 dark:bg-amber-600" 
    : "bg-blue-500 dark:bg-blue-600";
  const themeText = isDebt 
    ? "text-amber-600 dark:text-amber-400" 
    : "text-blue-600 dark:text-blue-400";
  const themeBg = isDebt 
    ? "bg-amber-50 dark:bg-amber-950/30" 
    : "bg-blue-50 dark:bg-blue-950/30";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      toast.warning("Please enter a valid amount");
      return;
    }

    const paymentValue = Number(paymentAmount);
    const newPaidTotal = debt.paid + paymentValue;
    const newStatus = newPaidTotal >= debt.total ? "Paid" : debt.status;

    setIsSubmitting(true);
    
    const result = await recordPayment(id, newPaidTotal, newStatus);
    
    if (result.success) {
      toast.success("Payment recorded successfully!");
      setShowPaymentDialog(false);
      setPaymentAmount("");
      
      const updatedData = await getDebtById(id);
      if (updatedData.success && updatedData.data) {
        setDebt(updatedData.data);
      }
      router.refresh();
    } else {
      toast.error("Failed to record payment", { 
        description: result.message 
      });
    }
    
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    
    const result = await deleteDebt(id);
    
    if (result.success) {
      toast.success("Record deleted successfully");
      router.push("/finance/debts");
      router.refresh();
    } else {
      toast.error("Failed to delete record");
    }
  };

  const StatusBadge = () => {
    const config = {
      Paid: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
      Active: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
      Ongoing: "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400",
      Overdue: "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400",
    };

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config[debt.status]}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        {debt.status}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-32">
      
      {/* Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-lg z-20 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            {isDebt ? "Debt" : "Loan"}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full -mr-2">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => router.push(`/finance/debts/${id}/edit?type=${type}`)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-4 max-w-2xl mx-auto pt-6">
        
        {/* Title & Status */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white leading-tight flex-1">
              {debt.name}
            </h1>
            <StatusBadge />
          </div>
          
          {debt.purpose && (
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {debt.purpose}
              </p>
            </div>
          )}
        </div>

        {/* Main Card - Amount Progress */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 mb-4">
          
          {/* Total Amount */}
          <div className="mb-4">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
              Total Amount
            </p>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">
              {formatCurrency(debt.total)}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${themeAccent} transition-all duration-700 ease-out rounded-full`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Paid vs Remaining */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Paid</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(debt.paid)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Remaining</p>
              <p className={`text-lg font-bold ${themeText}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          
          {/* Due Date */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${themeBg} flex items-center justify-center`}>
                <Calendar className={`w-4 h-4 ${themeText}`} />
              </div>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Due Date</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {formatDate(debt.dueDate)}
            </p>
          </div>

          {/* Progress */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${themeBg} flex items-center justify-center`}>
                <TrendingUp className={`w-4 h-4 ${themeText}`} />
              </div>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Progress</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {Math.round(percentage)}%
            </p>
          </div>
        </div>

        {/* Quick Summary */}
        <div className={`rounded-xl p-4 ${themeBg} border ${isDebt ? 'border-amber-200 dark:border-amber-900/30' : 'border-blue-200 dark:border-blue-900/30'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className={`w-4 h-4 ${themeText}`} />
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                {remaining > 0 ? "Still need to pay" : "Fully paid"}
              </span>
            </div>
            <span className={`text-sm font-bold ${themeText}`}>
              {remaining > 0 ? formatCurrency(remaining) : "✓"}
            </span>
          </div>
        </div>

      </div>

      {/* Floating Add Payment Button */}
      {debt.status !== "Paid" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-50 dark:from-neutral-950 via-neutral-50/95 dark:via-neutral-950/95 to-transparent pointer-events-none z-30">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <Button 
              onClick={() => setShowPaymentDialog(true)}
              className={`w-full h-12 rounded-xl ${themeAccent} hover:opacity-90 text-white font-semibold shadow-lg transition-all active:scale-[0.98]`}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Payment
            </Button>
          </div>
        </div>
      )}

      {/* Add Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-sm w-full bg-white dark:bg-neutral-900 rounded-2xl p-6 border-neutral-200 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white">
              Record Payment
            </DialogTitle>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Remaining: {formatCurrency(remaining)}
            </p>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <div>
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
                Payment Amount
              </label>
              <MoneyInput 
                value={paymentAmount}
                onValueChange={setPaymentAmount}
                className="w-full text-2xl font-bold bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                placeholder="0"
                autoFocus
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                Current paid: {formatCurrency(debt.paid)}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentDialog(false);
                  setPaymentAmount("");
                }}
                className="flex-1 h-11 rounded-xl"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPayment}
                disabled={isSubmitting}
                className={`flex-1 h-11 rounded-xl ${themeAccent} hover:opacity-90 text-white`}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default function DebtDetailPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-neutral-950">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    }>
      <DebtDetailContent />
    </Suspense>
  );
}