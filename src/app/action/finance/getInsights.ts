/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { notion } from "@/lib/notion-server";
import { CATEGORY_IDS } from "@/lib/constants";

const EXPENSES_DB_ID = process.env.EXPENSES_DATABASE_ID!;
const INCOME_DB_ID = process.env.INCOME_DATABASE_ID!;
const DEBTS_DB_ID = process.env.DEBTS_DATABASE_ID!;
const LOANS_DB_ID = process.env.LOANS_DATABASE_ID!;

/* ---------------- CACHE (5 menit) ---------------- */
let cache: any = null;
let lastFetch = 0;
const CACHE_DURATION = 1000 * 60 * 5;

/* ---------------- HELPERS ---------------- */
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

const fetchAllPages = async (database_id: string, filter?: any) => {
  let results: any[] = [];
  let hasMore = true;
  let cursor: string | undefined = undefined;

  while (hasMore) {
    const res = await notion.databases.query({
      database_id,
      filter,
      start_cursor: cursor,
    });
    results = results.concat(res.results);
    hasMore = res.has_more;
    cursor = res.next_cursor || undefined;
  }
  return results;
};

/* ---------------- MAIN ---------------- */
export async function getFinancialInsights() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (cache && Date.now() - lastFetch < CACHE_DURATION) {
    return cache;
  }

  const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
  const dateFilter = startOfLastMonth.toISOString().split("T")[0];

  try {
    const [expensesRaw, incomeRaw, debtsRaw, loansRaw] = await Promise.all([
      fetchAllPages(EXPENSES_DB_ID, { property: "Date", date: { on_or_after: dateFilter } }),
      fetchAllPages(INCOME_DB_ID, { property: "Date", date: { on_or_after: dateFilter } }),
      fetchAllPages(DEBTS_DB_ID, { property: "Status", status: { does_not_equal: "Paid" } }),
      fetchAllPages(LOANS_DB_ID, { property: "Status", status: { does_not_equal: "Paid" } }),
    ]);

    const processTransactions = (results: any[]) => {
      const transactions = results.map((page: any) => {
        const props = page.properties;
        const rawCatId = props.Category?.relation?.[0]?.id;
        let category = props.Name?.title?.[0]?.plain_text || "Others";

        if (rawCatId && ID_TO_CATEGORY[normalizeId(rawCatId)]) {
          category = ID_TO_CATEGORY[normalizeId(rawCatId)];
        } else if (props.Source?.select?.name) {
          category = props.Source.select.name;
        }

        return {
          amount: props.Amount?.number || 0,
          date: new Date(props.Date?.date?.start),
          category,
        };
      });

      const current = transactions.filter(
        t => t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear
      );

      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      const last = transactions.filter(
        t =>
          t.date.getMonth() === lastMonthDate.getMonth() &&
          t.date.getFullYear() === lastMonthDate.getFullYear()
      );

      const totalCurrent = current.reduce((s, t) => s + t.amount, 0);
      const totalLast = last.reduce((s, t) => s + t.amount, 0);

      let percent = 0;
      if (totalLast > 0) percent = ((totalCurrent - totalLast) / totalLast) * 100;
      else if (totalCurrent > 0) percent = 100;

      const categories: Record<string, number> = {};
      current.forEach(t => (categories[t.category] = (categories[t.category] || 0) + t.amount));

      const sorted = Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const top5 = sorted.slice(0, 5);
      const othersTotal = sorted.slice(5).reduce((s, c) => s + c.value, 0);
      if (othersTotal > 0) top5.push({ name: "Others", value: othersTotal });

      return { totalCurrent, totalLast, percent, topCategories: top5 };
    };

    const expenseStats = processTransactions(expensesRaw);
    const incomeStats = processTransactions(incomeRaw);

    const processObligations = (results: any[]) => {
      let totalRemaining = 0;
      let count = 0;

      results.forEach((page: any) => {
        const props = page.properties;
        const total = getNumber(props.Debts || props.Loan || props.Amount);
        const paid = getNumber(props["Paid "] || props.Paid);
        const remaining = getNumber(props.Remaining) || total - paid;

        if (remaining > 0) {
          totalRemaining += remaining;
          count++;
        }
      });

      return { totalRemaining, count };
    };

    const debtStats = processObligations(debtsRaw);
    const loanStats = processObligations(loansRaw);

    const response = {
      success: true,
      data: {
        expense: expenseStats,
        income: incomeStats,
        debt: debtStats,
        loan: loanStats,
        netFlow: incomeStats.totalCurrent - expenseStats.totalCurrent,
      },
    };

    cache = response;
    lastFetch = Date.now();

    return response;
  } catch (error) {
    console.error("Insights Error:", error);
    return { success: false, data: null };
  }
}