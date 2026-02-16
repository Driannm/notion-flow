import * as React from "react";
import { getIncome } from "@/app/action/finance/ActionIncome";
import IncomeClientView from "@/components/finance/income/client-view";

export const dynamic = "force-dynamic";

export default async function IncomePage() {
  const response = await getIncome();

  if (!response?.success || !response.data) {
    // Return empty state
    return <IncomeClientView initialData={[]} />;
  }

  const initialData = response.data.map((item: any) => ({
    id: item.id,
    title: item.title || "Untitled",
    source: item.source || "Other",
    amount: Number(item.amount) || 0,
    date: item.date,
    dateObj: item.dateObj,
    bankAccount: item.bankAccount || undefined,
  }));

  return <IncomeClientView initialData={initialData} />;
}