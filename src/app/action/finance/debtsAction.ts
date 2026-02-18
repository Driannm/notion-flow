/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { notion } from "@/lib/notion-server";
import { revalidatePath } from "next/cache";

const DEBTS_DB_ID = process.env.DEBTS_DATABASE_ID!;
const LOANS_DB_ID = process.env.LOANS_DATABASE_ID!;

// Helper: Get property name for amount field
async function getAmountPropertyName(dbId: string): Promise<string> {
  try {
    const db = await notion.databases.retrieve({ database_id: dbId });
    const props = (db as any).properties;
    
    // Check for common amount property names
    const possibleNames = ['Debts', 'Loan', 'Loans', 'Total', 'Amount', 'Jumlah'];
    for (const name of possibleNames) {
      if (props[name] && props[name].type === 'number') {
        return name;
      }
    }
    
    // Fallback: find first number property
    for (const [key, value] of Object.entries(props)) {
      if ((value as any).type === 'number') {
        return key;
      }
    }
    
    return 'Total'; // Ultimate fallback
  } catch (error) {
    console.error('Error getting amount property name:', error);
    return 'Total';
  }
}

// Helper: Get property name for paid field
async function getPaidPropertyName(dbId: string): Promise<string> {
  try {
    const db = await notion.databases.retrieve({ database_id: dbId });
    const props = (db as any).properties;
    
    // Check for common paid property names (with trailing space variations)
    const possibleNames = ['Paid ', 'Paid', 'Bayar', 'Dibayar', 'Terbayar'];
    for (const name of possibleNames) {
      if (props[name] && props[name].type === 'number') {
        return name;
      }
    }
    
    return 'Paid'; // Fallback
  } catch (error) {
    console.error('Error getting paid property name:', error);
    return 'Paid';
  }
}

// --- 1. GET DETAIL BY ID ---
export async function getDebtById(id: string) {
  try {
    const page: any = await notion.pages.retrieve({ page_id: id });
    const props = page.properties;

    // Helper retrieve number
    const getNum = (p: any) => {
      if (!p) return 0;
      if (p?.type === 'number') return p.number || 0;
      if (p?.type === 'formula') return p.formula?.number || 0;
      if (p?.type === 'rollup') return p.rollup?.number || 0;
      return 0;
    };

    // Try multiple possible property names for total amount
    const total = getNum(
      props.Debts || props.Loan || props.Loans || props.Total || props.Amount || props.Jumlah
    );
    
    // Try multiple possible property names for paid amount
    const paid = getNum(
      props["Paid "] || props["Paid"] || props.Bayar || props.Dibayar || props.Terbayar
    );
    
    // Try multiple possible property names for remaining
    const remainingProp = props.Remaining || props["Remaining "] || props.Sisa;
    let remaining = 0;
    if (remainingProp) {
      remaining = getNum(remainingProp);
    } else {
      remaining = total - paid;
    }
    
    // Try multiple possible property names for progress
    const progressProp = props.Progress || props["Progress "] || props.Persen;
    let progress = 0;
    if (progressProp) {
      const rawProgress = getNum(progressProp);
      progress = rawProgress <= 1 ? rawProgress * 100 : rawProgress;
    } else {
      progress = total > 0 ? (paid / total) * 100 : 0;
    }

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
        dueDate: dueDateRaw || new Date().toISOString(),
        purpose: props.Purpose?.rich_text?.[0]?.plain_text || "",
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
    // Dynamically get the correct property names for this database
    const amountPropName = await getAmountPropertyName(dbId);
    const paidPropName = await getPaidPropertyName(dbId);

    const properties: any = {
      Name: { title: [{ text: { content: name } }] },
      [amountPropName]: { number: total },
      [paidPropName]: { number: paid },
      "Due Date": { date: { start: dueDate } },
      Status: { status: { name: status || "Active" } },
    };

    // Add purpose only if provided
    if (purpose) {
      properties.Purpose = { rich_text: [{ text: { content: purpose } }] };
    }

    await notion.pages.create({
      parent: { database_id: dbId },
      properties,
    });

    revalidatePath("/finance/debts-loans");
    return { success: true };
  } catch (error: any) {
    console.error("Add Error:", error);
    return { success: false, message: error.message };
  }
}

// --- 3. UPDATE RECORD ---
export async function updateDebtOrLoan(id: string, formData: FormData, type: "debt" | "loan") {
  const dbId = type === "debt" ? DEBTS_DB_ID : LOANS_DB_ID;
  
  const name = formData.get("name") as string;
  const total = Number(formData.get("total"));
  const paid = Number(formData.get("paid"));
  const dueDate = formData.get("date") as string;
  const purpose = formData.get("purpose") as string;
  const status = formData.get("status") as string;

  try {
    // Dynamically get the correct property names
    const amountPropName = await getAmountPropertyName(dbId);
    const paidPropName = await getPaidPropertyName(dbId);

    const properties: any = {
      Name: { title: [{ text: { content: name } }] },
      [amountPropName]: { number: total },
      [paidPropName]: { number: paid },
      "Due Date": { date: { start: dueDate } },
      Status: { status: { name: status || "Active" } },
    };

    if (purpose) {
      properties.Purpose = { rich_text: [{ text: { content: purpose } }] };
    }

    await notion.pages.update({
      page_id: id,
      properties,
    });

    revalidatePath("/finance/debts-loans");
    revalidatePath(`/finance/debts-loans/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Update Error:", error);
    return { success: false, message: error.message };
  }
}

// --- 4. RECORD PAYMENT ---
export async function recordPayment(id: string, newPaidTotal: number, newStatus: string) {
  try {
    // Get the page first to determine which database it belongs to
    const page: any = await notion.pages.retrieve({ page_id: id });
    const dbId = page.parent.database_id;
    
    // Get the correct property name for this database
    const paidPropName = await getPaidPropertyName(dbId);

    await notion.pages.update({
      page_id: id,
      properties: {
        [paidPropName]: { number: newPaidTotal },
        Status: { status: { name: newStatus } },
      },
    });

    revalidatePath("/finance/debts-loans");
    revalidatePath(`/finance/debts-loans/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Payment Error:", error);
    return { success: false, message: error.message };
  }
}

// --- 5. DELETE RECORD ---
export async function deleteDebt(id: string) {
  try {
    await notion.pages.update({
      page_id: id,
      archived: true,
    });
    revalidatePath("/finance/debts-loans");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, message: error.message };
  }
}