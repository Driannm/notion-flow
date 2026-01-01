import * as React from "react";
import { getExpenses } from "@/app/action/finance/getExpenses"; // Import fungsi fetch tadi
import ExpensesClientView from "@/components/finance/expenses/client-view"; // Kita pisah logic UI ke file client

export const dynamic = "force-dynamic"; // Agar data selalu fresh saat refresh

export default async function ExpensesPage() {
  // 1. Fetch Data di Server
  const { data: transactions } = await getExpenses();

  // 2. Hitung Total Expense Bulan Ini (Server Side Calculation)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const totalExpense = transactions
    .filter((t) => {
      const d = t.dateObj;
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + curr.amount, 0);

  // 3. Render Client View dengan Data Riil
  return (
    <ExpensesClientView 
      initialData={transactions} 
      totalExpense={totalExpense} 
    />
  );
}