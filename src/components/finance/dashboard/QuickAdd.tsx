"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  WalletCards,
  CreditCard,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function QuickAdd() {
  const { t } = useLanguage();

  const quickAddItems = [
    {
      href: "/finance/expenses/add",
      icon: TrendingDown,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-500",
      title: t.addExpense,
      description: t.trackSpending,
    },
    {
      href: "/finance/income/add",
      icon: TrendingUp,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-500",
      title: t.addIncome,
      description: t.salaryOrEarnings,
    },
    {
      href: "/finance/transfer/add",
      icon: ArrowLeftRight,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-500",
      title: t.addTransfer,
      description: t.moveBetweenAccounts,
    },
    {
      href: "/finance/debts-loans/add?type=debt",
      icon: WalletCards,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-500",
      title: t.addDebt,
      description: t.moneyYouOwe,
    },
    {
      href: "/finance/debts-loans/add?type=loan",
      icon: CreditCard,
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-500",
      title: t.addLoan,
      description: t.moneyLentOut,
    },
  ];

  return (
    <div className="w-14 flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="group w-14 h-14 -mt-6 bg-slate-950 text-white rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white dark:border-gray-900">
            <Plus className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          sideOffset={14}
          className="w-70 rounded-2xl p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800 shadow-2xl"
        >
          <div className="px-3 pt-2 pb-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t.quickAdd}
            </p>
          </div>
          <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800 my-1" />

          {quickAddItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={index} href={item.href}>
                <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div
                    className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center`}
                  >
                    <Icon className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {item.title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              </Link>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}