"use client";

import { Home, ChevronDown, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/LanguageProvider";
import CardWallet from "./CardWallet";
import { getWalletData } from "@/app/action/finance/getCard";

interface BalanceHeaderProps {
  loading: boolean;
  currentBalance: number;
  netFlowData: number;
}

interface CardData {
  id: number;
  type: "ATM" | "E-Money";
  name: string;
  owner: string;
  balance: number;
  bgColor: string;
  textColor: string;
}


const dummyCards = [
  {
    id: 1234,
    type: "ATM",
    name: "BCA Debit",
    owner: "Yuda Andrian",
    balance: 5200000,
    bgColor: "linear-gradient(135deg, #667eea, #764ba2)",
    textColor: "white",
  },
  {
    id: 5678,
    type: "E-Money",
    name: "OVO",
    owner: "Yuda Andrian",
    balance: 150000,
    bgColor: "linear-gradient(135deg, #f79d00, #64f38c)",
    textColor: "white",
  },
  {
    id: 9101,
    type: "ATM",
    name: "Mandiri",
    owner: "Yuda Andrian",
    balance: 2300000,
    bgColor: "linear-gradient(135deg, #43cea2, #185a9d)",
    textColor: "white",
  },
  {
    id: 3421,
    type: "E-Money",
    name: "GoPay",
    owner: "Annisa Dava Islami",
    balance: 320000,
    bgColor: "linear-gradient(135deg, #00c6fb, #005bea)",
    textColor: "white",
  },
  {
    id: 7890,
    type: "ATM",
    name: "BNI Debit",
    owner: "Keluarga",
    balance: 8750000,
    bgColor: "linear-gradient(135deg, #f7971e, #ffd200)",
    textColor: "white",
  },
  {
    id: 6543,
    type: "E-Money",
    name: "Dana",
    owner: "Yuda Andrian",
    balance: 95000,
    bgColor: "linear-gradient(135deg, #ee0979, #ff6a00)",
    textColor: "white",
  },
] satisfies CardData[];

const { cards, transfers } = await getWalletData();

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export default function BalanceHeader({
  loading,
  currentBalance,
  netFlowData,
}: BalanceHeaderProps) {
  const { t } = useLanguage();

  return (
    <div
      className="relative pt-12 pb-32 shadow-xl dark:shadow-none overflow-hidden"
      style={{
        background:
          "radial-gradient(125% 125% at 50% 100%, #000000 40%, #010133 100%)",
      }}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between mb-8 px-6">
        <button className="relative p-2 hover:bg-white/10 rounded-full transition-all">
          <Home className="w-6 h-6 text-white" />
        </button>

        <button className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium hover:bg-white/30 transition-all">
          <span>{t.month.thisMonth}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <CardWallet
        loading={false}
        cards={cards}
        transfers={transfers}
        trigger={
          <button className="relative p-2 hover:bg-white/10 rounded-full transition-all">
              <CreditCard className="w-6 h-6 text-white" />
            </button>
        }
      />
      </div>

      {/* Balance Content */}
      <div className="text-center space-y-3 px-6">
        <p className="text-white/80 text-sm font-medium tracking-wide">
          {t.currentBalance}
        </p>

        <h2 className="text-white text-5xl font-bold tracking-tight font-mono">
          {loading ? (
            <Skeleton className="h-12 w-55 mx-auto rounded-full bg-white/30" />
          ) : (
            formatCurrency(currentBalance)
          )}
        </h2>

        <div className="flex justify-center">
          {loading ? (
            <Skeleton className="h-6 w-49 mx-auto rounded-full bg-white/30" />
          ) : (
            <div
              className={`bg-white/20 backdrop-blur-sm px-4 py-1.5 font-medium text-xs rounded-full font-mono ${
                netFlowData >= 0 ? "text-green-200" : "text-red-200"
              }`}
            >
              {netFlowData >= 0 ? "+" : ""}
              {formatCurrency(netFlowData)} {t.thisMonthLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
