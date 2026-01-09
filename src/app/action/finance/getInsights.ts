/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { notion } from "@/lib/notion-server";
import { CATEGORY_IDS } from "@/lib/constants";

// Load Environment Variables
const EXPENSES_DB_ID = process.env.EXPENSES_DATABASE_ID!;
const INCOME_DB_ID = process.env.INCOME_DATABASE_ID!; // Pastikan ada di .env
const DEBTS_DB_ID = process.env.DEBTS_DATABASE_ID!;
const LOANS_DB_ID = process.env.LOANS_DATABASE_ID!;

// --- HELPERS ---
const normalizeId = (id: string) => id.replace(/-/g, "");
const ID_TO_CATEGORY = Object.entries(CATEGORY_IDS).reduce((acc, [name, id]) => {
  acc[normalizeId(id)] = name;
  return acc;
}, {} as Record<string, string>);

const getNumber = (prop: any) => {
    if (!prop) return 0;
    if (prop.type === "number") return prop.number || 0;
    if (prop.type === "formula") return prop.formula.number || 0;
    if (prop.type === "rollup") return prop.rollup.number || 0;
    return 0;
};

// --- MAIN FUNCTION ---
export async function getFinancialInsights() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter Date: Ambil data dari awal bulan lalu sampai sekarang
  const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
  const dateFilter = startOfLastMonth.toISOString().split("T")[0];

  try {
    // 1. FETCH SEMUA DATABASE SECARA PARALEL
    const [expensesRes, incomeRes, debtsRes, loansRes] = await Promise.all([
      notion.databases.query({
        database_id: EXPENSES_DB_ID,
        filter: { property: "Date", date: { on_or_after: dateFilter } },
      }),
      notion.databases.query({
        database_id: INCOME_DB_ID,
        filter: { property: "Date", date: { on_or_after: dateFilter } },
      }),
      notion.databases.query({
        database_id: DEBTS_DB_ID,
        // UBAH 'select' JADI 'status'
        filter: { property: "Status", status: { does_not_equal: "Paid" } }, 
      }),
      notion.databases.query({
        database_id: LOANS_DB_ID,
        // UBAH 'select' JADI 'status'
        filter: { property: "Status", status: { does_not_equal: "Paid" } }, 
      }),
    ]);

    // --- 2. PROCESS EXPENSES & INCOME (Current vs Last Month) ---
    const processTransactions = (results: any[]) => {
      const transactions = results.map((page: any) => {
        const props = page.properties;
        // Coba resolve category (khusus expenses)
        const rawCatId = props.Category?.relation?.[0]?.id;
        let category = props.Name?.title?.[0]?.plain_text || "Others"; // Default nama jika income
        
        if (rawCatId && ID_TO_CATEGORY[normalizeId(rawCatId)]) {
          category = ID_TO_CATEGORY[normalizeId(rawCatId)];
        } else if (props.Source?.select?.name) {
            category = props.Source.select.name; // Untuk Income biasanya pakai Source Select
        }

        return {
          amount: props.Amount?.number || 0,
          date: new Date(props.Date?.date?.start),
          category,
        };
      });

      const current = transactions.filter(t => t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear);
      const last = transactions.filter(t => t.date.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1));

      const totalCurrent = current.reduce((sum, t) => sum + t.amount, 0);
      const totalLast = last.reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate Percentage
      let percent = 0;
      if (totalLast > 0) percent = ((totalCurrent - totalLast) / totalLast) * 100;
      else if (totalCurrent > 0) percent = 100;

      // Group Categories (Current Month)
      const categories: Record<string, number> = {};
      current.forEach(t => { categories[t.category] = (categories[t.category] || 0) + t.amount });
      const topCategories = Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      return { totalCurrent, totalLast, percent, topCategories };
    };

    const expenseStats = processTransactions(expensesRes.results);
    const incomeStats = processTransactions(incomeRes.results);

    // --- 3. PROCESS DEBTS & LOANS (Active Only) ---
    const processObligations = (results: any[]) => {
        let totalRemaining = 0;
        let count = 0;
        results.forEach((page: any) => {
            const props = page.properties;
            const total = getNumber(props.Debts || props.Loan || props.Amount);
            const paid = getNumber(props["Paid "] || props.Paid);
            const remaining = getNumber(props.Remaining) || (total - paid);
            
            if (remaining > 0) {
                totalRemaining += remaining;
                count++;
            }
        });
        return { totalRemaining, count };
    };

    const debtStats = processObligations(debtsRes.results);
    const loanStats = processObligations(loansRes.results);

    // --- 4. RETURN DATA ---
    return {
      success: true,
      data: {
        expense: expenseStats,
        income: incomeStats,
        debt: debtStats,
        loan: loanStats,
        netFlow: incomeStats.totalCurrent - expenseStats.totalCurrent, // Sisa uang bulan ini
      },
    };

  } catch (error) {
    console.error("Insights Error:", error);
    return { success: false, data: null };
  }
}