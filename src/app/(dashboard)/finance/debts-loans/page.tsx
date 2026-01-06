import * as React from "react";
import { getDebtsAndLoans } from "@/app/action/finance/getDebts";
import DebtsClientView from "@/components/finance/debts-loans/client-view";

export const dynamic = "force-dynamic";

export default async function DebtsPage() {
  const { data } = await getDebtsAndLoans();

  return (
    <DebtsClientView 
        debts={data?.debts || []} 
        loans={data?.loans || []} 
    />
  );
}