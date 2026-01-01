"use server";

import { notion, DATABASE_ID } from "@/lib/notion-server";
import { CATEGORY_IDS } from "@/lib/constants";

// 1. Helper: Bersihkan tanda strip (-) dari UUID agar seragam
const normalizeId = (id: string) => id.replace(/-/g, "");

// 2. Buat Map Terbalik: ID (Tanpa Strip) -> Nama Category
// Kita pastikan key-nya bersih dari strip
const ID_TO_CATEGORY = Object.entries(CATEGORY_IDS).reduce((acc, [name, id]) => {
  const cleanId = normalizeId(id); 
  acc[cleanId] = name;
  return acc;
}, {} as Record<string, string>);

export async function getExpenses() {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
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

      // 3. Ambil Raw ID dari Notion
      const rawCatId = props.Category?.relation?.[0]?.id;
      
      let categoryName = "Miscellaneous";

      if (rawCatId) {
        // 4. PENTING: Bersihkan ID dari Notion sebelum dicari di map
        const cleanCatId = normalizeId(rawCatId);
        
        // Debugging: Cek di terminal server jika masih error
        // console.log(`Raw: ${rawCatId} -> Clean: ${cleanCatId} -> Match: ${ID_TO_CATEGORY[cleanCatId]}`);

        if (ID_TO_CATEGORY[cleanCatId]) {
          categoryName = ID_TO_CATEGORY[cleanCatId];
        }
      }

      // Format Tanggal
      const dateRaw = props.Date?.date?.start;
      const dateObj = dateRaw ? new Date(dateRaw) : new Date();
      const formattedDate = dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });

      return {
        id: page.id,
        title: props.Name?.title?.[0]?.plain_text || "Untitled",
        category: categoryName, // Sekarang harusnya sudah benar
        amount: props.Amount?.number || 0,
        date: formattedDate,
        dateObj: dateObj,
        paymentMethod: props["Payment Method"]?.select?.name || "Cash",
      };
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return { success: false, data: [] };
  }
}

import { PLATFORM_IDS } from "@/lib/constants";
import { revalidatePath } from "next/cache";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { redirect } from "next/navigation";

// Helper: Invert ID Map untuk Platform juga
const ID_TO_PLATFORM = Object.entries(PLATFORM_IDS).reduce((acc, [name, id]) => {
  const cleanId = normalizeId(id);
  acc[cleanId] = name;
  return acc;
}, {} as Record<string, string>);


export async function getExpenseById(id: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page: any = await notion.pages.retrieve({ page_id: id });
    const props = page.properties;

    // 1. Resolve Category Name
    const rawCatId = props.Category?.relation?.[0]?.id;
    let categoryName = "Miscellaneous";
    if (rawCatId) {
      const cleanCatId = normalizeId(rawCatId);
      if (ID_TO_CATEGORY[cleanCatId]) categoryName = ID_TO_CATEGORY[cleanCatId];
    }

    // 2. Resolve Platform Name
    const rawPlatId = props["Platform / Store"]?.relation?.[0]?.id;
    let platformName = "-";
    if (rawPlatId) {
      const cleanPlatId = normalizeId(rawPlatId);
      if (ID_TO_PLATFORM[cleanPlatId]) platformName = ID_TO_PLATFORM[cleanPlatId];
    }

    // 3. Format Date
    const dateRaw = props.Date?.date?.start;
    const dateObj = dateRaw ? new Date(dateRaw) : new Date();
    
    // Format: "Monday, 25 October 2023"
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
        // Detail tambahan (jika ada di notion)
        subtotal: props.Subtotal?.number || 0,
        fee: (props["Service Fee"]?.number || 0) + (props["Additional Fee"]?.number || 0) + (props.Shipping?.number || 0),
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