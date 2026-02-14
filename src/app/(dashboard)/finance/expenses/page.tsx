import * as React from "react";
import { getExpenses } from "@/app/action/finance/ActionExpenses";
import ExpensesClientView from "@/components/finance/expenses/client-view";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const { data: transactions } = await getExpenses();

  return (
    <ExpensesClientView initialData={transactions} />
  );
}