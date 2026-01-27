import * as React from "react";
import { getIncomeById } from "@/app/action/finance/getIncome";
import IncomeDetailClientView from "@/components/finance/income/client-detail";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function IncomeDetailPage({ params }: Props) {
  const { id } = await params;
  
  const response = await getIncomeById(id);
  
  if (!response?.success || !response.data) {
    // Return empty state atau redirect
    return <IncomeDetailClientView data={null} />;
  }

  return <IncomeDetailClientView data={response.data} />;
}