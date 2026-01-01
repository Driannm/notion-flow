"use client";

import * as React from "react";
import {
  ArrowLeft,
  Plus,
  Landmark,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle2,
  CalendarDays,
  Clock10Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Mock Data
const debts = [
  {
    id: 1,
    title: "Car Loan (BCA)",
    type: "Installment",
    totalAmount: 150000000,
    paidAmount: 45000000,
    dueDate: "5 Oct 2023",
    monthlyPayment: 3200000,
    icon: Landmark,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: 2,
    title: "Credit Card",
    type: "Revolving",
    totalAmount: 8500000,
    paidAmount: 2000000,
    dueDate: "12 Oct 2023",
    monthlyPayment: 850000, // Min payment
    icon: CreditCard,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    id: 3,
    title: "Pinjaman Teman",
    type: "Personal",
    totalAmount: 2000000,
    paidAmount: 900000,
    dueDate: "Flexible",
    monthlyPayment: 0,
    icon: AlertCircle,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

export default function DebtsPage() {
  const router = useRouter();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const calculateProgress = (paid: number, total: number) => {
    return Math.min((paid / total) * 100, 100);
  };

  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col relative bg-background text-foreground shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="font-semibold text-lg">Debts & Loans</div>
          <Button variant="ghost" size="icon" className="-mr-2">
            <CalendarDays className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Total Debt Card */}
        <div className="p-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4 opacity-90">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Remaining Debt</span>
            </div>
            <div className="text-3xl font-bold mb-2">{formatCurrency(113500000)}</div>
            <div className="text-xs text-orange-100 mb-6">
                You have paid {formatCurrency(47000000)} in total
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-[10px] text-orange-100 uppercase mb-1">Next Payment</div>
                    <div className="font-semibold text-sm">05 Oct</div>
                    <div className="text-xs opacity-80">Rp 3.200.000</div>
                </div>
                <div className="bg-black/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-[10px] text-orange-100 uppercase mb-1">Active Loans</div>
                    <div className="font-semibold text-sm">3 Items</div>
                    <div className="text-xs opacity-80">Check Details</div>
                </div>
            </div>
          </div>
        </div>

        {/* Active Loans List */}
        <div className="px-4 mt-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Clock10Icon className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Active Loans</span>
            </div>

          <div className="space-y-4">
            {debts.map((item) => {
                const progress = calculateProgress(item.paidAmount, item.totalAmount);
                return (
                    <div
                        key={item.id}
                        className="p-4 rounded-xl border border-border bg-card shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.bg}`}>
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{item.title}</h4>
                                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                        {item.type}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground">Remaining</div>
                                <div className="font-bold text-sm text-orange-600">
                                    {formatCurrency(item.totalAmount - item.paidAmount).replace("Rp", "")}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-2">
                            <div className="flex justify-between text-xs mb-1.5 text-muted-foreground">
                                <span>Paid: {Math.round(progress)}%</span>
                                <span>{formatCurrency(item.totalAmount)}</span>
                            </div>
                            <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-orange-500'}`} 
                                    style={{ width: `${progress}%` }} 
                                />
                            </div>
                        </div>

                        {/* Footer / Due Date */}
                        <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Due: <span className="text-foreground font-medium">{item.dueDate}</span></span>
                            </div>
                            {item.monthlyPayment > 0 && (
                                <Button size="sm" variant="outline" className="h-7 text-xs px-3">
                                    Pay {formatCurrency(item.monthlyPayment).replace(",00", "").replace("Rp", "")}
                                </Button>
                            )}
                        </div>
                    </div>
                )
            })}
          </div>
        </div>
        
        {/* Completed Loans (Collapsed/Simple View) */}
        <div className="px-4 mt-6 mb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Completed</span>
            </div>
            <div className="p-3 rounded-xl border border-dashed border-border flex items-center justify-between opacity-60">
                <span className="text-sm">Paylater (Sep)</span>
                <span className="text-sm font-semibold line-through">Rp 450.000</span>
            </div>
        </div>

      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-1/2 translate-x-1/2 max-w-md w-full px-4 flex justify-end pointer-events-none">
        <Button className="h-14 w-14 rounded-full shadow-xl bg-orange-500 hover:bg-orange-600 pointer-events-auto">
            <Plus className="w-6 h-6 text-white" />
        </Button>
      </div>
    </div>
  );
}