import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Calendar,
  CreditCard,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ICON_MAP } from "@/lib/constants";
import { getExpenseById } from "@/app/action/finance/ActionExpenses";
import ActionButtons from "@/components/finance/expenses/action-button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExpenseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { success, data } = await getExpenseById(id);

  if (!success || !data) {
    return notFound();
  }

  const IconComponent = ICON_MAP[data.category] || ICON_MAP["default"];

  const formatIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col bg-white dark:bg-neutral-950 relative">

      {/* ── Header ── */}
      <header className="px-5 pt-5 pb-4 flex items-center justify-between sticky top-0 z-20 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-900">
        <Link href="/finance/expenses">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl w-9 h-9 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>

        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
          Transaction
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl w-9 h-9 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-all"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </header>

      <div className="flex-1 pb-28">

        {/* ── Hero Section ── */}
        <div className="px-6 pt-8 pb-8 flex flex-col items-center">

          {/* Icon */}
          <div className="relative mb-6">
            <div className="w-[68px] h-[68px] rounded-[22px] bg-red-50 dark:bg-red-950/40 flex items-center justify-center ring-1 ring-red-100 dark:ring-red-900/40 shadow-sm">
              <IconComponent className="w-[30px] h-[30px] text-red-500 dark:text-red-400" />
            </div>
          </div>

          {/* Category pill */}
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
            {data.category}
          </span>

          {/* Title */}
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white text-center leading-snug mb-5">
            {data.title}
          </h1>

          {/* Amount */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Total Amount
            </span>
            <span className="text-[38px] font-bold tracking-tight text-neutral-900 dark:text-white font-mono leading-none">
              {formatIDR(data.amount)}
            </span>
          </div>
        </div>

        {/* ── Thin Divider ── */}
        <div className="mx-6 h-px bg-neutral-100 dark:bg-neutral-800/80" />

        {/* ── Detail Sections ── */}
        <div className="px-5 pt-6 space-y-4">

          {/* Section 1 — Transaction Info */}
          <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-200/60 dark:ring-neutral-800/60 overflow-hidden">

            {/* Row: Date */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-700 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                </div>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Date</span>
              </div>
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {data.date}
              </span>
            </div>

            <div className="mx-4 h-px bg-neutral-200/70 dark:bg-neutral-800" />

            {/* Row: Platform */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-700 flex items-center justify-center">
                  <Store className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                </div>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Platform</span>
              </div>
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {data.platform}
              </span>
            </div>

            <div className="mx-4 h-px bg-neutral-200/70 dark:bg-neutral-800" />

            {/* Row: Payment Method */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-800 ring-1 ring-neutral-200 dark:ring-neutral-700 flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                </div>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Payment</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-500 dark:bg-red-600 text-white text-[11px] font-semibold tracking-wide">
                {data.paymentMethod}
              </span>
            </div>
          </div>

          {/* Section 2 — Financial Breakdown */}
          {(data.subtotal > 0 ||
            data.serviceFee > 0 ||
            data.discount > 0 ||
            data.shipping > 0 ||
            data.additionalFee > 0) && (
            <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-200/60 dark:ring-neutral-800/60 overflow-hidden">

              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
                  Breakdown
                </span>
              </div>

              <div className="px-4 pb-3 space-y-0">
                {data.subtotal > 0 && (
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Subtotal</span>
                    <span className="text-sm font-mono font-medium text-neutral-800 dark:text-neutral-200">
                      {formatIDR(data.subtotal)}
                    </span>
                  </div>
                )}

                {data.serviceFee > 0 && (
                  <>
                    <div className="h-px bg-neutral-200/70 dark:bg-neutral-800" />
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">Service Fee</span>
                      <span className="text-sm font-mono font-medium text-neutral-800 dark:text-neutral-200">
                        {formatIDR(data.serviceFee)}
                      </span>
                    </div>
                  </>
                )}

                {data.shipping > 0 && (
                  <>
                    <div className="h-px bg-neutral-200/70 dark:bg-neutral-800" />
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-sm text-blue-500 dark:text-blue-400">Shipping</span>
                      <span className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400">
                        {formatIDR(data.shipping)}
                      </span>
                    </div>
                  </>
                )}

                {data.discount > 0 && (
                  <>
                    <div className="h-px bg-neutral-200/70 dark:bg-neutral-800" />
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-sm text-emerald-600 dark:text-emerald-400">Discount</span>
                      <span className="text-sm font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        − {formatIDR(data.discount)}
                      </span>
                    </div>
                  </>
                )}

                {data.additionalFee > 0 && (
                  <>
                    <div className="h-px bg-neutral-200/70 dark:bg-neutral-800" />
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">Additional Fee</span>
                      <span className="text-sm font-mono font-medium text-neutral-800 dark:text-neutral-200">
                        {formatIDR(data.additionalFee)}
                      </span>
                    </div>
                  </>
                )}

                {/* Total row */}
                <div className="h-px bg-neutral-300 dark:bg-neutral-700 mt-1" />
                <div className="flex justify-between items-center pt-3 pb-1">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">Total</span>
                  <span className="text-base font-bold font-mono text-neutral-900 dark:text-white">
                    {formatIDR(data.amount)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer Actions ── */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 py-4 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-900 z-20">
        <ActionButtons id={data.id} />
      </footer>
    </div>
  );
}