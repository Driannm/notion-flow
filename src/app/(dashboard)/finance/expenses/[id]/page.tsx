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

// 👇 1. UPDATE TIPE PROPS: params harus Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExpenseDetailPage({ params }: PageProps) {
  // 👇 2. AWAIT PARAMS DULU SEBELUM AKSES ID
  const { id } = await params;

  // 3. Gunakan variable 'id' yang sudah di-resolve
  const { success, data } = await getExpenseById(id);

  if (!success || !data) {
    return notFound();
  }

  // 4. Determine Icon
  const IconComponent = ICON_MAP[data.category] || ICON_MAP["default"];

  // Format IDR Helper
  const formatIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col bg-background relative">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <Link href="/finance/expenses">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="font-semibold text-sm uppercase tracking-wider opacity-70">
          Transaction Details
        </div>
        <Button variant="ghost" size="icon" className="-mr-2">
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 px-6 pb-24 pt-4">
        {/* Main Card */}
        <div className="flex flex-col items-center mb-8">
          {/* Icon Circle */}
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-red-100">
            <IconComponent className="w-10 h-10 text-red-500" />
          </div>

          {/* Title & Amount */}
          <h1 className="text-center font-semibold text-xl mb-1">
            {data.title}
          </h1>
          <div className="text-sm text-muted-foreground mb-4">
            {data.category}
          </div>
          <div className="text-4xl font-bold text-foreground tracking-tight font-mono">
            {formatIDR(data.amount)}
          </div>
        </div>

        {/* Detail List */}
        <div className="space-y-6">
          {/* Section 1: General Info */}
          <div className="border border-border rounded-xl p-4 bg-card space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Date</span>
              </div>
              <div className="text-sm font-medium text-right">
                <div>{data.date}</div>
                <div className="text-xs text-muted-foreground font-normal">
                  {data.time}
                </div>
              </div>
            </div>

            <div className="w-full h-[1px] bg-border/50" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Store className="w-4 h-4" />
                <span>Platform / Store</span>
              </div>
              <div className="text-sm font-medium">{data.platform}</div>
            </div>

            <div className="w-full h-[1px] bg-border/50" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                <span>Payment Method</span>
              </div>

              <Badge
                variant="secondary"
                className="dark:bg-red-700 bg-red-500 text-white"
              >
                <span className="text-sm font-medium px-2 py-1">
                  {data.paymentMethod}
                </span>
              </Badge>
            </div>
          </div>

          {/* Section 2: Financial Breakdown */}
          {(data.subtotal > 0 ||
            data.serviceFee > 0 ||
            data.discount > 0 ||
            data.shipping > 0 ||
            data.additionalFee > 0) && (
            <div className="border border-border rounded-xl p-4 bg-card space-y-3 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-border/30 to-transparent" />

              {data.subtotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono font-medium">{formatIDR(data.subtotal)}</span>
                </div>
              )}

              {data.serviceFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Service Fee / Tax
                  </span>
                  <span className="font-mono font-medium">{formatIDR(data.serviceFee)}</span>
                </div>
              )}

              {data.shipping > 0 && (
                <div className="flex justify-between text-sm text-blue-600">
                  <span>Shipping</span>
                  <span className="font-mono font-medium">{formatIDR(data.shipping)}</span>
                </div>
              )}

              {data.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-mono font-medium">- {formatIDR(data.discount)}</span>
                </div>
              )}

              {data.additionalFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Additional Fee</span>
                  <span className="font-mono font-medium">{formatIDR(data.additionalFee)}</span>
                </div>
              )}

              <div className="w-full h-[1px] bg-dashed border-t border-dashed border-border my-2" />

              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="font-mono">{formatIDR(data.amount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-md sticky bottom-0">
        <ActionButtons id={data.id} />
      </div>
    </div>
  );
}
