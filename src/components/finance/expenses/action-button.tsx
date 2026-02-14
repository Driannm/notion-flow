"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteExpense } from "@/app/action/finance/ActionExpenses"; // Sesuaikan path import

export default function ActionButtons({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirm) return;

    startTransition(async () => {
      const res = await deleteExpense(id);
      if (res.success) {
        router.push("/finance/expenses"); // Redirect ke list setelah delete
        router.refresh();
      } else {
        alert("Failed to delete transaction");
      }
    });
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <Button
        variant="outline"
        className="flex-1 gap-2 border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        Delete
      </Button>
      
      <Button
        className="flex-1 gap-2 bg-foreground text-background hover:bg-foreground/90"
        onClick={() => router.push(`/finance/expenses/${id}/edit`)}
      >
        <Edit className="w-4 h-4" />
        Edit
      </Button>
    </div>
  );
}