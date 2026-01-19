"use client";

import { Search, WalletCards, FileText, CreditCard, TrendingUp } from "lucide-react";

export type EmptyStateType = "expense" | "income" | "transaction" | "search" | "general";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const typeConfig: Record<EmptyStateType, {
  icon: React.ReactNode;
  defaultTitle: string;
  defaultDescription: string;
}> = {
  expense: {
    icon: <CreditCard className="w-16 h-16 stroke-1" />,
    defaultTitle: "No expenses found",
    defaultDescription: "Start tracking your expenses to see them here",
  },
  income: {
    icon: <WalletCards className="w-16 h-16 stroke-1" />,
    defaultTitle: "No income transactions",
    defaultDescription: "Add your income sources to get started",
  },
  transaction: {
    icon: <FileText className="w-16 h-16 stroke-1" />,
    defaultTitle: "No transactions",
    defaultDescription: "Your transactions will appear here",
  },
  search: {
    icon: <Search className="w-16 h-16 stroke-1" />,
    defaultTitle: "No results found",
    defaultDescription: "Try different search terms or filters",
  },
  general: {
    icon: <TrendingUp className="w-16 h-16 stroke-1" />,
    defaultTitle: "No data available",
    defaultDescription: "There's nothing to display at the moment",
  },
};

export default function EmptyState({
  type = "general",
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  const config = typeConfig[type];

  return (
    <div className={`py-20 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 opacity-50 ${className}`}>
      {config.icon}
      <h3 className="text-lg font-semibold mt-4 mb-2 text-zinc-400 dark:text-zinc-500">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-center text-zinc-400 dark:text-zinc-600 max-w-sm mb-6">
        {description || config.defaultDescription}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}