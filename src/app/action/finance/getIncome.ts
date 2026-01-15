"use server";

import { notion } from "@/lib/notion-server";
import { revalidatePath } from "next/cache";

const INCOME_DB_ID = process.env.INCOME_DATABASE_ID!;

export async function getIncomes() {
  try {
    const response = await notion.databases.query({
      database_id: INCOME_DB_ID,
      sorts: [{ property: "Date", direction: "descending" }],
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const transactions = response.results.map((page: any) => {
      const props = page.properties;
      
      // Ambil Source (Bisa dari Select 'Source' atau Relation 'Category')
      const sourceSelect = props.Source?.select?.name;
      const sourceTitle = props.Name?.title?.[0]?.plain_text || "Unknown";
      
      // Logic penamaan Source: Jika ada tag Source pakai itu, jika tidak pakai Judul
      const sourceName = sourceSelect || "General"; 

      const dateRaw = props.Date?.date?.start;
      const dateObj = dateRaw ? new Date(dateRaw) : new Date();
      
      return {
        id: page.id,
        title: sourceTitle,
        source: sourceName,
        amount: props.Amount?.number || 0,
        date: dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        dateObj: dateObj,
        rawDate: dateRaw,
      };
    });

    // 1. Filter Data Bulan Ini
    const thisMonthData = transactions.filter(t => 
        t.dateObj.getMonth() === currentMonth && t.dateObj.getFullYear() === currentYear
    );

    // 2. Hitung Total Income Bulan Ini
    const totalIncome = thisMonthData.reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Group by Source (Untuk Breakdown Chart)
    const sourceGroup: Record<string, number> = {};
    thisMonthData.forEach(t => {
        sourceGroup[t.source] = (sourceGroup[t.source] || 0) + t.amount;
    });

    // Format Source untuk UI
    const breakdown = Object.entries(sourceGroup)
        .map(([label, amount]) => ({
            label,
            amount,
            percentage: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0
        }))
        .sort((a, b) => b.amount - a.amount); // Urutkan dari terbesar

    return { 
        success: true, 
        data: {
            transactions, // Semua history
            breakdown,    // Statistik bulan ini
            totalIncome   // Total bulan ini
        } 
    };

  } catch (error) {
    console.error("Get Income Error:", error);
    return { success: false, data: null };
  }
}

export async function deleteIncome(id: string) {
    try {
        await notion.pages.update({ page_id: id, archived: true });
        revalidatePath("/finance/income");
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}