"use server";

import { notion } from "@/lib/notion-server";
import { revalidatePath } from "next/cache";
import { CARD_IDS } from "@/lib/constants";

const INCOME_DATABASE_ID = process.env.INCOME_DATABASE_ID!;

// Helper untuk normalize ID
const normalizeId = (id: string) => id.replace(/-/g, "");

// Map ID ke Nama Bank dari constants
const ID_TO_BANK = Object.entries(CARD_IDS).reduce((acc, [name, id]) => {
  const cleanId = normalizeId(id); 
  acc[cleanId] = name;
  return acc;
}, {} as Record<string, string>);

export async function getIncomes() {
  try {
    // Ambil data untuk 1 tahun terakhir (bukan 2 bulan)
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const startOfFilterStr = oneYearAgo.toISOString().split('T')[0];

    const response = await notion.databases.query({
      database_id: INCOME_DATABASE_ID,
      page_size: 100,
      filter: {
        property: "Date",
        date: {
          on_or_after: startOfFilterStr,
        },
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transactions = response.results.map((page: any) => {
      const props = page.properties;

      // 1. Resolve Bank Account Name
      const rawBankId = props["Bank Account"]?.relation?.[0]?.id;
      let bankAccount = "";
      if (rawBankId) {
        const cleanBankId = normalizeId(rawBankId);
        if (ID_TO_BANK[cleanBankId]) {
          bankAccount = ID_TO_BANK[cleanBankId];
        }
      }

      // 2. Format Tanggal
      const dateRaw = props.Date?.date?.start;
      const dateObj = dateRaw ? new Date(dateRaw) : new Date();

      // 3. Buat title yang meaningful
      let title = "Untitled";
      const nameFromTitle = props.Name?.title?.[0]?.plain_text;
      
      if (nameFromTitle?.trim()) {
        title = nameFromTitle;
      } else {
        const source = props["Income Source"]?.select?.name || "Income";
        const formattedDate = dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
        title = `${source} - ${formattedDate}`;
      }

      return {
        id: page.id,
        title: title,
        source: props["Income Source"]?.select?.name || "Other",
        amount: props.Amount?.number || 0,
        date: dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
        dateObj: dateObj,
        monthYear: `${dateObj.getMonth()}-${dateObj.getFullYear()}`, // Untuk grouping
        bankAccount: bankAccount,
      };
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error("Failed to fetch incomes:", error);
    return { success: false, data: [] };
  }
}

export async function getIncomeById(id: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page: any = await notion.pages.retrieve({ page_id: id });
    const props = page.properties;

    // 1. Resolve Bank Account
    const rawBankId = props["Bank Account"]?.relation?.[0]?.id;
    let bankAccount = "";
    if (rawBankId) {
      const cleanBankId = normalizeId(rawBankId);
      if (ID_TO_BANK[cleanBankId]) bankAccount = ID_TO_BANK[cleanBankId];
    }

    // 2. Format Date
    const dateRaw = props.Date?.date?.start;
    const dateObj = dateRaw ? new Date(dateRaw) : new Date();
    
    const fullDate = dateObj.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const time = dateObj.toLocaleTimeString("id-ID", {
        hour: "2-digit", 
        minute: "2-digit"
    });

    // 3. Buat title yang meaningful
    let title = "Untitled";
    const nameFromTitle = props.Name?.title?.[0]?.plain_text;
    
    if (nameFromTitle?.trim()) {
      title = nameFromTitle;
    } else {
      const source = props["Income Source"]?.select?.name || "Income";
      const formattedDate = dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      title = `${source} - ${formattedDate}`;
    }

    return {
      success: true,
      data: {
        id: page.id,
        title: title,
        amount: props.Amount?.number || 0,
        source: props["Income Source"]?.select?.name || "Other",
        bankAccount: bankAccount,
        date: fullDate,
        time: time,
      },
    };
  } catch (error) {
    console.error("Fetch Income Detail Error:", error);
    return { success: false, data: null };
  }
}

export async function deleteIncome(id: string) {
  try {
    await notion.pages.update({
      page_id: id,
      archived: true,
    });
    
    revalidatePath("/finance/income");
    return { success: true };
  } catch (error) {
    console.error("Delete Income Error:", error);
    return { success: false };
  }
}