/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { notion } from "@/lib/notion-server";
import { revalidatePath } from "next/cache";

const CARD_DATABASE_ID = process.env.CARD_DATABASE_ID!;
const TRANSFERS_DATABASE_ID = process.env.TRANSFERS_DATABASE_ID!;

/* ============================================================
   HELPERS
============================================================ */

/** Generate title in format TRF-DD-MM e.g. TRF-23-06 */
const generateTransferTitle = (dateStr: string) => {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `TRF-${dd}-${mm}`;
};

/* ============================================================
   GET WALLET DATA (cards + transfers)
============================================================ */

export async function getWalletData() {
  /* FETCH CARDS */
  const cardResponse = await notion.databases.query({
    database_id: CARD_DATABASE_ID,
  });

  const cards = cardResponse.results.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      name: props.Name.title[0]?.plain_text || "Unnamed",
      type: props.Type.select?.name || "ATM",
      owner: props.Stackholder.multi_select[0]?.name || "-",
      balance: props["Current Balance"].formula.number || 0,
      bgColor: props["BG Color"]?.rich_text[0]?.plain_text || "#111827",
      textColor: props["Text Color"]?.rich_text[0]?.plain_text || "#FFFFFF",
    };
  });

  /* BUILD CARD MAP */
  const cardMap: Record<string, string> = {};
  cards.forEach((card) => {
    cardMap[card.id] = card.name;
  });

  /* FETCH TRANSFERS */
  const transferResponse = await notion.databases.query({
    database_id: TRANSFERS_DATABASE_ID,
    sorts: [{ property: "Date", direction: "descending" }],
  });

  const transfers = transferResponse.results.map((page: any) => {
    const props = page.properties;
    const fromId = props["From Account"].relation[0]?.id;
    const toId = props["To Account"].relation[0]?.id;
    return {
      id: page.id,
      title: props.Title?.title[0]?.plain_text || "-",
      from: cardMap[fromId] || "-",
      fromId: fromId || "",
      to: cardMap[toId] || "-",
      toId: toId || "",
      amount: props["Amount"]?.number || 0,
      fee: props["Transfers Fee"]?.number || 0,
      totalDeduction: props["Total Deduction"]?.formula?.number || 0,
      date: props.Date.date?.start || "",
    };
  });

  return { cards, transfers };
}

/* ============================================================
   GET TRANSFER BY ID
============================================================ */

export async function getTransferById(id: string) {
  try {
    /* fetch cards for relation map */
    const cardResponse = await notion.databases.query({
      database_id: CARD_DATABASE_ID,
    });
    const cardMap: Record<string, string> = {};
    cardResponse.results.forEach((page: any) => {
      cardMap[page.id] = page.properties.Name.title[0]?.plain_text || "Unnamed";
    });

    const page: any = await notion.pages.retrieve({ page_id: id });
    const props = page.properties;

    const fromId = props["From Account"].relation[0]?.id;
    const toId = props["To Account"].relation[0]?.id;
    const dateRaw = props.Date?.date?.start || "";
    const dateObj = dateRaw ? new Date(dateRaw) : new Date();

    return {
      success: true,
      data: {
        id: page.id,
        title: props.Title?.title[0]?.plain_text || "-",
        from: cardMap[fromId] || "-",
        fromId: fromId || "",
        to: cardMap[toId] || "-",
        toId: toId || "",
        amount: props["Amount"]?.number || 0,
        fee: props["Transfers Fee"]?.number || 0,
        totalDeduction: props["Total Deduction"]?.formula?.number || 0,
        date: dateRaw,
        dateFormatted: dateObj.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      },
    };
  } catch (error: any) {
    console.error("getTransferById Error:", error);
    return { success: false, data: null };
  }
}

/* ============================================================
   ADD TRANSFER
============================================================ */

export async function addTransfer(formData: FormData) {
  const fromId = formData.get("fromId") as string;
  const toId = formData.get("toId") as string;
  const amount = parseInt(formData.get("amount") as string) || 0;
  const fee = parseInt(formData.get("fee") as string) || 0;
  const dateStr = formData.get("date") as string;

  if (!fromId || !toId || amount <= 0 || !dateStr) {
    return { success: false, message: "From, To, Amount, dan Date wajib diisi." };
  }

  if (fromId === toId) {
    return { success: false, message: "From dan To tidak boleh sama." };
  }

  const title = generateTransferTitle(dateStr);

  try {
    await notion.pages.create({
      parent: { database_id: TRANSFERS_DATABASE_ID },
      properties: {
        Title: { title: [{ text: { content: title } }] },
        Date: { date: { start: dateStr } },
        "From Account": { relation: [{ id: fromId }] },
        "To Account": { relation: [{ id: toId }] },
        Amount: { number: amount },
        "Transfers Fee": { number: fee },
      },
    });

    revalidatePath("/wallet");
    return { success: true, message: "Transfer berhasil ditambahkan!" };
  } catch (error: any) {
    console.error("addTransfer Error:", error);
    return { success: false, message: error.message };
  }
}

/* ============================================================
   UPDATE TRANSFER
============================================================ */

export async function updateTransfer(pageId: string, formData: FormData) {
  const fromId = formData.get("fromId") as string;
  const toId = formData.get("toId") as string;
  const amount = parseInt(formData.get("amount") as string) || 0;
  const fee = parseInt(formData.get("fee") as string) || 0;
  const dateStr = formData.get("date") as string;

  if (!fromId || !toId || amount <= 0 || !dateStr) {
    return { success: false, message: "From, To, Amount, dan Date wajib diisi." };
  }

  if (fromId === toId) {
    return { success: false, message: "From dan To tidak boleh sama." };
  }

  const title = generateTransferTitle(dateStr);

  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        Title: { title: [{ text: { content: title } }] },
        Date: { date: { start: dateStr } },
        "From Account": { relation: [{ id: fromId }] },
        "To Account": { relation: [{ id: toId }] },
        Amount: { number: amount },
        "Transfers Fee": { number: fee },
      },
    });

    revalidatePath("/wallet");
    return { success: true, message: "Transfer berhasil diupdate!" };
  } catch (error: any) {
    console.error("updateTransfer Error:", error);
    return { success: false, message: error.message };
  }
}

/* ============================================================
   DELETE TRANSFER (soft delete)
============================================================ */

export async function deleteTransfer(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    await notion.pages.update({
      page_id: id,
      archived: true,
    });

    revalidatePath("/wallet");
    return { success: true };
  } catch (error: any) {
    console.error("deleteTransfer Error:", error);
    return { success: false, message: "Gagal menghapus transfer." };
  }
}