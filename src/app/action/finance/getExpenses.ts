"use server";

import { notion, DATABASE_ID } from "@/lib/notion-server";
import { CATEGORY_IDS, PLATFORM_IDS } from "@/lib/constants";
import { revalidatePath } from "next/cache";

// --- HELPERS ---

// 1. Bersihkan tanda strip (-) dari UUID agar seragam
const normalizeId = (id: string) => id.replace(/-/g, "");

// 2. Map Terbalik: ID -> Nama Category
const ID_TO_CATEGORY = Object.entries(CATEGORY_IDS).reduce((acc, [name, id]) => {
  const cleanId = normalizeId(id); 
  acc[cleanId] = name;
  return acc;
}, {} as Record<string, string>);

// 3. Map Terbalik: ID -> Nama Platform
const ID_TO_PLATFORM = Object.entries(PLATFORM_IDS).reduce((acc, [name, id]) => {
  const cleanId = normalizeId(id);
  acc[cleanId] = name;
  return acc;
}, {} as Record<string, string>);


// --- MAIN FUNCTIONS ---

export async function getExpenses() {
  try {
    // --- LOGIC TANGGAL (2 Bulan Terakhir) ---
    // Kita ambil data dari tanggal 1 bulan lalu, agar fitur slider (Prev Month) bisa jalan.
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Format ke YYYY-MM-DD untuk filter Notion
    const startOfFilterStr = prevMonthDate.toISOString().split('T')[0]; 
    // ----------------------------------------

    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      page_size: 100, // Limit diperbesar agar data 2 bulan muat
      filter: {
        property: "Date",
        date: {
          on_or_after: startOfFilterStr, // Ambil dari awal bulan lalu sampai sekarang
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

      // 1. Resolve Category Name
      const rawCatId = props.Category?.relation?.[0]?.id;
      let categoryName = "Miscellaneous";
      if (rawCatId) {
        const cleanCatId = normalizeId(rawCatId);
        if (ID_TO_CATEGORY[cleanCatId]) {
          categoryName = ID_TO_CATEGORY[cleanCatId];
        }
      }

      // 2. Format Tanggal (Display)
      const dateRaw = props.Date?.date?.start;
      const dateObj = dateRaw ? new Date(dateRaw) : new Date();
      const formattedDate = dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });

      // 3. Hitung Breakdown Fields
      const shipping = props.Shipping?.number || 0;
      const serviceFee = props["Service Fee"]?.number || 0;
      const additionalFee = props["Additional Fee"]?.number || 0;
      const totalFee = shipping + serviceFee + additionalFee;

      return {
        id: page.id,
        title: props.Name?.title?.[0]?.plain_text || "Untitled",
        category: categoryName,
        amount: props.Amount?.number || 0,
        date: formattedDate,
        dateObj: dateObj, // Penting untuk filter client-side
        paymentMethod: props["Payment Method"]?.select?.name || "Cash",
        
        // Data tambahan untuk Breakdown UI
        subtotal: props.Subtotal?.number || 0,
        discount: props.Discount?.number || 0,
        fee: totalFee,
      };
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return { success: false, data: [] };
  }
}

export async function getExpenseById(id: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page: any = await notion.pages.retrieve({ page_id: id });
    const props = page.properties;

    // 1. Resolve Category
    const rawCatId = props.Category?.relation?.[0]?.id;
    let categoryName = "Miscellaneous";
    if (rawCatId) {
      const cleanCatId = normalizeId(rawCatId);
      if (ID_TO_CATEGORY[cleanCatId]) categoryName = ID_TO_CATEGORY[cleanCatId];
    }

    // 2. Resolve Platform
    const rawPlatId = props["Platform / Store"]?.relation?.[0]?.id;
    let platformName = "-";
    if (rawPlatId) {
      const cleanPlatId = normalizeId(rawPlatId);
      if (ID_TO_PLATFORM[cleanPlatId]) platformName = ID_TO_PLATFORM[cleanPlatId];
    }

    // 3. Format Date
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

    return {
      success: true,
      data: {
        id: page.id,
        title: props.Name?.title?.[0]?.plain_text || "Untitled",
        amount: props.Amount?.number || 0,
        category: categoryName,
        platform: platformName,
        date: fullDate,
        time: time,
        paymentMethod: props["Payment Method"]?.select?.name || "Cash",
        
        // Detail values
        subtotal: props.Subtotal?.number || 0,
        shipping: props.Shipping?.number || 0,
        serviceFee: props["Service Fee"]?.number || 0,
        additionalFee: props["Additional Fee"]?.number || 0,
        discount: props.Discount?.number || 0,
      },
    };
  } catch (error) {
    console.error("Fetch Detail Error:", error);
    return { success: false, data: null };
  }
}

export async function deleteExpense(id: string) {
  try {
    // Soft delete (archive) in Notion
    await notion.pages.update({
      page_id: id,
      archived: true,
    });
    
    revalidatePath("/finance/expenses");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: "Failed to delete" };
  }
}