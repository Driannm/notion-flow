/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { notion, INCOME_DATABASE_ID } from "@/lib/notion-server";
import { CARD_IDS } from "@/lib/constants";
import { revalidatePath } from "next/cache";

/* ======================================================
   HELPERS
====================================================== */

// Format Date ke WIB (UTC+7)
const getJakartaDate = (dateStr?: string) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  const jakartaOffset = 7 * 60 * 60 * 1000;
  const jakartaTime = new Date(date.getTime() + jakartaOffset);
  return jakartaTime.toISOString().replace("Z", "+07:00");
};

// Bersihkan strip UUID
const normalizeId = (id: string) => id.replace(/-/g, "");

// Map ID -> Nama Bank
const ID_TO_BANK = Object.entries(CARD_IDS).reduce(
  (acc, [name, id]) => {
    acc[normalizeId(id)] = name;
    return acc;
  },
  {} as Record<string, string>
);

/* ======================================================
   ADD INCOME
====================================================== */

export async function addIncome(formData: FormData) {
  const getNumber = (key: string) => {
    const val = formData.get(key);
    return val ? parseInt(val.toString()) : 0;
  };

  const name = formData.get("name") as string;
  const incomeSource = formData.get("incomeSource") as string;
  const bankAccountName = formData.get("bankAccount") as string;
  const dateStr = formData.get("date") as string;

  const amount = getNumber("amount");

  const bankId = CARD_IDS[bankAccountName];

  if (!name || !incomeSource || !bankId || amount <= 0) {
    return {
      success: false,
      message: "Semua field wajib diisi dengan benar!",
    };
  }

  try {
    const properties: any = {
      Name: { title: [{ text: { content: name } }] },
      Date: { date: { start: getJakartaDate(dateStr) } },
      "Income Source": { select: { name: incomeSource } },
      Amount: { number: amount },
      "Bank Account": { relation: [{ id: bankId }] },
    };

    await notion.pages.create({
      parent: { database_id: INCOME_DATABASE_ID },
      properties,
    });

    revalidatePath("/finance/income");

    return { success: true, message: "Income berhasil disimpan!" };
  } catch (error: any) {
    console.error("Add Income Error:", error);
    return { success: false, message: error.message };
  }
}

/* ======================================================
   GET INCOME
====================================================== */

export async function getIncome() {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const startOfYearStr = startOfYear
      .toISOString()
      .split("T")[0];

    const response = await notion.databases.query({
      database_id: INCOME_DATABASE_ID,
      page_size: 100,
      filter: {
        property: "Date",
        date: {
          on_or_after: startOfYearStr,
        },
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    const transactions = response.results.map((page: any) => {
      const props = page.properties;

      const rawBankId = props["Bank Account"]?.relation?.[0]?.id;
      let bankName = "-";

      if (rawBankId) {
        const cleanId = normalizeId(rawBankId);
        if (ID_TO_BANK[cleanId]) {
          bankName = ID_TO_BANK[cleanId];
        }
      }

      const dateRaw = props.Date?.date?.start;
      const dateObj = dateRaw ? new Date(dateRaw) : new Date();

      const formattedDate = dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });

      return {
        id: page.id,
        title: props.Name?.title?.[0]?.plain_text || "Untitled",
        source:
          props["Income Source"]?.select?.name || "Other",
        amount: props.Amount?.number || 0,
        bankAccount: bankName,
        date: formattedDate,
        dateObj,
      };
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error("Fetch Income Error:", error);
    return { success: false, data: [] };
  }
}

/* ======================================================
   GET DETAIL BY ID
====================================================== */

export async function getIncomeById(id: string) {
  try {
    const page: any = await notion.pages.retrieve({
      page_id: id,
    });

    const props = page.properties;

    // Bank
    const rawBankId =
      props["Bank Account"]?.relation?.[0]?.id;
    let bankName = "-";

    if (rawBankId) {
      const cleanId = normalizeId(rawBankId);
      if (ID_TO_BANK[cleanId]) {
        bankName = ID_TO_BANK[cleanId];
      }
    }

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
      minute: "2-digit",
    });

    return {
      success: true,
      data: {
        id: page.id,
        title:
          props.Name?.title?.[0]?.plain_text || "Untitled",
        amount: props.Amount?.number || 0,
        source:
          props["Income Source"]?.select?.name || "Other",
        bankAccount: bankName,
        date: fullDate,
        time,
      },
    };
  } catch (error) {
    console.error("Detail Income Error:", error);
    return { success: false, data: null };
  }
}

/* ======================================================
   UPDATE
====================================================== */

export async function updateIncome(
  pageId: string,
  formData: FormData
) {
  const getNumber = (key: string) => {
    const val = formData.get(key);
    return val ? parseInt(val.toString()) : 0;
  };

  const name = formData.get("name") as string;
  const incomeSource = formData.get("incomeSource") as string;
  const bankAccountName = formData.get("bankAccount") as string;
  const dateStr = formData.get("date") as string;

  const amount = getNumber("amount");

  const bankId = CARD_IDS[bankAccountName];

  if (!name || !incomeSource || !bankId || amount <= 0) {
    return {
      success: false,
      message: "Semua field wajib diisi dengan benar!",
    };
  }

  try {
    const properties: any = {
      Name: { title: [{ text: { content: name } }] },
      Date: { date: { start: getJakartaDate(dateStr) } },
      "Income Source": { select: { name: incomeSource } },
      Amount: { number: amount },
      "Bank Account": { relation: [{ id: bankId }] },
    };

    await notion.pages.update({
      page_id: pageId,
      properties,
    });

    revalidatePath("/finance/income");

    return {
      success: true,
      message: "Income berhasil diupdate!",
    };
  } catch (error: any) {
    console.error("Update Income Error:", error);
    return { success: false, message: error.message };
  }
}

/* ======================================================
   DELETE (Soft Delete)
====================================================== */

export async function deleteIncome(
  id: string
): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    await notion.pages.update({
      page_id: id,
      archived: true,
    });

    revalidatePath("/finance/income");

    return { success: true };
  } catch (error) {
    console.error("Delete Income Error:", error);
    return {
      success: false,
      message: "Failed to delete",
    };
  }
}