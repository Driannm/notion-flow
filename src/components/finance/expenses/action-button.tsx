"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import DeleteAlertDialog from "@/components/finance/AlertDelete"; // sesuaikan path

export default function ActionButtons({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const { deleteExpense } = await import("@/app/action/finance/ActionExpenses");
      const res = await deleteExpense(id);
      if (res.success) {
        setShowConfirm(false);
        router.push("/finance/expenses");
        router.refresh();
      } else {
        setShowConfirm(false);
        alert("Failed to delete transaction");
      }
    });
  };

  return (
    <>
      <DeleteAlertDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleDelete}
        isLoading={isPending}
        title="Delete Transaction?"
        description="This transaction will be permanently removed and cannot be undone."
      />

      <div className="flex items-center gap-2.5 w-full">
        {/* Delete — subtle */}
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className="
            flex items-center justify-center gap-2 h-11 px-5 rounded-xl
            text-sm font-medium text-neutral-500 dark:text-neutral-400
            bg-neutral-100 dark:bg-neutral-800
            hover:bg-red-50 dark:hover:bg-red-950/40
            hover:text-red-500 dark:hover:text-red-400
            transition-all duration-200 active:scale-[0.98]
            disabled:opacity-50
          "
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>

        {/* Edit — primary */}
        <button
          onClick={() => router.push(`/finance/expenses/${id}/edit`)}
          disabled={isPending}
          className="
            flex-1 flex items-center justify-center gap-2 h-11 rounded-xl
            text-sm font-semibold text-white
            bg-neutral-900 dark:bg-white dark:text-neutral-900
            hover:bg-neutral-700 dark:hover:bg-neutral-100
            active:scale-[0.98] transition-all duration-200
            disabled:opacity-50
          "
        >
          <Edit className="w-4 h-4" />
          Edit Transaction
        </button>
      </div>
    </>
  );
}