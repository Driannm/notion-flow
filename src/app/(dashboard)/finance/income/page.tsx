"use client";

import * as React from "react";
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Plus,
  Briefcase,
  TrendingUp,
  Gift,
  DollarSign,
  Download,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Mock Data
const incomeSources = [
  {
    label: "Salary",
    amount: 7500000,
    percentage: 82,
    color: "bg-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-500/10",
    icon: Briefcase,
  },
  {
    label: "Freelance",
    amount: 1000000,
    percentage: 11,
    color: "bg-teal-400",
    textColor: "text-teal-600",
    bgColor: "bg-teal-400/10",
    icon: ArrowUpRight,
  },
  {
    label: "Investments",
    amount: 650000,
    percentage: 7,
    color: "bg-emerald-300",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-300/10",
    icon: TrendingUp, // atau DollarSign
  },
];

const transactions = [
  {
    id: 1,
    title: "Gaji Bulanan",
    source: "Main Job",
    date: "1 Oct 2023",
    amount: 7500000,
    icon: Briefcase,
    bg: "bg-green-500/10",
    color: "text-green-600",
  },
  {
    id: 2,
    title: "Proyek Desain Logo",
    source: "Freelance",
    date: "28 Sep 2023",
    amount: 1000000,
    icon: TrendingUp,
    bg: "bg-teal-500/10",
    color: "text-teal-600",
  },
  {
    id: 3,
    title: "Dividen Saham",
    source: "Investment",
    date: "25 Sep 2023",
    amount: 150000,
    icon: DollarSign,
    bg: "bg-emerald-500/10",
    color: "text-emerald-600",
  },
  {
    id: 4,
    title: "Kado Ulang Tahun",
    source: "Gift",
    date: "20 Sep 2023",
    amount: 500000,
    icon: Gift,
    bg: "bg-blue-500/10",
    color: "text-blue-600",
  },
];

export default function IncomePage() {
  const router = useRouter();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col relative bg-background text-foreground shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="-ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="font-semibold text-lg">Income</div>
          <Button variant="ghost" size="icon" className="-mr-2">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Total Income Card */}
        <div className="p-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-500 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100 text-sm font-medium">
                  Total Income (Oct)
                </span>
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded text-white flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12%
                </span>
              </div>
              <div className="text-3xl font-bold mb-4">
                {formatCurrency(9150000)}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <Download className="w-3 h-3 mr-1.5" /> Report
                </Button>
              </div>
            </div>

            {/* Decoration */}
            <div className="absolute -right-4 -bottom-8 opacity-20">
              <DollarSign className="w-32 h-32" />
            </div>
          </div>
        </div>

        {/* Source Breakdown (Mini Charts) */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Sources Breakdown
            </h3>
            <button className="text-xs text-primary hover:underline">
              View Report
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {incomeSources.map((source, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* Icon Box */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${source.bgColor}`}
                  >
                    <source.icon className={`w-5 h-5 ${source.textColor}`} />
                  </div>

                  {/* Label & Amount */}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-medium text-sm">
                        {source.label}
                      </span>
                      <span className="font-bold text-sm">
                        {formatCurrency(source.amount).replace("Rp", "Rp ")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{source.percentage}% contribution</span>
                    </div>
                  </div>
                </div>

                {/* Custom Progress Bar */}
                <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                  {/* Background stripe effect (optional visual flair) */}
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1)_100%)] bg-[length:10px_10px]" />

                  {/* Active Bar */}
                  <div
                    className={`h-full rounded-full ${source.color} transition-all duration-500 ease-out`}
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="px-4 mt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Recent Income</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-primary"
            >
              <Filter className="w-3 h-3 mr-1" /> Filter
            </Button>
          </div>

          <div className="space-y-3">
            {transactions.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="font-semibold text-sm truncate">
                      {item.title}
                    </h4>
                    <span className="font-bold text-sm text-green-600">
                      + {formatCurrency(item.amount).replace("Rp", "")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {item.source}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-1/2 translate-x-1/2 max-w-md w-full px-4 flex justify-end pointer-events-none">
        <Button className="h-14 w-14 rounded-full shadow-xl bg-green-600 hover:bg-green-700 pointer-events-auto">
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </div>
    </div>
  );
}
