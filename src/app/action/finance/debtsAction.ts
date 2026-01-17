/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { notion } from "@/lib/notion-server";
import { revalidatePath } from "next/cache";

const DEBTS_DB_ID = process.env.DEBTS_DATABASE_ID!;
const LOANS_DB_ID = process.env.LOANS_DATABASE_ID!;

// --- 1. GET DETAIL BY ID ---
export async function getDebtById(id: string) {
  try {
    const page: any = await notion.pages.retrieve({ page_id: id });
    const props = page.properties;

    // Helper retrieve number
    const getNum = (p: any) => {
        if(p?.type === 'number') return p.number || 0;
        if(p?.type === 'formula') return p.formula.number || 0;
        if(p?.type === 'rollup') return p.rollup.number || 0;
        return 0;
    }

    const total = getNum(props.Debts || props.Loan || props.Total || props.Amount);
    const paid = getNum(props["Paid "] || props["Paid"] || props.Bayar);
    
    // Fallback calculation
    const remaining = total - paid;
    const progress = total > 0 ? (paid / total) * 100 : 0;

    const dueDateRaw = props["Due Date"]?.date?.start;
    
    return {
      success: true,
      data: {
        id: page.id,
        name: props.Name?.title?.[0]?.plain_text || "Untitled",
        total,
        paid,
        remaining: remaining < 0 ? 0 : remaining,
        progress: progress > 100 ? 100 : progress,
        status: props.Status?.select?.name || props.Status?.status?.name || "Active",
        dueDate: dueDateRaw || new Date().toISOString(), // ISO String for input date
        purpose: props.Purpose?.rich_text?.[0]?.plain_text || "",
        // Kita tidak bisa tau ini Debt/Loan hanya dari ID tanpa query parent, 
        // tapi untuk edit data, kita hanya butuh ID dan properties.
      },
    };
  } catch (error) {
    console.error("Get Detail Error:", error);
    return { success: false, data: null };
  }
}

// --- 2. ADD NEW RECORD ---
export async function addDebtOrLoan(formData: FormData, type: "debt" | "loan") {
  const dbId = type === "debt" ? DEBTS_DB_ID : LOANS_DB_ID;
  
  const name = formData.get("name") as string;
  const total = Number(formData.get("total"));
  const paid = Number(formData.get("paid")) || 0;
  const dueDate = formData.get("date") as string;
  const purpose = formData.get("purpose") as string;
  const status = formData.get("status") as string;

  try {
    await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        Name: { title: [{ text: { content: name } }] },
        // Sesuaikan nama kolom di Notion kamu
        Debts: { number: total }, 
        "Paid ": { number: paid }, // Perhatikan spasi jika di notion ada spasi
        "Due Date": { date: { start: dueDate } },
        Status: { status: { name: status || "Active" } },
        Purpose: { rich_text: [{ text: { content: purpose || "" } }] }
      },
    });

    revalidatePath("/finance/debts-loans");
    return { success: true };
  } catch (error: any) {
    console.error("Add Error:", error);
    return { success: false, message: error.message };
  }
}

// --- 3. UPDATE RECORD ---
export async function updateDebtOrLoan(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const total = Number(formData.get("total"));
  const paid = Number(formData.get("paid"));
  const dueDate = formData.get("date") as string;
  const purpose = formData.get("purpose") as string;
  const status = formData.get("status") as string;

  try {
    await notion.pages.update({
      page_id: id,
      properties: {
        Name: { title: [{ text: { content: name } }] },
        Debts: { number: total },
        "Paid ": { number: paid },
        "Due Date": { date: { start: dueDate } },
        Status: { status: { name: status || "Active" } },
        Purpose: { rich_text: [{ text: { content: purpose || "" } }] }
      },
    });

    revalidatePath("/finance/debts-loans");
    revalidatePath(`/finance/debts-loans/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Update Error:", error);
    return { success: false, message: error.message };
  }
}

export async function recordPayment(id: string, newPaidTotal: number, newStatus: string) {
  try {
    await notion.pages.update({
      page_id: id,
      properties: {
        // Pastikan nama kolom Paid sesuai (ada spasi di akhir jika di notion ada spasi)
        "Paid ": { number: newPaidTotal }, 
        
        // 👇 PERBAIKAN DISINI: Ganti 'select' menjadi 'status'
        Status: { status: { name: newStatus } }, 
      },
    });

    revalidatePath("/finance/debts");
    return { success: true };
  } catch (error: any) {
    console.error("Payment Error:", error);
    return { success: false, message: error.message };
  }
}

// --- 4. DELETE RECORD ---
export async function deleteDebt(id: string) {
  try {
    await notion.pages.update({
      page_id: id,
      archived: true,
    });
    revalidatePath("/finance/debts-loans");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}