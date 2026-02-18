/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { notion } from "@/lib/notion-server";

const EXPENSES_DB_ID = process.env.EXPENSES_DATABASE_ID!;
const INCOME_DB_ID = process.env.INCOME_DATABASE_ID!;
const DEBTS_DB_ID = process.env.DEBTS_DATABASE_ID!;
const LOANS_DB_ID = process.env.LOANS_DATABASE_ID!;

/* ---------------- CACHE (2 menit) ---------------- */
let recentCache: any = null;
let recentLastFetch = 0;
const RECENT_CACHE_DURATION = 1000 * 60 * 2;

type RecentTransaction = {
  id: string;
  title: string;
  amount: number;
  type: "expense" | "income" | "debt" | "loan";
  date: string;
};

export async function getRecentTransactions(limit = 6) {
  if (recentCache && Date.now() - recentLastFetch < RECENT_CACHE_DURATION) {
    return recentCache;
  }

  try {
    const [expenses, income, debts, loans] = await Promise.all([
      notion.databases.query({
        database_id: EXPENSES_DB_ID,
        page_size: limit,
        sorts: [{ property: "Date", direction: "descending" }],
      }),
      notion.databases.query({
        database_id: INCOME_DB_ID,
        page_size: limit,
        sorts: [{ property: "Date", direction: "descending" }],
      }),
      notion.databases.query({
        database_id: DEBTS_DB_ID,
        page_size: limit,
        sorts: [{ timestamp: "created_time", direction: "descending" }],
      }),
      notion.databases.query({
        database_id: LOANS_DB_ID,
        page_size: limit,
        sorts: [{ timestamp: "created_time", direction: "descending" }],
      }),
    ]);

    const normalized: RecentTransaction[] = [];

    /* ---------- EXPENSES ---------- */
    expenses.results.forEach((page: any) => {
      const props = page.properties;

      normalized.push({
        id: page.id,
        title: props.Name?.title?.[0]?.plain_text || "Expense",
        amount: -(props.Amount?.number || 0),
        type: "expense",
        date: props.Date?.date?.start || page.created_time,
      });
    });

    /* ---------- INCOME ---------- */
    income.results.forEach((page: any) => {
      const props = page.properties;

      normalized.push({
        id: page.id,
        title: props.Name?.title?.[0]?.plain_text || "Income",
        amount: props.Amount?.number || 0,
        type: "income",
        date: props.Date?.date?.start || page.created_time,
      });
    });

    /* ---------- DEBTS ---------- */
    debts.results.forEach((page: any) => {
      const props = page.properties;

      normalized.push({
        id: page.id,
        title: props.Name?.title?.[0]?.plain_text || "Debt",
        amount: -(props.Debts?.number || props.Amount?.number || 0),
        type: "debt",
        date: page.created_time,
      });
    });

    /* ---------- LOANS ---------- */
    loans.results.forEach((page: any) => {
      const props = page.properties;

      normalized.push({
        id: page.id,
        title: props.Name?.title?.[0]?.plain_text || "Loan",
        amount: props.Loan?.number || props.Amount?.number || 0,
        type: "loan",
        date: page.created_time,
      });
    });

    /* ---------- GLOBAL SORT ---------- */
    const sorted = normalized
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    recentCache = sorted;
    recentLastFetch = Date.now();

    return sorted;
  } catch (error) {
    console.error("Recent Transactions Error:", error);
    return [];
  }
}