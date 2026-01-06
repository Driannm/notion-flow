/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { notion } from "@/lib/notion-server";

const DEBTS_DB_ID = process.env.DEBTS_DATABASE_ID!; 
const LOANS_DB_ID = process.env.LOANS_DATABASE_ID!;

export interface DebtItem {
  id: string;
  name: string;
  total: number;
  paid: number;
  remaining: number;
  progress: number;
  status: "Overdue" | "Ongoing" | "Active" | "Paid";
  dueDate: string;
  dueDateObj: Date | null;
  purpose: string;
  type: "debt" | "loan"; 
}

// Helper: Ambil angka dari berbagai tipe property
const getNumberValue = (prop: any): number => {
  if (!prop) return 0;
  if (prop.type === "number") return prop.number || 0;
  if (prop.type === "formula" && prop.formula?.type === "number") return prop.formula.number || 0;
  if (prop.type === "rollup" && prop.rollup?.type === "number") return prop.rollup.number || 0;
  return 0;
};

// Helper: Ambil status
const getStatusValue = (prop: any): string => {
  if (!prop) return "Active";
  if (prop.type === "status") return prop.status?.name || "Active";
  if (prop.type === "select") return prop.select?.name || "Active";
  return "Active";
};

async function mapNotionResult(results: any[], type: "debt" | "loan"): Promise<DebtItem[]> {
  return results.map((page: any) => {
    const props = page.properties;

    const name = props.Name?.title?.[0]?.plain_text || "Untitled";

    // 1. Ambil Total (Cek variasi nama kolom: Debts / Loan / Total / Amount)
    const totalProp = props.Debts || props.Loan || props.Total || props.Amount;
    const total = getNumberValue(totalProp);

    // 2. Ambil Paid (Cek variasi nama kolom: "Paid ", "Paid", "Bayar")
    const paidProp = props["Paid "] || props["Paid"] || props.Bayar;
    const paid = getNumberValue(paidProp);
    
    // 3. AMBIL LANGSUNG DARI FORMULA NOTION (Prioritas Utama)
    // Cek variasi nama kolom Formula: Remaining / Sisa
    let remaining = 0;
    const remainingProp = props.Remaining || props["Remaining "] || props.Sisa;
    if (remainingProp) {
        remaining = getNumberValue(remainingProp);
    } else {
        // Fallback: Hitung manual jika formula tidak terbaca
        remaining = total - paid;
    }

    // Cek variasi nama kolom Formula: Progress / Persen
    let progress = 0;
    const progressProp = props.Progress || props["Progress "] || props.Persen;
    if (progressProp) {
        // Notion Formula Progress Ring return decimal (0.5 = 50%), kadang number (50)
        // Kita normalisasi agar selalu skala 0-100
        const rawProgress = getNumberValue(progressProp);
        progress = rawProgress <= 1 ? rawProgress * 100 : rawProgress;
    } else {
        // Fallback: Hitung manual
        progress = total > 0 ? (paid / total) * 100 : 0;
    }

    // 4. Ambil Status
    const statusRaw = getStatusValue(props.Status);
    let status: any = statusRaw;
    
    if (["Lunas", "Done", "Paid", "Complete", "Selesai"].includes(statusRaw)) status = "Paid";
    // Force status Paid jika progress sudah 100% atau sisa 0 (dan total > 0)
    if (progress >= 100 || (remaining <= 0 && total > 0)) status = "Paid";
    if (!statusRaw) status = "Active";

    // 5. Format Tanggal
    const dueDateRaw = props["Due Date"]?.date?.start;
    const dueDateObj = dueDateRaw ? new Date(dueDateRaw) : null;
    const dueDateFormatted = dueDateObj 
      ? dueDateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) 
      : "-";

    return {
      id: page.id,
      name,
      total,
      paid,
      remaining: remaining < 0 ? 0 : remaining,
      progress: progress > 100 ? 100 : progress,
      status: status as any,
      dueDate: dueDateFormatted,
      dueDateObj,
      purpose: props.Purpose?.rich_text?.[0]?.plain_text || "",
      type,
    };
  });
}

export async function getDebtsAndLoans() {
  try {
    const [debtsRes, loansRes] = await Promise.all([
      notion.databases.query({ database_id: DEBTS_DB_ID }),
      notion.databases.query({ database_id: LOANS_DB_ID }),
    ]);

    const debts = await mapNotionResult(debtsRes.results, "debt");
    const loans = await mapNotionResult(loansRes.results, "loan");

    return { success: true, data: { debts, loans } };
  } catch (error) {
    console.error("Failed to fetch debts/loans:", error);
    return { success: false, data: { debts: [], loans: [] } };
  }
}