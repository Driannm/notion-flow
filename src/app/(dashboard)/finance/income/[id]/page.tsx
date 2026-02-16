/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { X, Pencil, Trash2, Calendar, Wallet, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getIncomeById, deleteIncome } from "@/app/action/finance/ActionIncome";
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

interface IncomeDetail {
  id: string;
  title: string;
  amount: number;
  source: string;
  bankAccount: string;
  date: string;
  time: string;
}

export default function IncomeDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const [income, setIncome] = useState<IncomeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pageId, setPageId] = useState<string>("");

  useEffect(() => {
    const initialize = async () => {
      const resolvedParams = await params;
      setPageId(resolvedParams.id);
    };
    initialize();
  }, [params]);

  useEffect(() => {
    if (pageId) {
      loadIncomeDetail();
    }
  }, [pageId]);

  const loadIncomeDetail = async () => {
    if (!pageId) return;
    
    setIsLoading(true);
    const result = await getIncomeById(pageId);
    
    if (result.success && result.data) {
      setIncome(result.data);
    } else {
      toast.error("Gagal memuat detail income");
      router.back();
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!pageId) return;
    
    setIsDeleting(true);
    const result = await deleteIncome(pageId);

    if (result.success) {
      toast.success("Income berhasil dihapus");
      router.back();
    } else {
      toast.error("Gagal menghapus income", {
        description: result.message,
      });
    }
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md min-h-screen mx-auto flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!income) return null;

  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-muted transition"
          type="button"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="font-semibold text-sm uppercase tracking-wider opacity-70">
          Income Detail
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => router.push(`/finance/income/${pageId}/edit`)}
            className="p-2 rounded-full hover:bg-muted transition"
            type="button"
          >
            <Pencil className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="p-2 rounded-full hover:bg-destructive/10 transition"
            type="button"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Amount Section */}
        <div className="m-4 p-8 rounded-xl border border-border shadow bg-card text-center">
          <div className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">
            Total Income
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl font-bold text-muted-foreground">Rp</span>
            <span className="text-5xl font-bold font-mono text-green-600">
              {formatCurrency(income.amount)}
            </span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="m-4 space-y-3">
          {/* Date & Time */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">Date & Time</div>
                <div className="font-medium">{income.date}</div>
                <div className="text-sm text-muted-foreground">{income.time} WIB</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="text-xs text-muted-foreground mb-2">Description</div>
            <div className="font-medium text-lg">{income.title}</div>
          </div>

          {/* Income Source */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">Income Source</div>
                <div className="font-medium">{income.source}</div>
              </div>
            </div>
          </div>

          {/* Bank Account */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">Bank Account</div>
                <div className="font-medium">{income.bankAccount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Income?</AlertDialogTitle>
            <AlertDialogDescription>
              Data income <strong>{income.title}</strong> akan dihapus permanen. Aksi ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}